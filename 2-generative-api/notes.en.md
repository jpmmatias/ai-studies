# Applied AI Engineering with Generative APIs

This module is not about "calling a model and getting text back".  
It is about building AI systems you can rely on in production: architecture, state, validation, security, observability, and continuous evaluation.

---

## Introduction

In recent years, AI has become software infrastructure: strong models are available via API, speeding up prototyping and product adoption. In parallel, private investment in generative AI reached **$33.9 billion in 2024**, underscoring a phase of market consolidation and fast execution [Stanford HAI — AI Index 2025](https://hai.stanford.edu/ai-index/2025-ai-index-report/economy).

But competitive advantage is not in the API call itself.  
It is in the system around it:

- input/output contracts;
- flows with explicit state;
- risk mitigation (prompt injection, abuse, leakage);
- measurement of cost, latency, and quality.

That is the mindset of **applied AI engineering**.

---

## Chapter 1 — The AI-as-a-service market

### What we learn

The barrier to prototypes has dropped: any team can test LLM hypotheses in days. That speeds product validation but also increases competition.

Corporate adoption has also risen quickly: according to the AI Index slice, organizational use of AI and use of generative AI in business functions grew sharply between 2023 and 2024 [Stanford HAI — AI Index 2025](https://hai.stanford.edu/ai-index/2025-ai-index-report/economy).

### Main insight

A "wrapper" alone does not sustain an edge for long.  
Sustainable advantage comes from:

- deep integration into real workflows;
- proprietary data or operational know-how;
- UX tailored to the use context;
- operational reliability.

---

## Chapter 2 — Real opportunities for developers and business

### Applied AI engineer in practice

The market rewards people who turn a model into a production system:

- integrating AI with APIs, databases, queues, tools, and business rules;
- handling failure predictably;
- controlling cost per request;
- measuring quality over time.

"Prompting well" is not enough.  
You need full engineering:

- architecture;
- tests;
- security;
- observability;
- evolution driven by metrics.

### Founding engineer and career leverage

At early-stage companies, the first engineers set stack, patterns, and baseline architecture. That raises impact and risk, but also the potential for professional growth and equity.

---

## Chapter 3 — OpenRouter in practice (project foundation)

### Technical goal

Build an initial API (Node + TypeScript + Fastify) with:

- a chat endpoint with input validation;
- modular layout (config, service, server);
- local debugging and testing;
- a clear path to multi-model integration.

### Why OpenRouter here

OpenRouter standardizes access to multiple models/providers and lets you control routing via the `provider` object, including provider order, fallback, filtering, and selection policies [OpenRouter — Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection.mdx).

### Baseline best practices

- fail fast if required env vars are missing (`OPENROUTER_API_KEY`);
- commit `.env.example`, never real secrets;
- validate request payloads at the endpoint;
- keep the HTTP layer separate from LLM integration.

---

## Chapter 4 — Multi-model routing, fallback, and tests

### Routing with explicit intent

With OpenRouter you can control:

- `order` for provider priority;
- `allow_fallbacks` for automatic fallback;
- `sort` by price, latency, or throughput;
- policy filters (`zdr`, `data_collection`, `require_parameters`) [OpenRouter — Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection.mdx).

That turns a "model call" into **operational strategy**.

### Automated tests

Use endpoint tests (e.g. Fastify `inject`) to validate:

- status codes and response contract;
- metadata presence (chosen model, content);
- behavior per strategy (`price`, `latency`, `throughput`).

Note: expectations about "which model wins" change with the market. Tests should validate routing rules and the pipeline, not brittle assumptions forever.

---

## Cross-cutting — LangChain/LangGraph and stateful orchestration

LangGraph targets workflows/agents with shared state, nodes, and conditional edges, including long-running flows and explicitly controlled architecture [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph), [LangGraph Workflows and Agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents).

### What this changes in application design

You move away from a monolithic "chat" and gain:

- step decomposition;
- conditional routing;
- retry loops with limits;
- separation between decision, execution, and validation.

Outcome: a more auditable, predictable system.

---

## Cross-cutting — Memory, persistence, and context cost

Unbounded context is expensive and unstable.  
Real systems need to:

- store relevant history;
- summarize incrementally;
- pick useful context per step.

That design cuts cost and improves consistency in long flows.

---

## Cross-cutting — Security and guardrails

Prompt injection is a core risk in LLM apps. OWASP lists it as LLM01 in the 2025 Top 10, with direct impact on leakage, output manipulation, and tool misuse [OWASP GenAI — LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection), [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/).

NIST also notes there is still no "perfect" defense against adversarial attacks on AI; the path is layered mitigation and ongoing governance [NIST AI 100-2](https://csrc.nist.gov/pubs/ai/100/2/e2023/ipd).

### Recommended pattern

- classify risk before executing a tool;
- separate executor model from validator model;
- block sensitive actions with deterministic rules;
- monitor bypass attempts and abuse.

That is where AI stops being "best effort" and becomes reliable software.

---

## Cross-cutting — Multimodality and operational limits

Multimodal input (text, image, audio, documents, real-time) widens use cases but does not replace fundamentals.  
You still need:

- output contracts;
- validation;
- cost limits;
- security controls;
- end-to-end observability.

---

## Cross-cutting — Observability and evaluation

### Observability

LLM apps need tracing and per-operation cost. Langfuse covers call tracing, token usage, and cost tracking to observe production behavior [Langfuse Tracing](https://docs.langfuse.com/tracing), [Langfuse Token & Cost Tracking](https://get.langfuse.com/docs/observability/features/token-and-cost-tracking).

### Continuous evaluation

Generative models are non-deterministic, so evaluation cannot rely only on rigid asserts.  
The recommended practice is an eval pipeline with clear goals, representative datasets, and continuous scoring in the development cycle [OpenAI — Evaluation Best Practices](https://platform.openai.com/docs/guides/evaluation-best-practices), [OpenAI — Working with Evals](https://platform.openai.com/docs/guides/evals).

---

## What you built in this module

You moved from "using a model" to "systems engineering":

- structured output instead of fragile parsing;
- multi-step flows with explicit state;
- controlled fallback and retries;
- validation before sensitive actions;
- long-term memory with context control;
- secure tool integration;
- monitoring latency, tokens, and cost;
- continuous quality evaluation.

---

## Closing mindset

An LLM is a component, not a complete product.

A real AI product needs:

- architecture;
- state;
- validation;
- security;
- monitoring;
- disciplined engineering.

If that mindset sticks, you are already operating as an **Applied AI Engineer**.

---

## Sources

- [Stanford HAI — AI Index 2025 (Economy)](https://hai.stanford.edu/ai-index/2025-ai-index-report/economy) (accessed May 2026)
- [OpenRouter — Provider Routing](https://openrouter.ai/docs/guides/routing/provider-selection.mdx) (accessed May 2026)
- [OWASP GenAI — LLM01 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection) (accessed May 2026)
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/) (accessed May 2026)
- [NIST AI 100-2 — Adversarial ML Taxonomy](https://csrc.nist.gov/pubs/ai/100/2/e2023/ipd) (accessed May 2026)
- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph) (accessed May 2026)
- [LangGraph — Workflows and Agents](https://docs.langchain.com/oss/python/langgraph/workflows-agents) (accessed May 2026)
- [Langfuse — Tracing](https://docs.langfuse.com/tracing) (accessed May 2026)
- [Langfuse — Token & Cost Tracking](https://get.langfuse.com/docs/observability/features/token-and-cost-tracking) (accessed May 2026)
- [OpenAI — Evaluation Best Practices](https://platform.openai.com/docs/guides/evaluation-best-practices) (accessed May 2026)
- [OpenAI — Working with Evals](https://platform.openai.com/docs/guides/evals) (accessed May 2026)
