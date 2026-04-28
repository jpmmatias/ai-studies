# Module 11 -- Generative AI APIs & Prompt Engineering

> Notes for the chapter **APIs de IA Generativa e Prompt Engineering** — integrating **HTTP/SDK access** to large language models with **prompt design** in production-style flows.

**Related internal notes:** structured prompt patterns and anti-hallucination techniques are covered in depth in **Module 06** (`notes-module-06-en.md`). Local serving, OpenRouter, and open vs proprietary trade-offs are in **Module 09** (`notes-module-09-en.md`). RAG pipelines sit in **Module 10** (`notes-module-10-en.md`). This module ties prompt ideas to **API contracts**, **parameters**, **streaming**, **cost**, and **safe integration**.

Portuguese notes: **`notes-module-11.md`**.

---

## What this chapter covers

| Theme | You should be able to… |
|--------|-------------------------|
| **API access** | Call chat/completions-style endpoints via official SDK or `fetch`; swap **base URL** for OpenAI-compatible stacks (e.g., Ollama, OpenRouter). |
| **Messages** | Use `system` / `user` / `assistant` roles; assemble multi-turn context; place few-shot examples as explicit messages where needed. |
| **Parameters** | Choose temperature, max output tokens, top-p/`stop`; relate choices to **determinism vs creativity**, **latency**, and **cost**. |
| **Streaming** | Consume token (or chunk) streamed responses versus a single buffered JSON body; tune timeouts accordingly. |
| **Cost & limits** | Reason about billed **input + output** tokens, quotas, backoff on **429**, and truncation when context overflows. |
| **Prompt + API** | Map Module 06 structures (identity, grounding, output contract) onto real **JSON payloads**. |

---

## SDK vs raw HTTP (`fetch`)

| Approach | Strengths | Watch-outs |
|----------|-----------|-----------|
| **Official SDK** (OpenAI JS/Python, Anthropic SDK, `@google/genai`, etc.) | Typed helpers, retries, streaming parsers maintained by vendor | Version drift vs docs; heavier dependency footprint |
| **`fetch` / `curl`** | Minimal deps; easy to integrate anywhere | You own JSON shape, retries, stream parsing |

For learning and interoperability, mastering the **underlying JSON contract** pays off — many providers support the same **messages array** surface.

---

## Typical API surface (`/v1/chat/completions` pattern)

Most frontier providers expose an **OpenAI-compatible** `/v1/chat/completions` endpoint (similar shapes exist elsewhere; always confirm field names):

```json
{
  "model": "provider/model-name",
  "messages": [
    { "role": "system", "content": "You are …" },
    { "role": "user", "content": "…" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": false
}
```

**Roles in practice:**

- **`system`:** stable instructions — persona, operational rules, output contract, grounding instructions (matches “identity + contract” block in Module 06).
- **`user`:** the current instruction or question (and sometimes inline labelled examples).
- **`assistant`:** prior model replies — include **only real** assistant turns when you need conversational continuity; injecting fake assistant text changes behaviour (“fake history” debugging pattern).

Few-shot teaching can live entirely inside `system`/`user`, or alternate `user`/`assistant` exchanges that mirror genuine dialogue.

---

## Request lifecycle (mental model)

1. **Authenticate** (`Authorization` header unless local).
2. **Serialise messages** (+ optional metadata: seed, modalities, JSON mode).
3. **Provider tokenises** the prompt server-side → counts toward **input** billing and **context limits**.
4. Model **generates completion** tokens until stop condition, **`max_*`**, or natural end → **output** tokens billed separately on most clouds.
5. **Return** buffered JSON once (non-streaming) **or** open an **SSE** stream (`stream: true`).

Large inputs mean higher cost and latency; large **outputs** inflate cost even when the “thinking” is simple.

---

## Tokens: what matters for APIs

| Concept | Operational meaning |
|---------|---------------------|
| **Input tokens** | System + conversation + user prompt after tokenisation. |
| **Output tokens** | Generated answer; often capped via `max_tokens` / vendor equivalents. |
| **Context window** | Hard upper bound — exceeding it yields a **400-series** overflow error unless you summarise, trim tools, or change model. |

**Estimation:** Rough character-to-token shortcuts are imprecise; use provider **tokenisers** when optimising recurring templates. Prefer shorter **system blocks** once stable, reuse tool schemas verbatim, trim idle chat history aggressively in production bots.

---

## Parameters (interactive controls)

| Parameter | Typical effect |
|-----------|----------------|
| **`temperature`** | Higher ⇒ more stochastic; lower ⇒ sharper, more repeatable — good for deterministic extraction. |
| **`max_tokens` / vendor output cap** | Upper bound on **completion length** → caps worst-case bill and truncation risk on long answers. |
| **`top_p`** | Nucleus sampling; overlaps with temperature tuning — tune one axis at a time when profiling. |
| **`stop`** | Custom stop sequences to cut generation early (patterns, sentinel tokens in templated completions). |

Names differ slightly (**Anthropic**, **Gemini**) — always paste your provider's **minimal working example** when debugging unfamiliar 400 responses.

---

## Streaming vs non-streaming

| Mode | Behaviour | Typical use |
|------|-----------|--------------|
| **Non-stream (`stream:false`)** | Single JSON blob at end of completion | Batch jobs; simple scripting; backends that wait anyway |
| **Stream (`stream:true`)** | **Server-Sent Events** chunks with incremental deltas → assemble tokens client-side | Chat UX (“typing”), long answers, watchdog on first token |

