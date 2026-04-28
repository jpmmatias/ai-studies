# Module 11 -- Generative AI APIs & Prompt Engineering

> Notes for the chapter **APIs de IA Generativa e Prompt Engineering** — integrating **HTTP/SDK access** to large language models with **prompt design** in production-style flows.

**Related internal notes:** structured prompt patterns and anti-hallucination techniques are covered in depth in **Module 06** (`notes-module-06-en.md`). Local serving, OpenRouter, and open vs proprietary trade-offs are in **Module 09** (`notes-module-09-en.md`). This module ties those ideas to **API contracts**, **parameters**, and **operational concerns** (keys, limits, cost, errors).

---

## What this chapter covers

| Theme | You should be able to… |
|--------|-------------------------|
| **API access** | Call chat/completions-style endpoints via official SDK or `fetch`; configure base URL for OpenAI-compatible stacks (e.g., Ollama, OpenRouter). |
| **Messages** | Use `system` / `user` / `assistant` roles; assemble multi-turn context; inject few-shot examples in message form. |
| **Parameters** | Choose temperature, max tokens (or equivalents), top-p/stop where relevant; relate choices to determinism vs creativity and cost. |
| **Streaming** | Recognise streamed vs buffered responses and how they affect UX and timeouts. |
| **Cost & limits** | Reason about billed tokens, quotas, retries on 429, and truncation. |
| **Prompt + API** | Map Module 06 patterns (roles, grounding, output format) onto real request payloads. |

---

## Typical API surface

Most frontier providers expose an **OpenAI-compatible** `/v1/chat/completions` (or equivalent) accepting:

```json
{
  "model": "provider/model-name",
  "messages": [
    { "role": "system", "content": "You are …" },
    { "role": "user", "content": "…" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

**System message:** stable instructions, tone, and safety/operational rules (maps to “identity + contract” in Module 06).  
**User / assistant turns:** conversation history and the current ask.

---

## Authentication

| Pattern | Where it appears |
|---------|------------------|
| **Bearer token** | `Authorization: Bearer <API_KEY>` on each request (OpenAI, Anthropic-style wrappers, OpenRouter, many others). |
| **Local / no cloud key** | Ollama on `localhost` often needs no key for dev; tighten for shared networks. |

**Never commit keys.** Use `.env` (gitignored) and CI secrets. For example variable names, see `experiments/gen-api-playground/.env.example`.

---

## Parameters (high level)

| Parameter | Typical effect |
|-----------|----------------|
| **temperature** | Higher → more diverse; lower → more focused/deterministic. |
| **max_tokens** (or vendor-specific max output) | Caps completion length → caps cost and truncation risk. |
| **top_p** | Nucleus sampling; often tuned together with temperature. |
| **stop** | Sequences that end generation early ( useful for templated outputs). |

Exact names and defaults differ by vendor; always check the provider’s current docs.

---

## Structured / JSON-friendly outputs

When the lesson requires machine-parseable replies:

- Ask explicitly for JSON in **system** + **user** blocks (aligned with Module 06 “output format”).
- Many APIs offer **JSON mode** or schema-constrained decoding when available — prefer those over “please output JSON” alone when reliability matters.

---

## Errors and resilience

| Situation | Practical response |
|-----------|-------------------|
| **429 / rate limit** | Exponential backoff; reduce concurrency; cache repeated queries. |
| **5xx** | Retry with backoff; consider model fallback (see OpenRouter in Module 09). |
| **Context too long** | Summarise history, retrieve less text (RAG in Module 10), or use a larger-context model. |

---

## Lab checklist (fill in during class)

- [ ] Provider(s) used: _______________________
- [ ] Base URL / SDK: _______________________
- [ ] One **non-streaming** call completed successfully.
- [ ] One **streaming** call observed (if applicable).
- [ ] Documented **approximate token/cost** or free-tier limits.
- [ ] One failure handled intentionally (e.g., wrong key or rate limit) and note what the API returned.

---

## References (add your course/slide links)

- OpenAI — API reference: [platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)
- Anthropic — Messages API: [docs.anthropic.com](https://docs.anthropic.com/)
- Google — Generative AI on Vertex / Gemini (see current Google Cloud docs for your course version)
- OpenRouter — unified API: [openrouter.ai/docs](https://openrouter.ai/docs)
- Ollama — API: [github.com/ollama/ollama/blob/main/docs/api.md](https://github.com/ollama/ollama/blob/main/docs/api.md)

---

## Quick internal map

| Topic | File |
|-------|------|
| Prompt blocks, TOON/JSON prompts | `fundamentals/notes-module-06-en.md` |
| Ollama, OpenRouter, model choice | `fundamentals/notes-module-09-en.md` |
| RAG and context injection | `fundamentals/notes-module-10-en.md` |
| One-page API cheat sheet | `fundamentals/gen-api-quick-ref.md` |
| Runnable minimal examples | `experiments/gen-api-playground/` |
