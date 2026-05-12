# Módulo 11 — APIs de IA Generativa e Engenharia de Prompt

> Notas do capítulo **APIs de IA Generativa e Prompt Engineering**: integração via **HTTP/SDK** a grandes modelos de linguagem (**LLMs**) e desenho de **prompt** em fluxos próximos de produção.

**Notas internas relacionadas:** padrões de prompt estruturado e técnicas anti-alucinação estão detalhados no **Módulo 06** (`notes-module-06-en.md`). Execução local, OpenRouter e aberta vs proprietária no **Módulo 09** (`notes-module-09-en.md`). Pipeline RAG no **Módulo 10** (`notes-module-10-en.md`). Este módulo liga conceitos de prompt a **contratos de API**, **parâmetros**, **streaming**, **custo** e **integração segura**.

Versão em inglês: **`notes-module-11-en.md`**.

---

## O que o capítulo cobre

| Tema | Objetivo |
|------|----------|
| **Acesso à API** | Chamar endpoints tipo `chat/completions` por SDK oficial ou `fetch`; trocar **base URL** em stacks compatíveis com OpenAI (ex.: Ollama, OpenRouter). |
| **Messages** | Usar papéis `system` / `user` / `assistant`; montar contexto multi-turn; few-shot como mensagens explícitas. |
| **Parâmetros** | Escolher `temperature`, limites de saída, `top_p` / `stop`; relacionar **determinismo vs criatividade**, **latência** e **custo**. |
| **Streaming** | Consumir deltas em fluxo versus JSON único; afinar timeouts. |
| **Custo e limites** | Raciocinar sobre tokens de **entrada + saída**, quotas, **backoff** em **429**, truncagem ao estourar contexto. |
| **Prompt + API** | Mapear blocos do Módulo 06 (identidade, fonte da verdade, contrato de saída) para **payload JSON** real. |

---

## SDK vs HTTP puro (`fetch`)

| Abordagem | Pontos fortes | Cuidados |
|-----------|---------------|----------|
| **SDK oficial** (OpenAI JS/Python, Anthropic, `@google/genai`, …) | Tipagem, retries, parsers de streaming mantidos pelo fornecedor | Versão pode divergir da doc; dependência maior |
| **`fetch` / `curl`** | Dependência mínima; encaixa em qualquer runtime | Você implementa formato JSON, retries, parsing de stream |

Dominar o **contrato JSON** vale em qualquer stack — vários provedores expõem o mesmo padrão de **array `messages`**.

---

## Superfície típica (`/v1/chat/completions`)

Provedores “frontier” costumam seguir formato **compatível com OpenAI** para `/v1/chat/completions` (valide nomes por documentação):

```json
{
  "model": "provedor/nome-do-modelo",
  "messages": [
    { "role": "system", "content": "Você é …" },
    { "role": "user", "content": "…" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false
}
```

**Papéis:**

- **`system`:** instruções estáveis — persona, regras operacionais, contrato de saída (ecoa blocos identidade/contrato do Módulo 06).
- **`user`:** pedido atual (e por vezes exemplos embutidos).
- **`assistant`:** respostas anteriores do modelo — só histórico **real** para continuidade; histórico “inventado” altera comportamento.

Few-shot pode viver dentro de `system`/`user` ou em alternância explícita `user`/`assistant`.

---

## Ciclo mental de uma requisição

1. **Autenticar** (cabeçalho `Authorization`, salvo servidor local protegido).
2. **Serializar** mensagens (+ metadados: seed, formato JSON esquematizado…).
3. Provedor **tokeniza** o prompt ⇒ conta como **entrada** e conta para limite de **contexto**.
4. O modelo **gera** tokens de conclusão até parada/`max_*` ⇒ **saída** faturada à parte na maioria dos clouds.
5. **Resposta** JSON completa (**não streaming**) ou **fluxo SSE** (`stream: true`).

Prompts grandes encarecem e atrasam; saídas longas aumentam custo mesmo quando a “ideia central” parece trivial.

---

## Tokens na prática de API

| Conceito | Efeito operacional |
|---------|---------------------|
| **Tokens de entrada** | Todo o texto que vai em `messages` depois da tokenização. |
| **Tokens de saída** | Texto gerado; limitado por `max_tokens` ou equivalentes. |
| **Janela de contexto** | Tamanho máximo — estourar causa erro de overflow (tipicamente 4xx); soluções: resumir, cortar ferramentas, mudar modelo, RAG hierárquico. |

Para otimização recorrente, use tokenizadores oficiais; heurísticas só por caracteres são **imprecisas**. Prompts curtos bem desenhados vencem repetir texto enorme só “por garantia”.

---

## Parâmetros (knobs úteis)

| Parâmetro | Efeito típico |
|-----------|---------------|
| **`temperature`** | Mais alto ⇒ mais variação; mais baixo ⇒ mais determinístico — útil em extrações rígidas. |
| **`max_tokens`** (ou campo equivalente da API) | Teto na **saída** ⇒ limita o custo máximo esperado e respostas muito longas. |
| **`top_p`** | Amostragem por núcleo; sobra com temperatura — ajustar um de cada vez quando medir comportamento. |
| **`stop`** | Sequências que encerram a geração cedo — comum em templates com sentinelas. |

