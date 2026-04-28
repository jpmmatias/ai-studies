# gen-api-playground

Minimal **Node.js** scripts (ESM) to exercise **OpenAI-compatible** chat APIs without extra dependencies.

## Setup

1. Copy `.env.example` to `.env` and add at least one key (`OPENROUTER_API_KEY` or `OPENAI_API_KEY`).
2. Ensure **Node.js 18+** (`fetch` available).

## Scripts


| Script                        | Purpose                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| `scripts/openrouter-chat.mjs` | `POST` to OpenRouter’s chat completions endpoint.               |
| `scripts/ollama-chat.mjs`     | Local Ollama OpenAI-compatible chat (no key if Ollama default). |


Run from this directory:

```bash
node scripts/ollama-chat.mjs
```

```bash
export OPENROUTER_API_KEY=sk-or-...
node scripts/openrouter-chat.mjs
```

Override model or URL if needed:

```bash
MODEL=anthropic/claude-3.5-sonnet node scripts/openrouter-chat.mjs
```

## Related notes

- English: [`fundamentals/notes-module-11-en.md`](../../fundamentals/notes-module-11-en.md) · quick ref [`gen-api-quick-ref.md`](../../fundamentals/gen-api-quick-ref.md)
- Português (pt-BR): [`fundamentals/notes-module-11.md`](../../fundamentals/notes-module-11.md) · referência rápida [`gen-api-quick-ref.pt.md`](../../fundamentals/gen-api-quick-ref.pt.md)

## Security

- Never commit `.env`.
- Prefer short-lived keys and provider dashboards for rotation.

