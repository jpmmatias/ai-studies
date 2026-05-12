# Engenharia de IA Aplicada com APIs Generativas

Este módulo não é sobre "chamar um modelo e receber texto".  
Ele é sobre construir sistemas de IA que sejam confiáveis em produção: com arquitetura, estado, validação, segurança, observabilidade e avaliação contínua.

---

## Introdução

Nos últimos anos, a IA virou infraestrutura de software: modelos fortes ficaram acessíveis por API, acelerando prototipação e adoção em produto. Em paralelo, o investimento privado em IA generativa chegou a **US$ 33,9 bilhões em 2024**, reforçando que estamos em uma fase de consolidação de mercado e execução rápida [Stanford HAI — AI Index 2025](https://hai.stanford.edu/ai-index/2025-ai-index-report/economy).

Mas o diferencial competitivo não está na chamada da API em si.  
Está no sistema ao redor:

- contrato de entrada/saída;
- fluxo com estado explícito;
- mitigação de risco (prompt injection, abuso, vazamento);
- medição de custo, latência e qualidade.

Essa é a mentalidade de **engenharia aplicada a IA**.

---

## Capítulo 1 — Panorama do mercado de IA como serviço

### O que aprendemos

A barreira para criar protótipos caiu drasticamente: qualquer time consegue testar hipóteses com LLMs em dias. Isso acelera validação de produto, mas também aumenta concorrência.

Adoção corporativa também subiu rápido: no recorte do AI Index, o uso de IA nas organizações e o uso de IA generativa em funções de negócio cresceram de forma acentuada entre 2023 e 2024 [Stanford HAI — AI Index 2025](https://hai.stanford.edu/ai-index/2025-ai-index-report/economy).

### Insight principal

"Wrapper" sozinho não sustenta vantagem por muito tempo.  
Vantagem sustentável vem de:

- integração profunda em workflow real;
- dados/protocolo operacional proprietário;
- UX orientada ao contexto de uso;
- confiabilidade operacional.

---

## Capítulo 2 — Oportunidades reais para devs e negócios

### Applied AI Engineer na prática

O mercado valoriza quem transforma modelo em sistema de produção:

- integra IA com APIs, banco, fila, ferramentas e regras de negócio;
- trata falha de forma previsível;
- controla custo por requisição;
- mede qualidade ao longo do tempo.

Não basta "promptar bem".  
É necessário entregar engenharia completa:

- arquitetura;
- testes;
- segurança;
- observabilidade;
- evolução orientada por métricas.

### Founding Engineer e alavancagem de carreira

Em empresas early-stage, o engenheiro inicial define stack, padrões e arquitetura base. Isso aumenta impacto e risco, mas também o potencial de crescimento profissional e societário.

---

## Capítulo 3 — OpenRouter na prática (base de projeto)

### Objetivo técnico

Criar uma API inicial (Node + TypeScript + Fastify) com:

- endpoint de chat com validação de entrada;
- estrutura modular (config, serviço, servidor);
- depuração e teste local;
- caminho pronto para integração multi-modelo.

### Por que OpenRouter nesse contexto

O OpenRouter permite padronizar acesso a múltiplos modelos/provedores e controlar estratégia de roteamento via `provider`, incluindo ordem de provedores, fallback, filtragem e políticas de seleção [OpenRouter — Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection.mdx).

### Boas práticas da base

- quebrar cedo se variáveis obrigatórias não existirem (`OPENROUTER_API_KEY`);
- versionar `.env.example`, nunca segredo real;
- validar payload de entrada no endpoint;
- separar camada HTTP da camada de integração com LLM.

---

## Capítulo 4 — Roteamento multi-modelo, fallback e testes

### Roteamento com intenção explícita

No OpenRouter, é possível controlar:

- `order` para prioridade de provedores;
- `allow_fallbacks` para fallback automático;
- `sort` por preço, latência ou throughput;
- filtros de política (`zdr`, `data_collection`, `require_parameters`) [OpenRouter — Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection.mdx).

Isso transforma "chamada de modelo" em **estratégia operacional**.

### Testes automatizados

Use testes de endpoint (ex.: `inject` no Fastify) para validar:

- status code e contrato de resposta;
- presença de metadados (modelo escolhido, conteúdo);
- comportamento por estratégia (`price`, `latency`, `throughput`).

Observação: expectativas sobre "qual modelo vence" mudam com o mercado. O teste deve validar regra de roteamento e pipeline, não congelar suposições frágeis para sempre.

---

## Seção transversal — LangChain/LangGraph e orquestração com estado

LangGraph é focado em workflows/agents com estado compartilhado, nós e arestas condicionais, incluindo fluxos long-running e arquitetura com controle explícito [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph), [LangGraph Workflows and Agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents).

### O que isso muda no desenho da aplicação

Você deixa de depender de um "chat monolítico" e passa a ter:

- decomposição em etapas;
- roteamento condicional;
- loop com limite de tentativa;
- separação entre decisão, execução e validação.

Resultado: sistema mais auditável e previsível.

---

## Seção transversal — Memória, persistência e custo de contexto

Contexto ilimitado é caro e instável.  
Sistemas reais precisam:

- armazenar histórico relevante;
- resumir incrementalmente;
- escolher contexto útil por etapa.

Esse desenho reduz custo e melhora consistência em fluxos longos.

---

## Seção transversal — Segurança e guardrails

Prompt injection é risco central em aplicações com LLM. O OWASP coloca isso como LLM01 no Top 10 de 2025, com impacto direto em vazamento, manipulação de saída e uso indevido de ferramentas [OWASP GenAI — LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection), [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/).

Além disso, o NIST destaca que ainda não existe defesa "perfeita" contra ataques adversariais em IA; o caminho é mitigação em camadas e governança contínua [NIST AI 100-2](https://csrc.nist.gov/pubs/ai/100/2/e2023/ipd).

### Padrão recomendado

- classificar risco antes de executar tool;
- separar modelo executor de modelo validador;
- bloquear ações sensíveis com regra determinística;
- monitorar tentativas de bypass e abuso.

Esse é o ponto onde IA deixa de ser "best effort" e vira software confiável.

---

## Seção transversal — Multimodalidade e limites operacionais

Multimodal (texto, imagem, áudio, documento, real-time) amplia casos de uso, mas não substitui fundamento.  
Você ainda precisa de:

- contrato de saída;
- validação;
- limite de custo;
- proteção de segurança;
- observabilidade ponta a ponta.

---

## Seção transversal — Observabilidade e Evaluation

### Observabilidade

Aplicações com LLM exigem tracing e custo por operação. O Langfuse cobre tracing de chamadas, token usage e cost tracking para acompanhar comportamento em produção [Langfuse Tracing](https://docs.langfuse.com/tracing), [Langfuse Token & Cost Tracking](https://get.langfuse.com/docs/observability/features/token-and-cost-tracking).

### Evaluation contínua

Modelos generativos são não determinísticos, então avaliação não pode depender só de asserts rígidos.  
A prática recomendada é pipeline de evals com objetivos claros, datasets representativos e scoring contínuo no ciclo de desenvolvimento [OpenAI — Evaluation Best Practices](https://platform.openai.com/docs/guides/evaluation-best-practices), [OpenAI — Working with Evals](https://platform.openai.com/docs/guides/evals).

---

## O que você construiu neste módulo

Você evoluiu de "uso de modelo" para "engenharia de sistema":

- saída estruturada em vez de parsing frágil;
- fluxos multi-step com estado explícito;
- fallback e retentativa controlados;
- validação antes de ação sensível;
- memória de longo prazo com controle de contexto;
- integração de tools com segurança;
- monitoramento de latência, tokens e custo;
- avaliação contínua de qualidade.

---

## Mentalidade final

LLM é componente, não produto completo.

Produto real com IA exige:

- arquitetura;
- estado;
- validação;
- segurança;
- monitoramento;
- engenharia disciplinada.

Se essa mentalidade estiver consolidada, você já está operando como **Applied AI Engineer**.

---

## Sources

- [Stanford HAI — AI Index 2025 (Economy)](https://hai.stanford.edu/ai-index/2025-ai-index-report/economy) (acesso em mai/2026)
- [OpenRouter — Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection.mdx) (acesso em mai/2026)
- [OWASP GenAI — LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection) (acesso em mai/2026)
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/) (acesso em mai/2026)
- [NIST AI 100-2 — Adversarial ML Taxonomy](https://csrc.nist.gov/pubs/ai/100/2/e2023/ipd) (acesso em mai/2026)
- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph) (acesso em mai/2026)
- [LangGraph — Workflows and Agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents) (acesso em mai/2026)
- [Langfuse — Tracing](https://docs.langfuse.com/tracing) (acesso em mai/2026)
- [Langfuse — Token & Cost Tracking](https://get.langfuse.com/docs/observability/features/token-and-cost-tracking) (acesso em mai/2026)
- [OpenAI — Evaluation Best Practices](https://platform.openai.com/docs/guides/evaluation-best-practices) (acesso em mai/2026)
- [OpenAI — Working with Evals](https://platform.openai.com/docs/guides/evals) (acesso em mai/2026)
