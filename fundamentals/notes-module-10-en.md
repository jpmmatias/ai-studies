# Module 10 -- RAG, Embeddings, and Semantic Search

> Notes on chapters covering **Retrieval-Augmented Generation (RAG)**, **embeddings and vector databases**, and a **hands-on project** building a RAG system with JavaScript and Neo4j.

---

# Chapter 1: What Is RAG (Retrieval-Augmented Generation) and Why It Matters

## The essence of RAG

**RAG** is an architecture that adds a fundamental step **before** the LLM generates a response: the retrieval of relevant external information. Instead of relying solely on what it learned during training, the model receives dynamically injected context from a knowledge base.

> RAG lets the model generate answers grounded in **real, up-to-date, domain-specific data** — something unreachable with parametric knowledge alone.

---

## Parametric vs. non-parametric memory

RAG relies on two types of memory:

| Memory type | Description | Properties |
|-------------|-------------|------------|
| **Parametric** | Knowledge encoded in the model's weights during training | Implicit, hard to update, prone to hallucination |
| **Non-parametric** | An external, searchable knowledge base (typically a vector index) | Explicit, updatable, inspectable |

The concept was formalised in 2020 by Lewis et al. in the paper *"Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"*, which demonstrated that combining both memory types significantly improves factual accuracy.

---

## The problem of missing context

Recall how a Transformer works (Module 05, Chapter 2): it predicts the next token based on the current context. If the context does not contain the correct information, the model fills the gap with learned patterns — which may be wrong.

> With RAG, instead of trusting the model's memory, we **guarantee** that the context contains the right information at the right time.

---

## How RAG works in practice

### Phase 1 — Indexing (offline)

```
Raw documents → Load → Split into chunks → Generate embeddings → Store in vector DB
```

1. **Collect** sources: documents, tickets, code, tables, PDFs.
2. **Split** into coherent chunks (see chunking strategies below).
3. **Embed** each chunk into a numeric vector.
4. **Store** vectors with metadata in a vector database.

### Phase 2 — Query (online)

```
User question → Embed question → Search vector DB → Retrieve top-K chunks → Inject into prompt → LLM generates answer
```

1. The user sends a question.
2. The question is converted into an embedding.
3. The system searches for the most similar embeddings in the vector store.
4. The most relevant chunks are injected into the prompt.
5. The LLM generates a response grounded in that context.

---

## Chunking strategies

> **80% of RAG failures** trace back to the ingestion/chunking layer, not the LLM.

| Strategy | Description | Best for |
|----------|-------------|----------|
| **Fixed-size** | Split at predetermined token counts (e.g., 512) with overlap | Simple documents |
| **Recursive character** | Split on natural boundaries (paragraphs → sentences → words) | **Recommended default (~80% of use cases)** |
| **Document-structure-aware** | Split along headers/sections in HTML, Markdown | Structured documents |
| **Semantic** | Use embeddings to detect topic boundaries | Topic-diverse documents |
| **LLM-based** | LLM determines chunk boundaries | Highest quality, highest cost |

**Recommendation:** start with recursive character splitting at **512 tokens** with **10–15% overlap**.

**Parent-child pattern:** embed small chunks (256 tokens) for precise retrieval, but return larger parent chunks (1,024 tokens) to give the LLM sufficient surrounding context.

---

## RAG vs. fine-tuning vs. in-context learning

| Approach | What changes | Best when | Limitation |
|----------|-------------|-----------|------------|
| **RAG** | What the model can **see** right now | Data changes frequently; need citations; large knowledge base | Requires vector infrastructure |
| **Fine-tuning** | How the model **behaves** permanently | Need specific tone/style/format internalised | Not for frequently changing facts |
| **In-context learning** | Data placed directly in the **prompt** | Small knowledge base (< 150K tokens); fastest, cheapest | "Lost in the middle" problem; expensive at scale |

> Giving context with RAG is different from training. The model uses the information only while it is in the prompt. After the interaction, that knowledge is discarded.

**Modern recommendation (2026):** use RAG for facts and freshness, fine-tuning for behaviour and format — a hybrid approach.

---

## Advanced RAG techniques (2025–2026)

### 1. Hybrid search

Combines **dense vector search** (semantic) with **sparse BM25** (keyword). Results are fused via **Reciprocal Rank Fusion (RRF)** — documents consistently ranked highly by both retrievers score higher overall.

### 2. Query transformation

- **Parallel query retrieval:** generate 3–5 query variants capturing different semantic angles.
- **HyDE (Hypothetical Document Embeddings):** the LLM generates a hypothetical answer; that text is embedded and used for retrieval.
- **Step-back prompting** and **multi-query expansion.**

