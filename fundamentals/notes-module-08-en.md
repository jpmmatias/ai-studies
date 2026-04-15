# Module 08 -- MCPs and Automation for Devs

> Notes on chapters covering the **Model Context Protocol (MCP)**, and practical applications: **automated testing**, **web navigation and data extraction**, **querying updated documentation**, and **telemetry-driven debugging** — all powered by AI agents.

---

# Chapter 1: What Are MCPs (Model Context Protocol) and How They Connect AI with APIs and Services

## What is MCP?

The **Model Context Protocol (MCP)** was announced by **Anthropic in November 2024** as an open-source protocol for integrating AI assistants with external data sources, tools, and services. It solves the **N×M integration problem** — previously, every AI model needed custom integrations with every data source. MCP standardises this into a single protocol.

> MCP is the **"USB for AI"** — a universal connector that lets you plug any tool into any compatible AI client.

The idea is simple: you plug ready-made MCP servers into a compatible client (VS Code, Cursor, Claude Desktop), and the AI automatically gains access to those integrations — without additional coding.

### Scale of the ecosystem (2025–2026)

- **97 M+** monthly SDK downloads.
- **10,000+** active MCP servers.
- Adopted by OpenAI, Google DeepMind, Microsoft, and AWS.
- In **December 2025**, Anthropic donated MCP to the **Linux Foundation's Agentic AI Foundation**, making it industry-neutral infrastructure.

---

## Architecture

MCP is built on **JSON-RPC 2.0** and was inspired by the **Language Server Protocol (LSP)** that powers code editor features like autocomplete and go-to-definition.

### Three participants

| Component | Role |
|-----------|------|
| **MCP Host** | The AI application (Claude Desktop, VS Code, Cursor) that coordinates connections |
| **MCP Client** | Maintains a dedicated 1:1 connection to each MCP server |
| **MCP Server** | A program that exposes capabilities to clients |

**Transport modes:** STDIO (local servers) and SSE/HTTP Streaming (remote servers).

---

## Three core primitives

MCP servers expose three fundamental capability types:

### 1. Tools

Actions the AI can **call** — like functions. Examples: "list pull requests", "create file", "execute SQL query."

```json
{
  "name": "get_weather",
  "description": "Get current weather for a location",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City name or zip code"
      }
    },
    "required": ["location"]
  }
}
```

Tools are discovered via `tools/list` requests and invoked with `tools/call`.

### 2. Resources

Data the AI can **read** — databases, files, calendars, API responses. Read-only context providers.

### 3. Prompts

Pre-defined **prompt templates** the AI can invoke. Reusable structures for common workflows.

---

## How LLMs choose tools

LLMs do not contain if-else logic for tool selection. They learn to select the best option based on **semantic similarity** between the user's prompt and the tool's name and description. This is why:

- Tools with **clear names** (e.g., `readFile`) and **objective descriptions** are prioritised.
- The AI prefers **non-destructive** actions (read, list) before write or delete.
- Advanced models execute **sequences** of calls: use one tool, analyse the result, then call another.
- If the JSON schema is not satisfied, the call fails and the model retries.

---

## JSON Schema and validation

Each tool defines a **JSON Schema** for its input parameters. The LLM must generate valid JSON matching this schema for the call to execute. This brings strong control and predictability — essential for production environments.

---

## Real-world MCP servers

| Server | Purpose |
|--------|---------|
| **GitHub** | List PRs, review code, open/merge PRs |
| **Playwright** (Microsoft) | Browser automation, testing, navigation |
| **Grafana** | Monitoring dashboards, alerting, log queries |
| **Context7** | Library documentation lookup |
| **Filesystem** | Local file read/write operations |
| **Postgres / SQLite** | Database querying |
| **Fetch** | HTTP requests |
| **Memory** | Persistent key-value storage for agents |
| **Resend** | Email generation and sending |

### Integration in editors

MCP servers are configured via JSON files (e.g., `mcp.json`) in VS Code, Cursor, or other compatible clients. You point to the server command and provide credentials. From that point, the AI can use those integrations in its workflow.

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## Benefits

- **Reduced hallucination:** the AI accesses real data instead of inventing information.
- **Extensibility:** install new MCP servers to add capabilities instantly.
- **Modularity:** combine multiple sources in a single interaction.
- **Auditability:** all tool calls follow defined schemas and can be logged.

---

# Chapter 2: Using AI to Generate Automated Tests

## The context

Using only structured prompts and the **Playwright MCP** integration, it is possible to create an entire test suite from scratch — without writing a single line of test code manually.

The demo was built in an empty repository in VS Code. Using AI agents, the workflow covered:

