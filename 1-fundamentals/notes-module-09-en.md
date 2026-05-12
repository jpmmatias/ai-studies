# Module 09 -- Open-Source vs. Proprietary Models

> Notes on chapters covering the **trade-offs between open and closed models**, **running models locally with Ollama**, and **orchestrating multiple models with OpenRouter**.

---

# Chapter 1: Advantages and Disadvantages of Open and Closed Models

## What does "open" really mean?

In the LLM world, "open" rarely means the same as in traditional open-source software. The spectrum ranges from fully proprietary to fully open:

| Level | What is shared | Examples |
|-------|---------------|----------|
| **Proprietary** | Nothing — API access only | GPT-4/5, Claude, Gemini |
| **Open weights** | Model weights downloadable, but training pipeline and data are not shared | LLaMA, Gemma |
| **Open source** | Weights, training code, data pipeline, and documentation | Some BLOOM variants |

Sites like **ollama.com** offer one-command downloads: `ollama pull llama3` gives you a model that runs locally, even offline. Some models are labelled "uncensored," allowing more unrestricted exploration.

---

## Key open-weight models (2025–2026)

| Model | Parameters | Strengths | Licence |
|-------|-----------|-----------|---------|
| **LLaMA 4** (Meta) | Up to 405 B (Scout/Maverick) | 10 M token context, broad capability | Llama Community Licence |
| **DeepSeek R1** | 671 B MoE (37 B active) | AIME 79.8%, HumanEval 92.7%, trained for ~$8.2 M | **MIT** (fully permissive) |
| **Qwen 3** (Alibaba) | 235 B MoE | AIME25 92.3%, HumanEval 88.5% | **Apache 2.0** |
| **Mistral** | Various sizes | Balanced performance, EU compliance | Apache 2.0 (some variants require paid licence at scale) |
| **Gemma** (Google) | Smaller sizes | Good for fine-tuning and research | Custom (more restrictive) |

### The quality gap has narrowed

As of early 2026, open-source models score **68/73** on composite quality benchmarks versus proprietary leaders at **73/73** — a 5-point gap, down from 12 points in early 2025.

---

## Key proprietary models (2025–2026)

| Model | Key strengths | Notable benchmarks |
|-------|--------------|-------------------|
| **GPT-5/5.4** (OpenAI) | Breadth, agentic workflows, Codex integration | AIME 100% (Pro), SWE-bench 74.9% |
| **Claude Sonnet 4.5/4.6** (Anthropic) | 1 M context, coding excellence, strong instruction following | SWE-bench 74.5% |
| **Gemini 3 Pro** (Google) | Multimodal, "Deep Think" reasoning, infrastructure integration | Leading in business operations |

---

## Licensing differences

| Licence | Commercial use | Key restriction |
|---------|---------------|-----------------|
| **Apache 2.0** (Qwen, some Mistral) | Unrestricted | None — "gold standard" for open AI |
| **MIT** (DeepSeek R1) | Unrestricted | None |
| **Llama Community** (Meta) | Yes, but companies with > 700 M MAU need a separate Meta licence | Cannot use outputs to train competing models |
| **Gemma** (Google) | Yes, with restrictions | Cannot use outputs to train other models |

---

## Cost comparison

| Model | Input / Output per 1 M tokens |
|-------|-------------------------------|
| Mistral Small 3.2 | $0.06 / $0.18 |
| DeepSeek V3.2 | $0.28 / $0.42 |
| Llama 4 Maverick | $0.27 / $0.85 |
| GPT-5.4 | $2.50 / $15.00 |

Open-source delivers roughly **85% cost savings** at similar quality for many tasks. Self-hosting Llama 3.3 70B on 2× A100 GPUs runs at ~$0.12/M tokens.

---

## Advantages of open models

- **Cost:** free inference for local execution; dramatically cheaper via API.
- **Privacy and control:** data never leaves your infrastructure.
- **Customisation:** fine-tune, create specialised variants, integrate without external limitations.
- **Independence:** no vendor lock-in; no sudden pricing or policy changes.
- **Transparency:** weights can be inspected and audited.

## Disadvantages of open models

- **Infrastructure cost:** powerful GPUs, cooling, energy, monitoring.
- **Maintenance complexity:** updates, compatibility, security, and scalability are your responsibility.
- **Legal nuance:** licences like Llama Community restrict certain commercial uses.
- **No filters by default:** "uncensored" models can generate inappropriate content — requires governance.
- **Capability gap:** the 5-point benchmark gap means complex reasoning and tool-calling still favour proprietary models.

---

## Advantages of proprietary models

- **Best-in-class quality:** frontier models lead on complex multi-step reasoning.
- **Ease of use:** a single API key to start; infrastructure and updates handled by the provider.
- **Guaranteed scalability:** serve millions of users without managing infrastructure.
- **Support and stability:** commercial SLAs, security certifications, legal compliance.

## Disadvantages of proprietary models