### 3. Cross-encoder re-ranking

Retrieve top-100 via fast vector search, then re-rank with a **cross-encoder** model for hyper-accurate relevance scoring. Recommended for corpora with > 50,000 chunks.

### 4. GraphRAG

Enrich vector results with **knowledge graph traversal** — follow relationships between entities for multi-hop reasoning. This is where Neo4j's graph capabilities shine.

---

## Real-world use cases

- **Enterprise chatbot:** a Fortune 500 manufacturer's RAG system searches 50 M+ product records, reducing response time from 5 minutes to 10–30 seconds.
- **Legal research:** brief generation and case search, reducing research time by 70%.
- **Customer support:** integration with Salesforce/Zendesk ticket databases.
- **Code assistants:** RAG over codebases, documentation, and runbooks for developer Q&A.

---

# Chapter 2: What Are Embeddings and Vector Databases

## Understanding similarity search

Unlike **Ctrl+F** (exact text match), **similarity search** works with **meaning** rather than literal words. By converting text into vectors (embeddings), we can identify similarities between passages even when they use entirely different words.

> Two texts with similar meanings — even written with different words — will be represented by **nearby vectors** in the embedding space.

---

## What are embeddings?

**Embeddings** are numerical vector representations of data (text, images, audio) that capture semantic meaning in high-dimensional space.

### How they are generated

A neural network (typically a Transformer encoder) maps input text through encoder layers, then applies **pooling** (usually mean pooling over token embeddings) to produce a fixed-size vector.

The evolution:

| Generation | Method | Context-aware? |
|------------|--------|----------------|
| 1st | **Word2Vec**, **GloVe** (2013) | No — same vector regardless of context |
| 2nd | **ELMo** (2018) | Partially — uses bidirectional LSTM |
| 3rd | **BERT**, **Sentence-BERT** (2019) | Yes — Transformer-based |
| 4th | **text-embedding-3**, **mxbai-embed** (2024+) | Yes — optimised for retrieval |

### Popular embedding models

| Model | Dimensions | Context | Type |
|-------|-----------|---------|------|
| OpenAI `text-embedding-3-small` | 1,536 | 8,192 tokens | Cloud API |
| OpenAI `text-embedding-3-large` | 3,072 | 8,192 tokens | Cloud API |
| **Sentence-BERT** (`all-MiniLM-L6-v2`) | 384 | 256 tokens | Open-source / local |
| `mxbai-embed-xsmall-v1` | varies | varies | Open-source / local |

**Sentence-BERT** uses siamese Transformer networks — processing sentences independently through the same encoder, applying mean pooling, then comparing with cosine similarity. It reduced semantic search from **65 hours to 5 seconds** compared to cross-encoder approaches.

---

## Vector similarity metrics

| Metric | Considers magnitude? | Range | Best for |
|--------|--------------------|-------|----------|
| **Cosine similarity** | No (direction only) | [-1, 1] | Text embeddings, NLP, recommendations |
| **Euclidean distance** | Yes | [0, ∞) | Clustering, image similarity, k-NN |
| **Dot product** | Yes | Unbounded | Pre-normalised vectors, attention mechanisms |

### Cosine similarity formula

$$
\text{sim}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{||\vec{A}|| \cdot ||\vec{B}||} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}
$$

- **1** — identical direction (maximum similarity).
- **0** — orthogonal (no relationship).
- **-1** — opposite direction.

> **Critical rule:** match your similarity metric to the one used during embedding model training.

---

## Vector databases

A **vector database** stores embeddings and provides fast approximate nearest-neighbour (ANN) search. Most use the **HNSW** (Hierarchical Navigable Small World) algorithm.

### Comparison (2026 benchmarks)

| Database | Type | P95 latency (10 M vectors) | Best for |
|----------|------|---------------------------|----------|
| **Pinecone** | Managed SaaS | 45 ms | Zero-ops, enterprise |
| **Qdrant** | Open-source (Rust) | 22 ms | Best performance, self-hosting |
| **Weaviate** | Open-source (Go) | ~50 ms | Hybrid search (BM25 + vector) |
| **Chroma** | Open-source (Python/Rust) | 180 ms+ at scale | Prototyping, small apps |
| **FAISS** | Library (C++/Python) | N/A | GPU acceleration, billions of vectors |
| **pgvector** | Postgres extension | N/A | Simple stacks, < 10 M vectors |

---

## Neo4j as a vector database

Although known as a **graph database**, Neo4j also functions as a vector database using HNSW indexes via Apache Lucene.

### Storing and indexing embeddings

