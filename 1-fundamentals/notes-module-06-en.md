# Module 06 -- Prompt Engineering

> Notes on chapters covering **structured prompt design**, **anti-hallucination techniques**, and **token-efficient formats** (JSON Prompt and TOON).

---

# Chapter 1: Writing Prompts That Generate Good Responses

## Why does AI hallucinate?

AI does not think like a human. It is **not deterministic** — it works by predicting the next most probable token given the context it received. When the prompt is poorly formulated, the model tries to **guess** what you want, opening space for errors.

> **Hallucination** is when a model generates false but confident-sounding statements — inventing data, mixing contexts, or asserting facts it has no basis for.

Example: asking "Who is Eric Wendel?" might produce a mix of real data with fabricated claims like "author of Java books" — which does not correspond to reality.

### Types of hallucination

| Type | Description | Example |
|------|-------------|---------|
| Factual fabrication | Invents non-existent facts | "Python was created in 1985 by Linus Torvalds" |
| Citation fabrication | Generates fake references | Made-up articles with fake DOIs |
| Entity confusion | Mixes attributes of different entities | Attributing Shakespeare's works to Dickens |
| Temporal confusion | Outdated or time-mixed data | Wrong current president |
| Numerical fabrication | Invents statistics | "73.4% of developers use..." |

---

## The 10-block prompt structure

To avoid hallucinations and get reliable responses, a structured prompt architecture — inspired by research from **Anthropic** — uses 10 distinct blocks. Each block has a clear role and helps the model understand the task with precision.

### 1. Task context (Identity / Role)

Define **who** the AI is. This sets the tone and expertise level for the entire interaction.

> "You are Joe, a career coach specialising in technology career transitions."

The first ~200 tokens carry a **primacy effect** — they shape everything that follows.

### 2. Tone of voice

Specify the communication style: formal, empathetic, didactic, technical, casual. This influences how the model expresses itself.

### 3. Source of truth

Insert documents, rules, tables, or any reference material that serves as a **factual basis** for the response. This prevents the AI from relying on generic internet data.

> This is the most powerful anti-hallucination mechanism — grounding the model in real data.

### 4. Operational contract

Rules of behaviour. Example: "If you are not sure, say you don't know. If data is missing, ask the user for more information." This creates a safety protocol.

### 5. Examples (Few-shot)

Show patterns of input and output. This anchors the expected response format and structure. Anthropic recommends **3–5 diverse examples** wrapped in distinguishing tags.

### 6. User history

In robust applications, this field carries what the user has already said — maintaining consistency across multi-turn conversations.

### 7. Clear request

The actual task. Do not confuse context with the demand. Give an **objective instruction**.

### 8. Reasoning incentive

Ask the model to validate or review before responding, when it makes sense. For complex tasks, instruct step-by-step thinking (chain-of-thought).

### 9. Output format

Specify what you expect: JSON, plain text, table, bullet list, Markdown, etc.

### 10. Constraints and validation

Character limits, response language, mandatory fields, and what to do when data is unavailable.

---

## Structured prompt example

A poorly structured prompt:

> "Create a career plan for me."

The model hallucinates because it does not know your area, level, or goals.

A well-structured prompt:

> "You are a career consultant. My goal is to transition to backend development in Java. I have experience with databases and a degree in engineering. Create a 3-year career plan targeting technology companies."

This provides role, context, constraint, and a clear task — dramatically reducing hallucination risk.

---

## Anti-hallucination checklist

| Practice | Why it helps |
|----------|-------------|
| Always include the AI's role | Sets expertise level and scope |
| Provide real documents or data | Grounds answers in facts, not guesses |
| Instruct "say you don't know" | Prevents confident fabrication |
| Ask the AI to request missing info | Fills gaps instead of inventing |
| For ambiguities, list options and ask | Avoids wrong assumptions |
| Use few-shot examples | Anchors expected format and behaviour |

---

## Advanced techniques

### Chain-of-Verification (CoVe)

A 2025–2026 technique where the model **verifies its own claims**:

1. Generate an initial response.
2. The model generates verification questions about its own claims.
3. The model independently answers those verification questions.
4. The model revises its original response based on verification results.

This dramatically reduces factual hallucinations by turning the model into its own fact-checker.

### The "Lost in the Middle" problem

Research shows that instructions at **positions 8–12** in a long prompt tend to be ignored. Critical rules should be placed at **positions 1–5** (primacy) or at the **very end** (recency). Structure your prompts accordingly.

### From prompt engineering to context engineering

The field has evolved from crafting individual prompts to **designing the entire context window** — system instructions, tool schemas, examples, and queries treated as an interface contract. Production-grade systems require explicit task definitions, input boundaries, output requirements, failure behaviour, and verification loops.

---

# Chapter 2: TOON and JSON Patterns for Prompts

## LLMs prefer structured data

Despite the impression that we are conversing with a human, LLMs are algorithms trained to predict tokens from textual input. The more **structured** the input, the better the model processes and responds.

> **JSON Prompt** is a natural solution: it is familiar, structured, predictable, and integrable with tools developers already use — Zod, Ajv, Yup, and standard JSON parsers.

---

## Advantages of JSON Prompts

| Advantage | Detail |
|-----------|--------|
| Reduced ambiguity | Separate fields prevent mixing of rules and instructions |
| Integration predictability | Easier to validate outputs and generate automatic re-prompts |
| Team standardisation | Prompts can be versioned, reused, and automated safely |
| Indirect token savings | Prevents costly correction cycles from ambiguous prompts |

---

## Suggested JSON Prompt structure