- **High cost:** 10–36× more expensive than open alternatives.
- **Vendor lock-in:** dependent on provider decisions.
- **Data leaves your control:** prompts and data sent to external servers.
- **No customisation of weights:** cannot fine-tune or specialise.
- **Rate limits and quotas.**

---

## Choosing the right approach

> Neither path is universally better. The secret is knowing the limits and benefits of each and choosing what aligns with your technical, financial, and legal context.

| Scenario | Recommended |
|----------|-------------|
| Prototyping, local testing, personal study | Open models (local) |
| Enterprise with compliance and SLA needs | Proprietary models |
| Data-sensitive applications | Open models (on-premise) |
| Cutting-edge reasoning tasks | Proprietary models |
| Cost-sensitive production at scale | Open models via API (or self-hosted) |
| Quick integration, small team | Proprietary models |

---

# Chapter 2: Running Models Locally with Ollama

## What is Ollama?

**Ollama** is an open-source application (macOS, Windows, Linux) that wraps **llama.cpp** in a user-friendly CLI and HTTP server. It handles model downloading, quantisation, memory management, and inference — letting you run LLMs locally with simple commands.

---

## Key commands

| Command | Description |
|---------|-------------|
| `ollama pull <model>` | Download a model from the library |
| `ollama run <model>` | Start interactive chat (`/bye` to exit) |
| `ollama run <model> "<prompt>"` | Single one-shot prompt |
| `ollama serve` | Start HTTP server at `localhost:11434` |
| `ollama list` | Show installed models with sizes |
| `ollama ps` | Show currently loaded/running models |
| `ollama show <model>` | Display model metadata and quantisation |
| `ollama create <name> -f <Modelfile>` | Create a custom model |
| `ollama rm <model>` | Delete a model |
| `ollama stop <model>` | Unload a model from memory |

---

## Parameters, context, and quantisation

### Parameters

Represent the model's **weights** — what it learned during training. More parameters generally mean greater capability but also greater hardware demands. Examples: 7 B (billion), 20 B, 70 B, 120 B.

### Context size

Defines how many **tokens** can be processed per interaction. Examples: 4K, 32K, 128K, or even 1 M tokens. Larger context consumes more memory.

### Quantisation

The process of **reducing model precision** from 16-bit floats (FP16) down to 4–5 bits, shrinking the model and speeding up inference with a slight quality trade-off.

Models are stored in **GGUF format** (GGML Universal Format) — a single file containing weights, metadata, tokeniser config, and hyperparameters optimised for CPU/local inference.

| Level | Quality | Size (7 B model) | Use case |
|-------|---------|------------------|----------|
| FP16 | Full precision | ~14 GB | Reference quality |
| Q8_0 | Near-original | ~7.5 GB | When quality is critical |
| Q6_K | Very good | ~5.5 GB | Balanced |
| Q5_K_M | Good | ~5 GB | Balanced |
| **Q4_K_M** | **Good (sweet spot)** | **~4 GB** | **Recommended default** |
| Q3_K | Degraded | ~3 GB | Constrained hardware |
| Q2_K | Severe loss | ~2.5 GB | Extremely limited hardware |

Suffixes like `Q4F32__1` indicate quantisation schemes (e.g., weights in 4 bits, activations in 32 bits). A 20 B model can run with only 16 GB RAM when properly quantised.

---

## HTTP API and OpenAI compatibility

Ollama exposes an HTTP API at `localhost:11434`, enabling integration with any system via `curl`, scripts, or SDKs:

```bash
curl http://localhost:11434/api/generate \
  -d '{"model": "llama3", "prompt": "What is backpropagation?", "stream": false}'
```

The API is **compatible with the OpenAI format**, so existing applications can be ported by changing only the base URL:

```bash
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## Integration with editors

The **Continue** extension for VS Code/Cursor connects to Ollama as a free, open-source AI coding assistant:

- Chat sidebar and tab autocomplete (ghost text).
- Configure via `~/.continue/config.json` pointing to `http://localhost:11434`.
- Recommended setup: small model for autocomplete (e.g., `qwen2.5-coder:1.5b`), larger for chat (`llama3:8b`).

Ollama also integrates with **LangChain**, **LlamaIndex**, **Open WebUI**, **LibreChat**, and any OpenAI-compatible tool.

---

## Limitations

| Limitation | Detail |
|------------|--------|
| No true concurrency | Serialises requests — processes one at a time, queuing others |
| Not production-ready | Single-user local workloads only; under load: latency spikes, OOM crashes |
| Hardware-dependent | Quality depends on local GPU/RAM; minimum 8 GB RAM (16 GB recommended) |
| No continuous batching | The underlying llama.cpp supports it, but Ollama has not integrated it |

For production serving, tools like **vLLM** are more appropriate.

---

## Jan AI: a desktop GUI alternative

**Jan** is a free, open-source desktop application for running local LLMs, with a ChatGPT-like interface:

