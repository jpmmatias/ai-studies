# Module 07 -- AI Tools to Accelerate Your Life as a Developer

> Notes on chapters covering **AI-powered code editors** (Cursor, VS Code, Windsurf) and **AI agents** — what they are, how they decide, and how to use them effectively.

---

# Chapter 1: History and Overview of Cursor — Comparing VS Code, Windsurf, and Cursor

## VS Code as the foundation

Both **Cursor** and **Windsurf** are forks of **Visual Studio Code**. This is no coincidence. VS Code consolidated itself as an industry standard thanks to its mature ecosystem — extensions, themes, integrated debugger, terminal, and Git support. It became the "Chrome of editors," and companies saw the opportunity to leverage this solid base and add AI layers on top.

---

## Cursor: the AI-first fork

**Cursor** is an editor created by **Anysphere** (founded 2022 by MIT students Michael Truell, Sualeh Asif, Arvid Lunnemark, and Aman Sanger). It was designed from the ground up as an **AI-assisted development environment**, not merely a VS Code with an assistant bolted on.

### Funding and scale

| Round | Date | Amount | Valuation |
|-------|------|--------|-----------|
| Seed | Oct 2023 | $8 M | — |
| Series A | 2024 | — | ~$400 M |
| Series B | 2024 | — | ~$2.5 B |
| Series C | Jun 2025 | — | $9.9 B |
| **Series D** | **Nov 2025** | **$2.3 B** | **$29.3 B** |

Investors include Thrive Capital, a16z, Accel, DST Global, NVIDIA, and Google.

Key metric: Cursor crossed **$1 B ARR** in November 2025 — up from $100 M in January 2025, a 10× growth in 10 months. Enterprise revenue grew **100×** during 2025.

### Key features

- **Composer** — multi-file agent that rewrites code across dozens of files in a single operation.
- **Agent Mode** — autonomous plan/execute/observe loop.
- **Tab Completion** — intent-aware, ~0.3 s latency, ~65% acceptance rate.
- **200K+ token context windows** with codebase-wide indexing.
- **Plan Mode** — analyse codebase, draft a plan, get approval, then implement.
- **MCP support**, custom rules, background agents.

---

## Windsurf: another strong contender

**Windsurf** is also a VS Code fork, created by the **Codeium** team (known for their Copilot-alternative autocomplete plugin with 1 M+ developers). They rebranded to Windsurf, recognising that "bolting AI onto existing editors" had fundamental limitations.

### Funding and the OpenAI saga

- Raised **$243 M** total; a **$150 M round** (Aug 2024) valued the company at **$1.25 B**.
- In May 2025, OpenAI agreed to acquire Windsurf for **$3 B**.
- The deal **collapsed** in July 2025 after Microsoft objections.
- Google signed a **$2.4 B licensing deal** and hired the CEO; **Cognition** (makers of Devin) acquired the Windsurf product and IP.

### Key feature: Cascade

Windsurf's proprietary **Cascade** engine provides deep codebase reasoning, multi-file simultaneous editing, terminal command execution, and persistent "Memories" for project context.

---

## VS Code with GitHub Copilot

VS Code takes a different approach: AI as an **extension** rather than a fork. GitHub Copilot offers four interaction modes:

| Mode | Purpose | Autonomy |
|------|---------|----------|
| **Ask** | Q&A about code, no file changes | Low |
| **Edit** | Inline edits with diff review across selected files | Medium |
| **Plan** | Structured implementation planning before execution | Medium |
| **Agent** | Autonomous multi-step execution with self-correction (v1.99+) | High |

After a plan is approved, the **Agent** executes tasks with autonomy — iterating based on context and available tools.

### Custom agents

VS Code allows creating **custom agents** — personas with pre-defined tasks that run as part of the development cycle:

- Validate tests.
- Check best practices.
- Operate with different models.
- Have restricted tool access.

They function as scoped sub-prompts executing specific tasks.

---

## Comparison summary

| Dimension | Cursor | Windsurf | VS Code + Copilot |
|-----------|--------|----------|--------------------|
| Architecture | VS Code fork, AI-native | VS Code fork, AI-native | Extension on existing IDE |
| Valuation | $29.3 B (Nov 2025) | Acquired by Cognition | Part of Microsoft/GitHub |
| Multi-file editing | Most mature (Composer) | Strong (Cascade) | More limited |
| Context window | 200K+ tokens, codebase-wide | Codebase-wide | Limited to open files |
| Agent mode | Mature | Mature | Launched Jan 2026, maturing |
| IDE lock-in | Cursor only | Windsurf + JetBrains | Works in many IDEs |
| MCP support | Yes | Yes | Yes |
| Market share | Power-user favourite | ~4,000+ enterprises | **42%** (~20 M+ users) |
| Pro price | $20/month | $15/month | $10/month |

---

## Prompt-to-app platforms vs. editors

A cautionary experience shared in class: building an app with a prompt-to-app platform (like Lovable) started promisingly but quickly revealed serious flaws — lack of security, validation, and code structure. Migrating to VS Code and rewriting with proper practices was necessary.

Editors with AI provide what prompt-to-app platforms cannot:

- **Control** over the code.
- **Review and testing** capabilities.
- **Audit trails**.
- **CI/CD integration**.

---

# Chapter 2: What Are AI Agents and How They Make Decisions in Steps

## The limitation of isolated LLMs

Language models are excellent at predicting the next token based on textual context. However, they **cannot** execute commands, open files, run tests, or validate their own results on their own. This is why **AI agents** emerged: systems that use an LLM as a decision engine, coupled with tools, execution cycles, and result observation.