1. Creating the project with Playwright.
2. Generating a base test file.
3. Running the tests.
4. Automatically adjusting failures.
5. Integrating with GitHub Actions.

---

## How the AI executes tests

The AI uses MCP to communicate with the browser via commands:

- Open a page.
- Fill form fields.
- Submit data.
- Verify results.
- Validate fields and error states.

All driven by simple, objective prompts.

---

## Automated flow

### Step 1 — Project initialisation

The initial prompt defines the project structure. The agent installs dependencies, configures browsers (e.g., Chromium only), and validates the environment with an initial test.

### Step 2 — CI/CD setup

Another prompt generates the **GitHub Actions workflow** file, integrating test execution with the repository pipeline.

### Step 3 — Page mapping

The AI navigates the target page, identifies elements — form fields, lists, buttons — and builds a mental model of the page structure.

### Step 4 — Test generation

Based on prompts with generic objectives (e.g., "validate submission", "verify list update"), the AI generates Playwright test scripts.

### Step 5 — Execution and adjustment

Tests are run. On failure, the AI **automatically adjusts** the code — fixing selectors, timing issues, or assertions — and re-runs until all tests pass.

---

## Agent intelligence

During execution, the AI decides whether to run Chrome in **visible or headless** mode. Based on logs and interaction results, it adjusts commands, modifies selectors, and rewrites tests as needed. Playwright's visual reports help verify what was done.

---

## Advantages

| Benefit | Detail |
|---------|--------|
| Productivity | Tests created with zero manual code |
| Standardisation | Consistent initial structure and CI across projects |
| Real validation | Tests actually run, are validated, and documented |
| Error reduction | Agents auto-fix common failures |
| Accessibility | Visual execution and report integration |

---

# Chapter 3: Using AI to Navigate Sites and Extract Information

## The problem: repetitive form filling

Anyone who frequently participates in events knows the tedium of filling the same personal data across different forms. This chapter demonstrates using the **Playwright MCP** inside VS Code to automate this process based on profile information.

---

## Step-by-step automation

### 1. Configure the MCP

Set up the agent in VS Code pointing to the Playwright MCP. The JSON configuration is added to the agent panel.

### 2. Connect to the browser

With the **Playwright MCP Bridge** extension installed in Chrome, the AI interacts directly with open tabs. This is essential for scenarios requiring authentication or a logged-in session.

### 3. Execute navigation commands

From a prompt like "Navigate to ericwendel.com and summarise what exists there," the AI connects to the browser, opens the page, traverses sections, and collects data.

### 4. Automated form filling

With page context obtained, the agent accesses a real event submission form and begins auto-filling with data extracted from the speaker's profile page (e.g., Sessionize).

### 5. Context management and continuity

The AI maintains context in memory across interactions. When data is missing (phone, email), the agent explicitly requests it, adjusts, and continues.

### 6. Iterative refinement

It is possible to switch the talk being submitted, clear the form, and repeat with different content — all through refined prompts.

---

## Benefits

- **Efficiency:** eliminates repetitive, time-consuming tasks.
- **Precision:** the AI extracts data directly from the source, reducing manual errors.
- **Scalability:** the same flow can be reused for dozens of forms.
- **Local execution:** models like **Ollama** can run the automation locally, saving API costs.

---

# Chapter 4: Using AI to Query Updated Documentation

## The staleness problem

LLMs are trained up to a certain date. After that, they do not learn new information unless we supply it. When APIs, libraries, or frameworks release new versions, the model keeps suggesting outdated or incompatible code.

> The common workaround — copying huge blocks of documentation into the prompt — wastes tokens, is expensive, and error-prone.

---

## What is Context7?

**Context7** is an MCP server that indexes **complete, up-to-date documentation** from real projects — Next.js, Node.js, Prisma, BetterAuth, and many others. It pulls the most relevant documentation snippets at execution time and injects them into the context automatically.

### How it changes the workflow

| Without Context7 | With Context7 |
|-------------------|---------------|
| Manually paste documentation blocks | Server auto-selects relevant snippets |
| High token consumption | Lean, targeted context injection |
| Frequent outdated suggestions | Always aligned with current versions |
| Multiple retry cycles | Often correct on first attempt |

---

## Integration with VS Code

1. Create an API key on the Context7 dashboard.
2. Configure `mcp.json` with the key.
3. Enable the `queryDocs` and `resolveLibrary` tools in the agent.
4. Execute prompts — the agent automatically queries documentation.

---

## Practical example: Next.js + BetterAuth + SQLite

In the demonstration, a fullstack application was created from a single structured prompt:

- **Role:** experienced fullstack developer.
- **Instruction:** use Context7 for all documentation lookups.
- **Stack:** Next.js, BetterAuth (GitHub login), SQLite.
- **Output:** functional project created in a specified folder.