Nomes diferem (**Anthropic**, **Gemini**). Em erro **400**, confira payload mínimo no changelog do provedor.

---

## Streaming vs não streaming

| Modo | Comportamento | Uso típico |
|------|---------------|-----------|
| **`stream:false`** | JSON final completo só no fim | Jobs batch; scripts síncronos |
| **`stream:true`** | Chunks SSE com deltas ⇒ montar texto aos poucos | Chat com feedback “digitando”; respostas longas |

**Streams** precisam de política própria de **timeout**: “time-to-first-token” pode ser alto; cancele no servidor quando o cliente cair para não gastar em vão.

---

## Saídas JSON / estruturadas

1. Declare formato em **`system`** e reforce no final da **`user`** (primazia/recência).
2. Prefira **modos estruturados nativos** (JSON modo, constrained decoding onde existir).
3. Valide downstream com **schema** → loops de correção curtos em caso de falha de parse.

Isto casa com os padrões **JSON Prompt** descritos no Módulo 06.

---

## Tool / chamada de função (panorama)

Fluxo resumido:

1. Você registra **schemas** de ferramentas permitidas.
2. O modelo pode emitir **`tool_calls`** estruturados em vez de prosa só.
3. **Você executa** código controlado **localmente**, devolvendo resultado na conversa nos papéis `tool`/função esperados pela API.

Diferente de “inventar API” só no texto — o ganho factual vem quando a ferramenta executa código **verificável**.

---

## Autenticação e secrets

| Padrão | Contexto |
|--------|-----------|
| **`Authorization: Bearer <API_KEY>`** | APIs hospedadas |
| **Sem chave local** | Ollama default em localhost — endureça se a rede não for apenas sua máquina |

Nunca commite `.env`; use secret stores em CI produção e rotações após incidente. Logs com payload completo = risco **LGPD**/PII.

---

## Erros e resiliência

| Situação | Resposta típica |
|----------|-----------------|
| **429** | Backoff exponencial + jitter; menos paralelismo; pedir aumento de quota |
| **5xx** | Retries curtos; failover de modelo através de gateway (vide OpenRouter, Módulo 09) |
| **Overflow de contexto** | Resumo de história; payloads de ferramenta menores; RAG (Módulo 10) |
| **400 formato** | Repro minimal; comparar exemplo oficial doc vs seu JSON |

Registrar **latência**, **`model`** e **usage**/tokens quando a API devolver — evitar registrar prompt integral em prod.

---

## Idioma do prompt (PT-BR × EN)

Qualidade multilingual melhorou; ainda assim, **meça sempre no seu domínio**:

| Caso | Sugestão |
|------|-----------|
| Grounding obrigatório em PT-BR | Mantém citações e termos jurínicos/técnicos no idioma-fonte |
| Instruções longas ou JSON schema inglês forte | Experimente EN nas instruções (não nos factos brutos); compare métricas de formato/facto |

Não há mandamento universal — A/B factual no dataset local.

---

## Segurança (resumo)

- **Prompt injection:** texto externo tratado como dado não confiável — delimiters sozinhos não bastam; combine validação estrutural, menos privilégio em ferramentas, filtros onde couber.
- **Conformidade:** confirme ofertas específicas (retenção zero, soberania de dados/região EU) quando houver obrigações legais reais atrás do projeto.

---

## Checklist prático da aula

- [ ] Provedor(es) testados: _____________________
- [ ] Estilo SDK vs `fetch`: _____________________
- [ ] Chamada **sem streaming** concluída
- [ ] Opcional: **streaming** com tokens visíveis
- [ ] Nota rápida de **custo** / usage
- [ ] Falha esperada (**401**/ **429**) com plano documentado de correção

---

## Referências oficiais (validar período)

| Recurso | Foco |
|---------|------|
| [OpenAI API](https://platform.openai.com/docs/api-reference) | Chat, moderação, streaming |
| [Anthropic Messages](https://docs.anthropic.com/) | Tools multimodais conforme modelo |
| [Gemini API / Vertex AI](https://ai.google.dev/gemini-api/docs) | Ecosistema Google atual |
| [OpenRouter docs](https://openrouter.ai/docs) | Routing + fallbacks |
| [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md) | Dev local compatível |

Complementar com PDF/slides quando o instrutor distribuir URLs internas ou timbrados institucionalmente.

---

## Mapa interno rápido

| Tópico | Arquivo |
|--------|----------|
| Prompt em blocos, TOON | `fundamentals/notes-module-06-en.md` |
| Ollama, OpenRouter, licenças | `fundamentals/notes-module-09-en.md` |
| RAG contexto ⇒ prompt | `fundamentals/notes-module-10-en.md` |
| Referência rápida EN / PT-BR | `fundamentals/gen-api-quick-ref.md` · `fundamentals/gen-api-quick-ref.pt.md` |
| Scripts mínimos | `experiments/gen-api-playground/` |