| Aspect | Jan | Ollama |
|--------|-----|--------|
| Interface | Desktop GUI | CLI-first |
| Best for | Non-technical users, privacy focus | Developers, API integration |
| API | OpenAI-compatible at `localhost:1337/v1` | OpenAI-compatible at `localhost:11434` |
| Features | Assistants, history, vector DB, file system, MCP support | Model management, HTTP API |

---

# Chapter 3: Using OpenRouter to Orchestrate Multiple Models

## Why use an orchestrator?

Managing multiple AI providers simultaneously creates chaos: diverse API keys, SDKs, billing dashboards, and the risk of vendor lock-in. **OpenRouter** centralises all of this into a **unified API**.

> OpenRouter is a single integration point for **500+ LLMs from 60+ providers** — OpenAI, Anthropic, Google, Meta, Mistral, DeepSeek, and more. It is **not** an AI model — it is an infrastructure layer.

### Scale (early 2026)

- 4.2 M+ users.
- 250,000+ apps.
- 100+ trillion tokens/year.

---

## How it works

1. Sign up and add credits (prepaid in USD).
2. Generate a **single API key** (works across all models).
3. Send requests to the unified endpoint specifying the desired model.
4. OpenRouter routes to the best available provider.
5. Gateway overhead: ~25–40 ms.

**API endpoint:** `https://openrouter.ai/api/v1/chat/completions`

---

## Key features

### Model fallbacks

Specify an ordered array of models. If the primary fails (5xx, rate limiting, timeouts), OpenRouter automatically retries with the next model. Failover completes in < 2 seconds.

### Provider routing

Control routing through the `provider` object:

| Parameter | Effect |
|-----------|--------|
| `order` | Set provider preference (e.g., `["anthropic", "openai"]`) |
| `sort` | Optimise by `price`, `throughput`, or `latency` |
| `allow_fallbacks` | Enable/disable backup providers |
| `data_collection` | Control data storage policies |
| `zdr` | Enforce Zero Data Retention endpoints |

### Auto Router

`openrouter/auto` automatically selects the optimal model based on prompt analysis, complexity, and required capabilities.

### BYOK (Bring Your Own Key)

Use your own provider API keys through OpenRouter. Since October 2025: **1 M free BYOK requests/month**, 5% fee beyond that. Benefits: unified analytics, combined rate limits, fallback protection.

### Free models

`openrouter/free` randomly selects from available free models, intelligently filtering for required features (image understanding, tool calling, structured outputs).

---

## OpenAI SDK compatibility

OpenRouter is a **drop-in replacement** for the OpenAI SDK:

```js
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_KEY
});

const response = await client.chat.completions.create({
  model: "google/gemma-3-27b-it:free",
  messages: [{ role: "user", content: "Explain closures in JavaScript." }]
});
```

Also works with LangChain, LlamaIndex, PydanticAI, and the Vercel AI SDK.

---

## Routing strategies

| Strategy | Approach |
|----------|----------|
| Quality first | Frontier model → strong secondary → fast/cheap tertiary |
| Speed first | Fastest model → alternative fast → reliable slower |
| Provider diversity | Models from different providers for maximum uptime |
| Cost first | Cheapest adequate model → progressively more expensive |

---

## Security considerations

- Provider API keys (BYOK) are **encrypted** at rest and in transit.
- **Zero Data Retention (ZDR)** endpoints available.
- OpenRouter performs protocol translation and routing — it does **not** run inference itself.
- Requests pass through OpenRouter's servers — mitigated by ZDR for sensitive data.
- **Never commit API keys to version control.** OpenRouter auto-invalidates leaked keys.

---

## Suggested readings

### Chapter 1 — Open vs. Proprietary Models

- "Open-Source vs Proprietary AI: Cost Comparison 2026." *AI Cost Check* — [aicostcheck.com/blog/open-source-vs-proprietary-ai-cost-comparison-2026](https://aicostcheck.com/blog/open-source-vs-proprietary-ai-cost-comparison-2026)
- "The Licence Maze: Apache 2.0, Llama Licence, Qwen Licence Compared." *Laeka* — [laeka.org/publications/the-license-maze](https://laeka.org/publications/the-license-maze-apache-20-llama-license-qwen-license-compared/)
- "January 2026: Open-Source vs Proprietary." *WhatLLM* — [whatllm.org/blog/january-2026-open-source-vs-proprietary](https://whatllm.org/blog/january-2026-open-source-vs-proprietary)

### Chapter 2 — Ollama

- Ollama documentation — [ollama.com](https://ollama.com/)
- Ollama CLI reference — [docs.ollama.com/cli](https://docs.ollama.com/cli)
- Jan AI — [jan.ai](https://jan.ai/)
- Continue extension — [continue.dev](https://continue.dev/)

### Chapter 3 — OpenRouter

- OpenRouter documentation — [openrouter.ai/docs](https://openrouter.ai/docs)
- OpenRouter API reference — [openrouter.ai/docs/api-reference](https://openrouter.ai/docs/api-reference)