The agent:

1. Created the project with `npm init` using Next.js.
2. Installed dependencies automatically.
3. Initialised and migrated the local SQLite database.
4. Configured the GitHub OAuth login flow.
5. Ran the project locally on port 3000.

Throughout the process, the agent consulted Context7 for current documentation and integration examples — no manual documentation pasting required.

---

## Benefits

- **Precision:** generated code aligns with current library versions.
- **Lower cost:** smaller prompts, fewer tokens, fewer retries.
- **Safety:** dramatically reduces errors from using obsolete methods.
- **Productivity:** functional applications from a single prompt.

---

# Chapter 5: Using AI to Collect Telemetry Data from Apps

## The pain of intermittent bugs

Bugs that appear and vanish are a production nightmare. Isolated logs rarely help, and reproducing the error may be infeasible. **Telemetry** solves this by recording everything happening in the application through metrics, logs, and traces.

---

## The infrastructure

The demo used an application called **Aluminus**, pre-instrumented with **OpenTelemetry** — the current standard for unified telemetry collection.

Data flows to:

| Component | Role |
|-----------|------|
| **Prometheus** | Collects and stores performance metrics |
| **Grafana Tempo** | Stores distributed traces |
| **Grafana Loki** | Centralises logs |
| **Grafana** | Visualises and correlates all signals in interactive dashboards |

Everything was orchestrated with **Docker Compose** to simulate a real production environment.

---

## The Grafana MCP and AI investigation

A **Grafana MCP server** connected to the monitoring stack enables an AI agent (in VS Code) to perform real investigations from a single prompt:

> "I am receiving error 500 on this endpoint. Find the cause and generate a report."

### Investigation flow

```
1. COLLECT METRICS     → Query Prometheus: all requests returning 500
2. EXPLORE LOGS        → Query Grafana Loki: error messages, stack traces
3. TRACE ANALYSIS      → Query Grafana Tempo: reconstruct call chains, find bottlenecks
4. SIGNAL CORRELATION  → Cross-reference metrics + logs + traces
5. DIAGNOSTIC REPORT   → Structured output with root cause and evidence
```

The AI performs this entire analysis **without access to source code** — it works solely from telemetry data exposed by monitoring tools.

---

## Diagnostic report

The agent generated a structured report containing:

- Affected endpoint name.
- Request response times.
- Stack trace showing a database connection failure.
- **Root cause:** multiple connections created per request without pooling (connection leak).
- Suspected code lines (inferred from trace data, even without repository access).

---

## Why use this approach?

| Benefit | Detail |
|---------|--------|
| Speed | Hours of manual investigation reduced to minutes |
| Precision | Evidence-based diagnosis, not guesswork |
| Code independence | Works on legacy or unknown systems |
| Tool integration | Standard tools: Grafana, OpenTelemetry, Prometheus |

---

## Suggested readings

### Chapter 1 — Model Context Protocol

- Anthropic. "Introducing the Model Context Protocol." — [anthropic.com/research/model-context-protocol](https://www.anthropic.com/research/model-context-protocol)
- MCP Architecture documentation — [modelcontextprotocol.io/docs/concepts/architecture](https://modelcontextprotocol.io/docs/concepts/architecture)
- MCP Tools specification — [modelcontextprotocol.io/specification/latest/server/tools](https://modelcontextprotocol.io/specification/latest/server/tools)
- MCP Servers repository — [github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
- VS Code MCP documentation — [code.visualstudio.com/docs/copilot/customization/mcp-servers](https://code.visualstudio.com/docs/copilot/customization/mcp-servers)
- "MCP Is the USB Port for AI Tools." *DEV Community* — [dev.to/maxmendes91/mcp-is-the-usb-port-for-ai-tools](https://dev.to/maxmendes91/mcp-is-the-usb-port-for-ai-tools-l8n)

### Chapter 2 — Automated Testing with AI

- Playwright MCP — [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp/)
- Playwright documentation — [playwright.dev/docs/intro](https://playwright.dev/docs/intro)

### Chapter 3 — Web Navigation and Extraction

- Playwright MCP Bridge — Chrome extension for connecting agents to open browser tabs.

### Chapter 4 — Updated Documentation with Context7

- Context7 — [context7.com](https://context7.com/)

### Chapter 5 — Telemetry and AI

- OpenTelemetry documentation — [opentelemetry.io/docs](https://opentelemetry.io/docs/)
- Grafana documentation — [grafana.com/docs](https://grafana.com/docs/)
- Prometheus documentation — [prometheus.io/docs](https://prometheus.io/docs/introduction/overview/)