**Operational notes:** Streams need **different timeout rules** — long “time to first token” may still precede meaningful output; handle cancellation if the client disconnects mid-stream to avoid orphaned spend.

---

## Structured / JSON-friendly outputs

When responses must parse reliably:

1. Declare **explicit format** constraints in **`system`** and repeat critical constraints tail-end of **`user`** (primacy/recency).
2. Prefer **built-in structured modes** (**JSON mode**, schema-aware decoding where offered) versus “answer in JSON prose” prompts alone.
3. Validate with **schemas** downstream (zod/Ajv equivalents) → feed targeted repair prompts instead of blindly retrying.

Structured outputs interplay with Chapter 06’s **JSON prompt** framing.

---

## Tool / function calling (high level)

Many chat APIs expose **tools** (`functions`, MCP servers, vendor-specific tool blocks). Rough flow:

1. Your code registers tool **schemas**.
2. The model may emit a **structured call** (`tool_calls`) rather than prose.
3. **You execute** sandboxed logic locally and paste results back into the conversation as **`tool`** / `function` responses (terminology differs).

This is **distinct** from hallucinating APIs — grounding tool results in code executes **truthful** lookups when orchestrated responsibly.

---

## Authentication & secrets hygiene

| Pattern | Typical context |
|---------|----------------|
| **`Authorization: Bearer <API_KEY>`** | Cloud-hosted APIs |
| **No key locally** | Ollama on `localhost` default — **not** acceptable on shared LAN without auth overlays |

Never commit plaintext keys (`git`). Use `.env`, password managers, KMS in cloud. Prefer **least-privilege keys** scoped to inference only when vendors support key policies.

Rotate keys after leakage; treat logs with full prompts as sensitive data (**PII leakage** risk).

---

## Errors and resilience patterns

| Situation | Mitigation playbook |
|-----------|---------------------|
| **429 / quota** | Exponential backoff + jitter; lower concurrency; request quota uplift; shard traffic across deployments if allowed contractually |
| **5xx / upstream** | Short retries → optional **model failover** gateway (see Module 09 / OpenRouter docs) |
| **Context-overflow** | Summarisation pass; shorten tool payloads; hierarchical retrieval (**Module 10**) |
| **`400` schema errors** | Dump minimal repro JSON; isolate field (`response_format`, wrong model id); consult provider changelog |

Structured logging: record **latency**, **`model`**, **token usage fields** when returned; avoid logging entire prompt bodies verbatim in prod.

---

## Prompt language (Portuguese ↔ English APIs)

Frontier models historically score **slightly stronger** bench tasks in English, but multilingual quality improved considerably by 2025–2026. Practical recipe:

| Situation | Suggestion |
|-----------|------------|
| Source material is PT-BR **and** factual grounding must stay verbatim | Prompt in Portuguese, keep excerpts unchanged |
| Maximising nuanced instructions + JSON schema authoring | Draft key instructions in whichever language you're fastest in, iterate in small tests |
| Reliability-critical structured extraction bilingual pipeline | Occasionally translate **task instructions**, not grounded facts, evaluate empirically on your domain |

Treat this as empirical — measure hallucination/format compliance on representative samples rather than folklore.

---

## Security / abuse notes (brief)

- **Prompt injection** via untrusted inbound text blended into prompts — treat inbound content as hostile data (`<untrusted>...</untrusted>` delimiters never sufficient alone): combine **schema validation**, retrieval boundaries, tooling allowlists.
- **Do not** pipe raw user HTML into immutable system authority blocks without sanitisation pipelines.
- For compliance environments, assess **zero data retention**, region pinning (`EU` workloads), SOC2/HIPAA program claims per vendor.

---

## Lab checklist

- [ ] Provider(s) evaluated: _______________________
- [ ] Integration style (SDK vs `fetch`): _______________________
- [ ] One **non-streaming** call succeeding end-to-end
- [ ] Optional: one **streaming** call with visible incremental tokens
- [ ] Rough **token-cost** takeaway (from dashboard or usage field)
- [ ] Controlled failure (**401**/`429`) with captured status + corrective action

---

## References (official — verify versions periodically)

| Resource | Focus |
|---------|-------|
| [OpenAI API reference](https://platform.openai.com/docs/api-reference) | Chat completions, moderation, streamed responses |
| [Anthropic Messages API](https://docs.anthropic.com/) | Tool use, multimodal payloads |
| [Google Gemini / Vertex generative docs](https://ai.google.dev/gemini-api/docs) | Multimodal, Google ecosystem |
| [OpenRouter unified API](https://openrouter.ai/docs) | Model routing/fallback ergonomics |
| [Ollama API](https://github.com/ollama/ollama/blob/main/docs/api.md) | Local dev parity |

Augment rows with lecturer slide URLs / PDF bookmark indices when provided.

---

## Quick internal map

| Topic | File |
|-------|------|
| Deep prompt scaffolding, TOON/JSON prompt patterns | `fundamentals/notes-module-06-en.md` |
| Local vs proprietary, Ollama, OpenRouter ergonomics | `fundamentals/notes-module-09-en.md` |
| Retrieval + prompt injection interplay | `fundamentals/notes-module-10-en.md` |
| One-page cheat sheet (EN / PT versions) | `fundamentals/gen-api-quick-ref.md` · `fundamentals/gen-api-quick-ref.pt.md` |
| Runnable minimal scripts | `experiments/gen-api-playground/` |