| Aspect | LLM chat | AI agent |
|--------|----------|----------|
| Execution | Single response | Iterative loop |
| Actions | Text generation only | Tool calls, file edits, shell commands |
| Memory | Conversation context | Working memory + tool results |
| Autonomy | User-driven | Goal-driven, self-correcting |
| Verification | None | Observes and validates outcomes |

---

## The agent loop

An agent transforms a prompt into a concrete task through a cycle:

```
1. PERCEIVE  — Gather context (codebase, user request, tool outputs)
2. REASON    — Analyse the situation and determine what to do
3. PLAN      — Break the task into steps
4. ACT       — Execute a tool call (edit file, run command, search code)
5. OBSERVE   — Check the result
6. CORRECT   — Fix if necessary
7. DELIVER   — Present final result with evidence
```

This cycle guarantees that the task is not merely imagined but **executed and validated**. It shifts from "talking to AI" to "solving a problem with AI."

> Agents consume **~4× more tokens** than standard chat, and up to **15×** in multi-agent systems. Each iteration requires reprocessing the full context.

---

## The developer mindset

For an agent to be effective, it needs to think like an experienced developer:

- Plans in small steps.
- Defines acceptance criteria.
- Creates an execution plan.
- Knows when something is done.

This approach prevents infinite loops and token waste — each step is validated before proceeding.

---

## Tool selection and function calling

The core of an agent lies in choosing the **right tool** for each task. The mechanism is called **function calling**:

1. **Definition** — the developer defines tools as JSON schemas (name, description, parameters).
2. **Selection** — the LLM analyses user intent and selects the appropriate tool(s) based on semantic similarity between the prompt and tool descriptions.
3. **Execution** — the host application executes the function.
4. **Integration** — results are fed back to the LLM for the next iteration.

```json
{
  "name": "readFile",
  "description": "Reads the content of a file at the given path.",
  "parameters": {
    "type": "object",
    "properties": {
      "path": { "type": "string", "description": "Absolute file path" }
    },
    "required": ["path"]
  }
}
```

> The **description field is critical** — detailed descriptions improve parameter accuracy by **30%+**. Tools with clear names and objective descriptions are prioritised. The LLM also prefers **non-destructive actions** (read, list) before write or delete.

---

## Iteration with feedback

A good agent does not just generate a response. It:

1. **Acts** — executes a tool.
2. **Observes** — reads the result.
3. **Compares** — checks against the expectation.
4. **Corrects** — adjusts if needed.

This feedback cycle creates the impression of "getting it right first time" — in reality, the agent had the chance to self-correct before presenting the final result.

---

## Agent roles

Agents can be divided into **specialised roles** with distinct responsibilities:

| Role | Responsibility |
|------|---------------|
| **Planner** | Creates the implementation plan |
| **Implementer** | Writes and edits code |
| **Reviewer** | Analyses diffs and flags risks |
| **QA** | Validates end-to-end flows |
| **Docs Agent** | Writes README, changelog, documentation |
| **Ops Agent** | Monitors systems, suggests incident mitigation |

This segmentation enables fine-grained permission control and reduces risk.

---

## Spec-Driven Development

Agents fail when the task is **poorly defined**. Gaps in the prompt are filled with guesses. The solution is **Spec-Driven Development** — treating specifications as executable, living documents that drive implementation.

A good spec includes:

| Component | Purpose |
|-----------|---------|
| **Context** | Stack, environment, dependencies |
| **Requirements** | What must be present |
| **Non-requirements** | What must be avoided |
| **Acceptance criteria** | How to know it is done |
| **Contract** | API format, response shape |
| **Test plan** | How to validate the feature |

> Specifications are not static planning artefacts — they become the **authoritative source of truth**. AI agents convert specs directly into working code, tests, and documentation.

---

## A professional workflow with agents

1. Define the specification (spec).
2. Create agents with defined roles.
3. Execute each step with validation.
4. Integrate results with automated tests.

The result is a workflow without chaos — consistent, validated, and high-quality.

---

## Suggested readings

### Chapter 1 — AI Code Editors

- Cursor blog: Series D announcement — [cursor.com/blog/series-d](https://cursor.com/blog/series-d)
- GitHub blog: "Copilot Ask, Edit, and Agent Modes." — [github.blog/ai-and-ml/github-copilot/copilot-ask-edit-and-agent-modes](https://github.blog/ai-and-ml/github-copilot/copilot-ask-edit-and-agent-modes-what-they-do-and-when-to-use-them)
- "Best AI Code Editor: Cursor vs Windsurf vs Copilot." *DevTools Watch* — [devtoolswatch.com/en/cursor-vs-windsurf-vs-github-copilot-2026](https://devtoolswatch.com/en/cursor-vs-windsurf-vs-github-copilot-2026)
- Wikipedia: Anysphere — [en.wikipedia.org/wiki/Anysphere](https://en.wikipedia.org/wiki/Anysphere)

### Chapter 2 — AI Agents

- "What Is the AI Agent Loop?" *Oracle Developers* — [blogs.oracle.com/developers/what-is-the-ai-agent-loop](https://blogs.oracle.com/developers/what-is-the-ai-agent-loop-the-core-architecture-behind-autonomous-ai-systems)
- OpenAI. "Function Calling." — [platform.openai.com/docs/guides/function-calling](https://platform.openai.com/docs/guides/function-calling/)
- "Spec-Driven Development: AI Agents Explained." *Augment Code* — [augmentcode.com/guides/spec-driven-development-ai-agents-explained](https://www.augmentcode.com/guides/spec-driven-development-ai-agents-explained)
- "Building Production AI Agents in 2026." *DEV Community* — [dev.to/chunxiaoxx/building-production-ai-agents-in-2026](https://dev.to/chunxiaoxx/building-production-ai-agents-in-2026-native-tool-calling-multi-agent-coordination-and-3l64)