Embeddings are stored as properties on **nodes** (or relationships):

```cypher
CREATE (d:Document {
  text: "What is backpropagation?",
  embedding: [0.012, -0.045, 0.078, ...]
})
```

Create a vector index:

```cypher
CREATE VECTOR INDEX chunkIndex IF NOT EXISTS
FOR (c:Chunk) ON c.embedding
OPTIONS {indexConfig: {
  `vector.dimensions`: 384,
  `vector.similarity_function`: 'cosine'
}}
```

### Querying by similarity

```cypher
CALL db.index.vector.queryNodes('chunkIndex', 5, $queryEmbedding)
YIELD node, score
RETURN node.text AS text, score
ORDER BY score DESC
```

### The unique advantage: graph + vector

Neo4j's killer feature is combining vector similarity with **graph traversal**. After finding semantically similar nodes, you can traverse relationships to discover connected knowledge — enabling **GraphRAG** patterns that flat vector stores cannot replicate.

---

# Chapter 3: Project — Building the First RAG with JavaScript and Neo4j

## Project overview

This chapter walks through building a complete RAG pipeline in JavaScript:

1. Read a PDF transcript.
2. Split it into coherent chunks.
3. Generate embeddings locally (no API costs).
4. Store everything in Neo4j with metadata.
5. Query by similarity to retrieve relevant context.

The entire pipeline runs locally — **no external API keys, no Docker dependency for the ML part, and no heavy infrastructure**.

---

## Step 1 — Extract text from PDF

```js
import pdfParse from "pdf-parse";
import { readFileSync } from "node:fs";

async function extractText(pdfPath) {
  const buffer = readFileSync(pdfPath);
  const result = await pdfParse(buffer);
  return result.text;
}
```

---

## Step 2 — Split into chunks

Using recursive character splitting — the recommended default strategy:

```js
function chunkText(text, chunkSize = 512, overlap = 64) {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  return chunks;
}
```

Each chunk should be large enough to carry meaning but small enough for precise retrieval.

---

## Step 3 — Generate embeddings locally

Using **Transformers.js** to run the embedding model entirely in Node.js:

```js
import { pipeline } from "@huggingface/transformers";

const embedder = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);

async function embed(text) {
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
```

### Performance notes

| Aspect | Value |
|--------|-------|
| Latency | ~5 ms per embedding locally vs 100–300 ms via cloud API |
| Cost | $0 (vs $0.13/1 M tokens for OpenAI) |
| Model size | ~23 MB (cached after first download) |
| Dimensions | 384 (for `all-MiniLM-L6-v2`) |
| Offline | Works without internet after first download |

---

## Step 4 — Store in Neo4j with metadata

```js
import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  "neo4j://localhost:7687",
  neo4j.auth.basic("neo4j", "password")
);

async function storeChunks(chunks, session) {
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embed(chunks[i]);
    await session.run(
      `CREATE (c:Chunk {
        text: $text,
        embedding: $embedding,
        index: $index,
        source: $source
      })`,
      {
        text: chunks[i],
        embedding: embedding,
        index: i,
        source: "lecture-transcript.pdf"
      }
    );
  }
}
```

Then create the vector index:

