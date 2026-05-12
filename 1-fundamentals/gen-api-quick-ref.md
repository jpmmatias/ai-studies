# Generative AI APIs — quick reference

Compact reminders for **chat-style** APIs that follow an **OpenAI-compatible** `/v1/chat/completions` shape (also common behind OpenRouter, Ollama’s `/v1` bridge, wrappers).

Portuguese (**pt-BR**): **`gen-api-quick-ref.pt.md`**.

---

## Roles

| Role | Typical responsibility |
|------|-----------------------|
| `system` | Persona, behavioural contract, grounding instructions, schemas. |
| `user` | Current task/query; may embed snippets or labelled few-shot demos. |
| `assistant` | Historical assistant outputs — keep truthful to avoid deceptive conditioning. |

**Placement tip:** Highest-signal directives → **top of `system`** or **closing lines of final `user` turn** — mitigates *lost-in-the-middle* on long chats.

---

## Minimal JSON skeleton

```
POST …/v1/chat/completions
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "model": "<provider>/<model>",
  "messages": [
    { "role": "system", "content": "…" },
    { "role": "user", "content": "…" }
  ],
  "temperature": 0.2,
  "max_tokens": 512,
  "stream": false
}
```

Streaming changes client handling — deltas arrive as SSE fragments.

---

## Key generation knobs

| Field | Cheat-sheet intuition |
|------|-----------------------|
| `temperature` | Low for extraction / classifications; moderate for exploratory drafting. |
| `max_tokens` | Hard cap on billed completion length → bound worst-case cost. |
| `top_p` | Often tweaked alongside temperature — move one knob at a time when profiling. |
| `presence_penalty` / `frequency_penalty` | OpenAI-only extras that reduce verbatim repetition (`[-2,2]`). |
| `stop` | Ends generation once any listed sequence emits — template sentinels. |

---

## HTTP status playbook

| Status | Typical fix |
|--------|-------------|
| 200 | Parse JSON (or SSE when streaming). Inspect `usage` if present for token accounting |
| 400 | Validate payload against latest docs — wrong nested fields, malformed tool schema |
| 401 | Recreate/regenerate leaked API keys; check header spelling (`Bearer`). |
| 429 | Respect `retry-after`; exponential backoff |
| ≥500 | Short backoff retrials → optional failover route / circuit breaker |

---

## Ollama (local workstation)

| Item | Defaults / notes |
|------|------------------|
| Base URL | `http://127.0.0.1:11434` |
| OpenAI-compat | `POST /v1/chat/completions` |
| Classic generate | `POST /api/generate` with `{model,prompt,...}` |

Set `OLLAMA_HOST` only when exposing non-local endpoints intentionally.

---

## Environment variables (`experiments/gen-api-playground/.env.example`)

| Variable | Typical usage |
|---------|---------------|
| `OPENAI_API_KEY` | Direct OpenAI and many forks expecting that header verbatim |
| `OPENROUTER_API_KEY` | Unified router key |
| `OLLAMA_HOST` | Non-default daemon location |

Never commit plaintext secrets.

---

## Cost controls (fast wins)

| Tactic | Rationale |
|--------|-----------|
| Cache stable answers | Repeated deterministic translations / boilerplate ⇒ avoid repeated spend |
| Summarise long histories | Drops input tokens radically on chat bots |
| Truncate bulky tool payloads | Sends slimmer grounding into the LM |
| Pre-token estimate hot templates once | Helps spot creeping prompt bloat before deploy |

Pricing almost always distinguishes **prompt vs completion** token counts → optimising whichever dominates your workload matters.

---

## See also

- Full notes (EN): `fundamentals/notes-module-11-en.md`
- Full notes (pt-BR): `fundamentals/notes-module-11.md`
