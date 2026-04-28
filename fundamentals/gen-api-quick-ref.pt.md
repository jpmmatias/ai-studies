# Referência rápida — APIs de IA generativa

Resumo objetivo das APIs tipo **chat** no padrão **compatível com OpenAI** `/v1/chat/completions` (também comum atrás da OpenRouter, do endpoint `/v1` do Ollama, wrappers diversos).

Versão em inglês: **`gen-api-quick-ref.md`**.

---

## Papéis (`roles`)

| Papel | Uso habitual |
|-------|----------------|
| `system` | Persona, regras, contrato de saída, instruções de grounding, esquema desejado. |
| `user` | Pedido atual; pode carregar snippets ou demos few-shot bem rotuladas. |
| `assistant` | Histórico autêntico do modelo — divergências confundem o modelo (“histórico falso”). |

**Dicas de posição:** Instruções mais críticas no **topo do `system`** ou no **final da última `user`** para reduzir o efeito *lost-in-the-middle* em conversas longas.

---

## Esqueleto JSON mínimo

```
POST …/v1/chat/completions
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "model": "<provedor>/<modelo>",
  "messages": [
    { "role": "system", "content": "…" },
    { "role": "user", "content": "…" }
  ],
  "temperature": 0.2,
  "max_tokens": 512,
  "stream": false
}
```

Em `stream:true` o cliente precisa ler **SSE** fragmentada — comportamento diferente de um JSON único.

---

## Principais parâmetros

| Campo | Intuição prática |
|-------|-------------------|
| `temperature` | Baixa para extração/formato estrito; suba para brainstorming controlado. |
| `max_tokens` | Limita comprimento máximo gerado ⇒ controla custo no pior caso. |
| `top_p` | Amostragem por núcleo — calibrar junto com `temperature`, mas variar um por vez quando medir. |
| `presence_penalty` / `frequency_penalty` | *(OpenAI específicos)* penalizam repetição lexical — intervalo típico `[-2,2]`. |
| `stop` | Para ao emitir determinadas sequências — útil como sentinela de template. |

---

## Códigos HTTP — o que costuma resolver

| Status | Provável ação |
|--------|----------------|
| 200 | Sucesso. Se existir objeto `usage`, guarde tokens entrada/saída para dashboards. |
| 400 | Conferir shape JSON atual na doc oficial — modelo errado? campo typo? formato tool inválido? |
| 401 | Chave vencida/expirada, cabeçalho `Bearer` incorreto, projeto sem billing ativo (dependendo da plataforma). |
| 429 | Respeitar `retry-after`; reduzir QPS paralelo; backoff exponencial com jitter. |
| ≥500 | Retries curtos; failover de modelo/rota (gateways como OpenRouter abstraem parte disso).

---

## Ollama local

| Item | Observação |
|------|-------------|
| Base | `http://127.0.0.1:11434` (ajuste com `OLLAMA_HOST`). |
| Compatível OpenAI | `POST /v1/chat/completions`. |
| API clássica | `POST /api/generate` com `{model, prompt,...}`. |

---

## Variáveis de ambiente (`experiments/gen-api-playground/.env.example`)

| Variável | Para quê |
|----------|-----------|
| `OPENAI_API_KEY` | API oficial OpenAI e integrações compatíveis. |
| `OPENROUTER_API_KEY` | Um token para vários modelos roteados. |
| `OLLAMA_HOST` | Servidor diferente da máquina local. |

Nunca inclua valores reais no Git.

---

## Contenção rápida de custo

| Tática | Motivo |
|--------|---------|
| Cache de respostas determinísticas repetidas | Evita repetir cobrança de tokens igual. |
| Resumo periódico do histórico | Reduz tokens de entrada em bots long-lived. |
| Menos texto bruto nos tools | Prompt mais enxuto sem perder sinal factual. |
| Avaliar antes se `entrada ≫ saída` ou o contrário | Otimizações diferem caso a caso. |

---

## Leia também

- **`fundamentals/notes-module-11.md`** — texto completo em pt-BR.  
- **`fundamentals/notes-module-11-en.md`** — texto completo em inglês.