```js
await session.run(`
  CREATE VECTOR INDEX chunkIndex IF NOT EXISTS
  FOR (c:Chunk) ON c.embedding
  OPTIONS {indexConfig: {
    \`vector.dimensions\`: 384,
    \`vector.similarity_function\`: 'cosine'
  }}
`);
```

---

## Step 5 — Query by similarity

```js
async function search(question, session, topK = 5) {
  const questionEmbedding = await embed(question);

  const result = await session.run(`
    CALL db.index.vector.queryNodes('chunkIndex', $topK, $embedding)
    YIELD node, score
    RETURN node.text AS text, node.source AS source, score
  `, { topK, embedding: questionEmbedding });

  return result.records.map(r => ({
    text: r.get("text"),
    source: r.get("source"),
    score: r.get("score")
  }));
}
```

### Example queries and results

Even without exact phrases in the transcript, the system returns highly relevant passages:

| Query | Behaviour |
|-------|-----------|
| "What is one-hot encoding?" | Returns paragraphs explaining feature encoding, even if the exact phrase is worded differently |
| "How to train a neural network?" | Finds sections on backpropagation and gradient descent |
| "What is backpropagation?" | Locates detailed explanations across multiple chunks |

---

## Step 6 — Connect to an LLM for generation (closing the RAG loop)

Once the retrieval pipeline is working, the final step is injecting the retrieved context into a prompt for an LLM:

```js
async function ragAnswer(question, session) {
  const relevantChunks = await search(question, session);
  const context = relevantChunks.map(c => c.text).join("\n\n");

  const prompt = `Based on the following context, answer the question.
If the answer is not in the context, say "I don't have enough information."

Context:
${context}

Question: ${question}
Answer:`;

  // Send to any LLM — OpenAI, Ollama, OpenRouter, etc.
  const response = await llm.complete(prompt);
  return response;
}
```

This completes the RAG cycle: **retrieve → inject → generate**.

---

## Architecture summary

```
┌─────────────────────────────────────────────────────┐
│                  INDEXING (offline)                  │
│                                                     │
│  PDF ──► Extract text ──► Chunk ──► Embed ──► Neo4j │
│               (pdf-parse)    (512 tok)  (Transformers.js)    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   QUERY (online)                    │
│                                                     │
│  Question ──► Embed ──► Vector search ──► Top-K     │
│                          (Neo4j HNSW)     chunks    │
│                                             │       │
│                                             ▼       │
│                                    Inject into      │
│                                    prompt ──► LLM   │
│                                              │      │
│                                              ▼      │
│                                         Answer      │
└─────────────────────────────────────────────────────┘
```

---

## Key takeaways

1. **Data engineering is essential for AI.** The model is only as good as the data it receives.
2. **Control over embeddings and metadata** gives you autonomy to build truly useful AI architectures.
3. **Local embeddings** (Transformers.js) eliminate API costs and work offline.
4. **Neo4j** combines vector search with graph traversal — a powerful combination for knowledge-intensive applications.
5. Mastering this pipeline is the **most important step** for any developer who wants to take AI seriously.

---

## Suggested readings

### Chapter 1 — RAG

- Lewis, P. et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." 2020. [arxiv.org/abs/2005.11401](https://arxiv.org/abs/2005.11401)
- "The Complete Guide to RAG for Production Applications." *Medium* — [medium.com/@atnoforgenai/the-complete-guide-to-rag](https://medium.com/@atnoforgenai/the-complete-guide-to-rag-retrieval-augmented-generation-for-production-applications-fbfdc18b2757)
- "RAG Chunking Strategies 2026." *Viqus* — [viqus.ai/blog/rag-chunking-strategies-2026](https://viqus.ai/blog/rag-chunking-strategies-2026)
- "RAG vs Fine-Tuning Comparison 2026." *Syntalith* — [syntalith.ai/en/blog/rag-vs-fine-tuning-comparison-2026](https://syntalith.ai/en/blog/rag-vs-fine-tuning-comparison-2026)
- "Advanced RAG: Hybrid Search and Re-ranking." *MiniMind AI* — [minimindai.com/blog/advanced-rag-hybrid-search](https://www.minimindai.com/blog/advanced-rag-hybrid-search)

### Chapter 2 — Embeddings and Vector Databases

- Mikolov, T. et al. "Efficient Estimation of Word Representations in Vector Space." *ICLR*, 2013. (Word2Vec)
- Reimers, N. and Gurevych, I. "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks." 2019. [arxiv.org/abs/1908.10084](https://arxiv.org/abs/1908.10084)
- OpenAI Embeddings Guide — [platform.openai.com/docs/guides/embeddings](https://platform.openai.com/docs/guides/embeddings/)
- Pinecone. "Vector Similarity Explained." — [pinecone.io/learn/vector-similarity](https://www.pinecone.io/learn/vector-similarity/)
- Neo4j Vector Indexes documentation — [neo4j.com/docs/cypher-manual/current/indexes/semantic-indexes/vector-indexes](https://neo4j.com/docs/cypher-manual/current/indexes/semantic-indexes/vector-indexes/)
- "Vector Database Comparison 2026." *SwarmsSignal* — [swarmsignal.net/vector-database-comparison-2026](https://swarmsignal.net/vector-database-comparison-2026/)

### Chapter 3 — Building RAG with JavaScript

- Transformers.js documentation — [huggingface.co/docs/transformers.js](https://huggingface.co/docs/transformers.js)
- Transformers.js on npm — [npmjs.com/package/@huggingface/transformers](https://www.npmjs.com/package/@huggingface/transformers)
- Neo4j JavaScript Driver — [npmjs.com/package/neo4j-driver](https://www.npmjs.com/package/neo4j-driver)
- pdf-parse on npm — [npmjs.com/package/pdf-parse](https://www.npmjs.com/package/pdf-parse)
- Neo4j GenAI with LangChain.js — [neo4j.com/labs/genai-ecosystem/langchain-js](http://neo4j.com/labs/genai-ecosystem/langchain-js/)
