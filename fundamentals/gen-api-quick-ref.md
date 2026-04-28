# Generative AI APIs — quick reference

Compact reminder for **chat-style** HTTP APIs (OpenAI-compatible pattern common across OpenRouter, Ollama `/v1`, many SDKs).

---

## Roles


| Role        | Typical use                                               |
| ----------- | --------------------------------------------------------- |
| `system`    | Persona, rules, output contract, grounding instructions.  |
| `user`      | Current question or task (and sometimes inline examples). |
| `assistant` | Prior model turns — include for multi-turn context.       |


**Tip:** Critical rules → start of **system** **or** end of **user** (primacy/recency).

---

## Request sketch (JSON)

```
POST …/chat/completions
Authorization: Bearer <API_KEY>
Content-Type: application/json

{
  "model": "<provider>/<model>",
  "messages": [ … ],
  "temperature": 0.2,
  "max_tokens": 512,
  "stream": false
}
```

---

## Common HTTP codes


| Code    | Meaning / action                                          |
| ------- | --------------------------------------------------------- |
| 200     | Success.                                                  |
| 400     | Bad payload — check schema, model id, malformed messages. |
| 401     | Invalid or missing API key.                               |
| 429     | Rate limit — back off and retry.                          |
| 500–503 | Provider error — retry, try fallback model.               |


---

## Ollama (local dev)


| Item               | Default                                      |
| ------------------ | -------------------------------------------- |
| Base URL           | `http://127.0.0.1:11434`                     |
| OpenAI-compat path | Often `/v1/chat/completions`                 |
| Raw generate       | `/api/generate` with `{ "model", "prompt" }` |


---

## Env vars (see `experiments/gen-api-playground/.env.example`)


| Variable             | Used for                                       |
| -------------------- | ---------------------------------------------- |
| `OPENAI_API_KEY`     | Official OpenAI and many OpenAI-shaped clients |
| `OPENROUTER_API_KEY` | OpenRouter gateway                             |
| `OLLAMA_HOST`        | Optional override when not on localhost        |


---

## Cost mindset

- Charges usually track **input + output** tokens (pricing tables are per-provider).
- Truncating **system**, **few-shot**, and **history** lowers recurring cost.
- Repeated identical calls → cache deterministic answers outside the LLM when possible.