```json
{
  "meta": {
    "name": "career-advisor",
    "version": "1.2",
    "language": "en",
    "role": "You are a senior career advisor."
  },
  "context": {
    "user_profile": "Backend developer, 3 years experience, Java and Python.",
    "documents": ["...relevant excerpts..."]
  },
  "task": "Create a 6-month study plan for transitioning to ML engineering.",
  "constraints": {
    "max_length": 500,
    "language": "en",
    "must_include": ["timeline", "resources", "milestones"],
    "if_unknown": "Say 'I need more information about X'."
  },
  "output": {
    "format": "markdown",
    "sections": ["overview", "monthly_plan", "resources"]
  }
}
```

The separation of concerns — meta, context, task, constraints, output — helps the model understand **what** to do, **how**, and within **which limits**.

---

## TOON: Token-Oriented Object Notation

**TOON** (Token-Oriented Object Notation) is a data format released in **November 2025** (v1.0, MIT licence), specifically designed for LLM prompts. It preserves the JSON data model while eliminating redundant syntax.

### How TOON works

TOON declares field names **once** in a header and presents data as CSV-style rows:

**JSON (126 tokens):**

```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" }
  ]
}
```

**TOON (49 tokens — 61% savings):**

```
users[2]{id,name,role}:
  1,Alice,admin
  2,Bob,user
```

### Syntax basics

| Pattern | TOON syntax |
|---------|-------------|
| Simple object | `id: 123` (newline) `name: Alice` |
| Primitive array | `tags[3]: admin,ops,dev` |
| Tabular array | `employees[3]{id,name,dept}:` followed by rows |
| Nested object | Indentation-based nesting |
| Pipe delimiter | `items[2|]{id|name}:` rows use `|` instead of `,` |

---

## Token savings benchmarks

Benchmarks measured with the Claude tokeniser:

| Scenario | JSON tokens | TOON tokens | Savings |
|----------|-------------|-------------|---------|
| 200-product catalogue | 15,879 | 6,088 | **62%** |
| 120-task list | 8,500 | 2,267 | **73%** |
| 40 few-shot examples | 2,131 | 996 | **53%** |
| Average across scenarios | 3,252 | 1,226 | **62%** |

For comparison: Markdown saves ~53%, YAML only ~32% versus JSON.

### Accuracy impact

TOON achieves **73.9% accuracy** on LLM data retrieval tasks, compared to JSON's 69.7%. The structured tabular format helps models parse relationships more effectively.

---

## Cost impact at scale

At 1 million requests/month with GPT-4-class pricing:

| Format | Estimated monthly cost |
|--------|----------------------|
| JSON | ~$15,000 |
| TOON | ~$6,000 |
| **Savings** | **~$9,000/month** |

---

## Well-structured JSON can be competitive

Even with TOON's compact syntax, a **well-modelled JSON** — especially when representing tabular data — can achieve comparable efficiency. An array-of-columns-and-rows approach eliminates key redundancy while remaining valid JSON:

```json
{
  "columns": ["id", "name", "role"],
  "rows": [[1, "Alice", "admin"], [2, "Bob", "user"]]
}
```

This tabular JSON measured **26 tokens** for a small dataset, versus **35 tokens** for the equivalent TOON. The JSON ecosystem advantage (validation, parsing, logging) makes this a strong alternative.

---

## TOON SDK

```js
import { encode, decode } from "@toon-format/toon";

const data = {
  users: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" }
  ]
};

const toonString = encode(data);   // JSON → TOON
const jsonData   = decode(toonString); // TOON → JSON (lossless)
```

---

## When to use each format

| Scenario | Recommended format |
|----------|--------------------|
| Integration with APIs | JSON Prompt |
| Output validation with schemas | JSON Prompt |
| Compatibility with existing tools | JSON Prompt |
| Maximum token economy | TOON |
| Simple, well-controlled structures | TOON |
| Pipelines where custom parsing is acceptable | TOON |

### Caveats with TOON

- Requires learning a new format.
- Not supported by standard JSON tooling.
- Can add complexity to integration pipelines.
- Deeply nested configs do not benefit as much.
- Small datasets (< 10 objects) show minimal benefit.

---

## Suggested readings

### Chapter 1 — Prompt Engineering

- Anthropic. "Prompt Engineering Best Practices." — [docs.anthropic.com/en/docs/build-with-claude/prompt-engineering](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- OpenAI. "Prompt Engineering Guide." — [platform.openai.com/docs/guides/prompt-engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- Google. "Prompt Design Strategies." *Vertex AI* — [docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/prompt-design-strategies](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/prompts/prompt-design-strategies)
- Kinney, Steve. "Prompt Engineering Across Frontier APIs." — [stevekinney.com/writing/prompt-engineering-frontier-llms](https://stevekinney.com/writing/prompt-engineering-frontier-llms)
- "The 7-Layer AI Prompt Anatomy." — [buildyourfish.com/prompts](https://buildyourfish.com/prompts/)

### Chapter 2 — TOON and JSON Prompts

- TOON Specification (v1.0) — [toonformat.dev/reference/spec.html](https://toonformat.dev/reference/spec.html)
- TOON Syntax Cheatsheet — [toonformat.dev/reference/syntax-cheatsheet.html](https://toonformat.dev/reference/syntax-cheatsheet.html)
- TOON Kit — [toon-kit.com](https://www.toon-kit.com/)
- GitHub: toon-format/toon — [github.com/toon-format/toon](https://github.com/toon-format/toon)
- "YAML vs Markdown vs JSON vs TOON." *DEV Community* — [dev.to/webramos/yaml-vs-markdown-vs-json-vs-toon](https://dev.to/webramos/yaml-vs-markdown-vs-json-vs-toon-which-format-is-most-efficient-for-the-claude-api-4l94)
