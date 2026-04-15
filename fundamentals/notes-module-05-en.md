# Module 05 -- Artificial Intelligence on the Web

> Notes on chapters covering **Genetic Algorithms**, **Large Language Models (LLMs)**, **Web AI**, and **Multimodal Web AI**.

---

# Chapter 1: Genetic Algorithms

## Artificial intelligence beyond the basics

In previous modules we saw how to use AI to automate tasks such as object recognition in a game (Duck Hunt). However, in those cases the AI merely **recognised** visual patterns and pointed at coordinates — there was no genuine learning.

For an AI to truly **learn** to beat a game, we need different approaches. One of them is **reinforcement learning**, where an agent makes sequential decisions and receives rewards or penalties:

- In the snake game, the AI earns points by eating fruit and loses when it collides with a wall or its own body.
- At every move the agent receives a score and adjusts its decision policy.

Another approach, equally powerful and conceptually distinct, is **genetic algorithms**.

---

## What are genetic algorithms?

> A **genetic algorithm (GA)** is a stochastic global optimisation algorithm inspired by biological evolution and Darwin's natural selection. It belongs to the family of **evolutionary algorithms** (*evolutionary computing*).

Instead of training a single agent sequentially, a GA works with a **population** of candidate solutions. The best ones are selected, combined, and slightly modified to produce a new generation — repeating the cycle until satisfactory solutions are found.

The biological metaphor is direct:

| Biology                  | Genetic Algorithm              |
|--------------------------|--------------------------------|
| Individual               | Candidate solution             |
| Chromosome / DNA         | Encoded representation         |
| Gene                     | Individual parameter           |
| Fitness                  | Solution quality               |
| Natural selection        | Fitness-based selection        |
| Reproduction / crossover | Combining solutions            |
| Mutation                 | Random perturbation            |
| Generation               | Algorithm iteration            |

---

## Core components

### 1. Chromosome representation

Each candidate solution is encoded as a **chromosome**. Several encoding schemes exist:

- **Binary:** bit string — `10110010`. Used for decision problems (on/off) or when variables can be discretised.
- **Real (float):** vector of real numbers — `[3.2, -1.4, 0.8]`. Common in continuous optimisation.
- **Permutation:** sequence of indices — `[3, 1, 4, 2, 5]`. Used in ordering problems such as the Travelling Salesman Problem (TSP).

### 2. Population and initialisation

The algorithm starts with a **population** of *N* randomly generated individuals (or seeded with domain heuristics). Population size is a hyperparameter — typical values range from 20 to 200 individuals.

### 3. Fitness function

The **fitness function** evaluates each individual's quality. It is the equivalent of "fitness" in nature. Examples:

- In a car simulator: distance travelled before stopping.
- In the Chrome dinosaur game: number of obstacles cleared.
- For an antenna: signal gain and radiation pattern coverage.

> The fitness function is the **only** link between the real problem and the algorithm. A successful GA depends critically on a well-designed fitness function.

### 4. Selection

Selection chooses which individuals become "parents" for the next generation. The most common methods:

**Roulette Wheel:** the probability of selecting individual *i* is proportional to its fitness:

$$
P(i) = \frac{f(i)}{\sum_{j=1}^{N} f(j)}
$$

where \( f(i) \) is the fitness of individual *i* and *N* is the population size.

**Tournament:** *k* individuals are randomly picked and the best is selected. The parameter *k* (usually 2 or 3) controls selection pressure.

**Ranking:** the population is sorted by fitness and selection probability is based on rank rather than absolute value. This prevents a dominant individual from monopolising reproduction.

### 5. Crossover (Recombination)

**Crossover** combines genetic material from two parents to produce offspring. Main variants:

**Single-point crossover:**

```
Cut point: position 4
Parent 1: [1 0 1 1 | 0 0 1 0]
Parent 2: [0 1 0 0 | 1 1 0 1]
           ─────────┼─────────
Child 1:  [1 0 1 1 | 1 1 0 1]
Child 2:  [0 1 0 0 | 0 0 1 0]
```

**Two-point crossover:**

```
Cut points: positions 2 and 5
Parent 1: [1 0 | 1 1 0 | 0 1 0]
Parent 2: [0 1 | 0 0 1 | 1 0 1]
           ────┼───────┼──────
Child 1:  [1 0 | 0 0 1 | 0 1 0]
Child 2:  [0 1 | 1 1 0 | 1 0 1]
```

**Uniform crossover:** for each gene, a parent is randomly chosen to inherit from (50/50 probability).

The **crossover rate** defines the fraction of the population that undergoes crossover — typical values: 0.6–0.9.

### 6. Mutation

**Mutation** introduces random variation to maintain genetic diversity and prevent premature convergence.

| Type       | Description                             | Example                          |
|------------|-----------------------------------------|----------------------------------|
| Bit-flip   | Flips a random bit                      | `10110` → `10010`               |
| Swap       | Swaps two gene positions                | `[3,1,4,2]` → `[3,2,4,1]`     |
| Scramble   | Shuffles a sub-segment                  | `[3,1,4,2,5]` → `[3,4,1,2,5]` |
| Gaussian   | Adds normal noise to real-valued genes  | `2.5` → `2.5 + N(0, σ)`       |

The **mutation rate** is typically low (0.001–0.05 per gene).

> **Rate too high** → unpredictable results, the GA loses what it has already learned.
> **Rate too low** → stagnation, no exploration of new solutions.
> The secret lies in **balance**.

### 7. Elitism

**Elitism** ensures that the *n* best individuals pass directly to the next generation, unchanged. This prevents the best solution found so far from being accidentally lost.

---

## Full algorithm flow

```
1. Initialise random population of N individuals
2. Evaluate the fitness of each individual
3. REPEAT until stopping condition:
   a. Select parents (tournament, roulette, ranking)
   b. Apply crossover to generate offspring
   c. Apply mutation to offspring
   d. Evaluate offspring fitness
   e. Replace population (with elitism)
4. Return the best individual found
```

### JavaScript pseudocode

```js
function geneticAlgorithm({ populationSize, genes, fitnessFunc, generations, mutationRate, crossoverRate }) {
  let population = Array.from({ length: populationSize }, () =>
    Array.from({ length: genes }, () => Math.random())
  )

  for (let gen = 0; gen < generations; gen++) {
    const scored = population
      .map(individual => ({ individual, fitness: fitnessFunc(individual) }))
      .sort((a, b) => b.fitness - a.fitness)

    const elite = scored.slice(0, 2).map(s => s.individual)
    const nextGen = [...elite]

    while (nextGen.length < populationSize) {
      const parentA = tournamentSelect(scored, 3)
      const parentB = tournamentSelect(scored, 3)

      let [childA, childB] = Math.random() < crossoverRate
        ? onePointCrossover(parentA, parentB)
        : [parentA.slice(), parentB.slice()]

      childA = mutate(childA, mutationRate)
      childB = mutate(childB, mutationRate)

      nextGen.push(childA, childB)
    }

    population = nextGen.slice(0, populationSize)
  }

  return population
    .map(ind => ({ individual: ind, fitness: fitnessFunc(ind) }))
    .sort((a, b) => b.fitness - a.fitness)[0]
}

function tournamentSelect(scored, k) {
  const candidates = Array.from({ length: k }, () =>
    scored[Math.floor(Math.random() * scored.length)]
  )
  return candidates.sort((a, b) => b.fitness - a.fitness)[0].individual
}

function onePointCrossover(a, b) {
  const point = Math.floor(Math.random() * a.length)
  return [
    [...a.slice(0, point), ...b.slice(point)],
    [...b.slice(0, point), ...a.slice(point)]
  ]
}

function mutate(individual, rate) {
  return individual.map(gene =>
    Math.random() < rate ? gene + (Math.random() - 0.5) * 0.1 : gene
  )
}
```

---

## Parameters and tuning

| Parameter           | Description                                       | Typical values   |
|---------------------|---------------------------------------------------|------------------|
| Population size     | Number of individuals per generation              | 20–200           |
| Crossover rate      | Probability of crossover between two parents      | 0.6–0.9          |
| Mutation rate       | Probability of mutation per gene                  | 0.001–0.05       |
| Tournament size     | Number of candidates in tournament selection      | 2–5              |
| Elitism             | Number of best individuals preserved              | 1–5              |
| Generations         | Number of algorithm iterations                    | 50–1000+         |

In vehicle simulations (such as BoxCar2D), additional parameters come into play:

- **Gravity:** affects simulated body dynamics.
- **Terrain shape:** flat, hilly, with obstacles — each favours different body shapes.
- **Friction and elasticity:** influence how vehicles interact with the ground.

---

## Simulations and unexpected creativity

The outcome of evolution can be surprising. The generated "cars" often have **unusual shapes** that no human would design, yet they work incredibly well within the evaluation criteria. Evolution prioritises **performance**, not **aesthetics**.

### Browser-based simulators

Several interactive simulators let you watch evolution in real time:

- **BoxCar2D** — [boxcar2d.com](http://boxcar2d.com/) — the original simulator using the Box2D physics engine. Generates 20 random shapes with wheels and evolves across generations.
- **HTML5 Genetic Cars** — [github.com/red42/HTML5_Genetic_Cars](https://github.com/red42/HTML5_Genetic_Cars) — HTML5 Canvas reimplementation in pure JavaScript, no build tools needed.
- **Genetic Cars (Matter.js)** — [geneticcars.willwade.dev](https://geneticcars.willwade.dev/) — modern version using the Matter.js physics engine, with advanced controls for crossover methods, selection, and state saving.

In these simulators you can adjust mutation rate, elitism, terrain type, and observe how those parameters influence evolution.

---

## Real-world use cases

### NASA antenna (Space Technology 5)

One of the most notable applications of genetic algorithms is the design of the **X-band antenna** for NASA's **Space Technology 5 (ST5)** mission, launched in 2006.

- The GA automatically generated an antenna design that **outperformed** the hand-designed antenna built by engineers.
- The design was completed in **3 months** (versus 5 months for the conventional process).
- When mission requirements changed (orbital parameters), a new antenna was evolved in **just a few weeks**.
- It was the **first computer-evolved hardware** ever sent to space.

The evolved antenna had an organic, irregular shape that no human engineer would have designed, yet it perfectly met gain and coverage requirements.

### Chrome dinosaur game

Several projects use GA + neural networks to teach an AI to play the Chrome T-Rex game:

- **IAMDinosaur** ([github.com/ivanseidel/IAMDinosaur](https://github.com/ivanseidel/IAMDinosaur)) — Node.js implementation using the Synaptic library. The neural network receives as inputs the distance to the next obstacle, obstacle size, and current speed, and decides whether to jump, duck, or do nothing. The population of networks is evolved with a GA.
- **dino-neat** ([github.com/AkashKarnatak/dino-neat](https://github.com/AkashKarnatak/dino-neat)) — uses the **NEAT** algorithm (NeuroEvolution of Augmenting Topologies) to evolve both the topology and weights of the neural network simultaneously.
- **TensorFlow.js** — an approach that uses TensorFlow.js to build and evolve networks directly in the browser.

In all cases, the AI **learns on its own** to jump and dodge obstacles, with no specific instructions on how to play.

### Other applications

- **Logistics and routing:** delivery route optimisation (TSP variants).
- **Scheduling:** task allocation to resources (job-shop scheduling).
- **Circuit design:** integrated circuit layout optimisation.
- **Bioinformatics:** DNA/protein sequence alignment.
- **Games and simulations:** AIs that learn to park cars, perform parallel parking with drift, and other emergent behaviours.

---

## Genetic algorithms vs. reinforcement learning

| Criterion                | Genetic Algorithm (GA)                           | Reinforcement Learning (RL)                      |
|--------------------------|--------------------------------------------------|--------------------------------------------------|
| **Unit of work**         | Population of solutions                          | Individual agent                                 |
| **How it learns**        | Evolution: selection, crossover, mutation         | Trial and error with rewards                     |
| **Decision type**        | Global evaluation of each solution               | Sequential step-by-step decisions                |
| **Feedback**             | Fitness computed at end of evaluation             | Reward at each action                            |
| **Parallelism**          | Naturally parallel (entire population)            | Typically one agent at a time                    |
| **Search space**         | Broad, diverse exploration                        | Focused exploration via policy                   |
| **Strengths**            | Combinatorial problems, gradient-free             | Sequential decisions, dynamic environments       |
| **Weaknesses**           | Slow for very large spaces, no memory             | Sensitive to reward shaping                      |
| **Classic example**      | Evolving a car shape                              | Teaching an agent to play Atari                  |

> There is no universal winner — the choice depends on the problem. Recent research (Salimans et al., 2017) shows that in continuous control tasks, neither approach consistently dominates.

---

# Chapter 2: How LLMs Work — Transformers, Embeddings, Attention

## What are LLMs?

> **LLM** (*Large Language Model*) is a large-scale language model trained on massive amounts of text to learn patterns in human language and generate coherent responses.

The term **GPT** (*Generative Pre-trained Transformer*) breaks down as:

- **Generative** — the model generates text.
- **Pre-trained** — it is pre-trained on huge text corpora before being fine-tuned for specific tasks.
- **Transformer** — the neural network architecture that makes it all possible (Vaswani et al., 2017).

### Scale of modern models

| Model            | Parameters        | Training data           | Context window     |
|------------------|-------------------|-------------------------|--------------------|
| GPT-2 (2019)     | 1.5 billion       | ~40 GB of text          | 1,024 tokens       |
| GPT-3 (2020)     | 175 billion       | ~570 GB of text         | 4,096 tokens       |
| GPT-4 (2023)     | ~1.8 trillion*    | Undisclosed             | 128,000 tokens     |
| LLaMA 3 (2024)   | 8–70 billion      | ~15 trillion tokens     | 128,000 tokens     |
| Claude 3.5 (2024)| Undisclosed       | Undisclosed             | 200,000 tokens     |
| Gemini 2.0 (2025)| Undisclosed       | Undisclosed             | 2,000,000 tokens   |

*\* Estimated values, not officially confirmed.*

---

## 1. Tokenisation

Before processing text, the model needs to convert it into numbers. This process is called **tokenisation**.

### How it works

Text is broken into smaller units called **tokens**. Tokens are **not** necessarily words — they can be subwords, spaces, punctuation, or special characters.

The most common method is **Byte Pair Encoding (BPE)**:

1. Start with each character as an individual token.
2. Identify the most frequent pair of adjacent tokens.
3. Merge that pair into a new token.
4. Repeat until the desired vocabulary size is reached.

### Example

```
Original text: "artificial intelligence"

Possible tokenisation:
["artificial", " intelligence"]
→ 2 tokens

In Portuguese: "inteligência artificial"
["int", "elig", "ência", " ", "art", "ificial"]
→ 6 tokens
```

> A single word can contain **multiple tokens**. When a model limits a prompt to 4,000 tokens, that does **not** mean 4,000 words — it is usually fewer.

### Practical impact

- Languages with long or agglutinative words (like German or Portuguese) consume more tokens per word.
- Code and special characters can consume tokens unexpectedly.
- GPT-2's vocabulary contains roughly **50,257 tokens**.
- Optimising prompts to use fewer tokens reduces costs on commercial APIs.

---

## 2. Embeddings

Once tokenised, each token is transformed into a **vector of numbers** called an **embedding**. These vectors represent the **meaning** of words in context.

### Typical dimensions

| Model    | Embedding dimension |
|----------|---------------------|
| GPT-2    | 768                 |
| GPT-3    | 12,288              |
| LLaMA    | 4,096               |

### Semantic relationships

Words that appear in similar contexts end up with embeddings close together in vector space. This enables **vector arithmetic**:

$$
\vec{King} - \vec{Man} + \vec{Woman} \approx \vec{Queen}
$$

$$
\vec{Paris} - \vec{France} + \vec{Italy} \approx \vec{Rome}
$$

These relationships emerge naturally from training — the model was never explicitly taught about geography or gender.

### Word2Vec — how embeddings are learned

**Word2Vec** (Mikolov et al., 2013) was one of the first effective methods for learning embeddings. Two architectures:

- **CBOW** (*Continuous Bag of Words*): predicts the centre word from its context.
- **Skip-gram**: predicts context words from the centre word.

Modern models (such as GPT) learn embeddings as part of end-to-end training, but the principle is the same: **words in similar contexts receive similar vectors**.

### Cosine similarity

To measure the similarity between two embeddings, **cosine similarity** is used:

$$
\text{sim}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{||\vec{A}|| \cdot ||\vec{B}||} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}
$$

- Value **1**: identical direction (maximum similarity).
- Value **0**: orthogonal vectors (no relationship).
- Value **-1**: opposite vectors.

### Positional Encoding

Embeddings alone carry no **order** information. For the model to distinguish "the dog bit the man" from "the man bit the dog", **positional encodings** are added — vectors that encode each token's position in the sequence.

The original Transformer uses sinusoidal functions:

$$
PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d}}\right)
$$

$$
PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d}}\right)
$$

where *pos* is the token position, *i* is the dimension, and *d* is the total embedding dimension.

---

## 3. The Transformer architecture

### Historical context

Before Transformers, language models used **RNNs** (*Recurrent Neural Networks*) and **LSTMs** (*Long Short-Term Memory*). These models processed tokens **sequentially** (one at a time), which created two problems:

1. **Slowness:** training could not be parallelised.
2. **Long-range dependencies:** information at the start of the sequence "faded" during processing (*vanishing gradient*).

In 2017, Vaswani et al. published **"Attention Is All You Need"**, introducing the **Transformer** — an architecture that processes all tokens **in parallel** and captures long-range dependencies through the **attention** mechanism.

### Encoder-decoder structure

```
         ┌─────────────────────────┐
         │       ENCODER           │
         │  ┌───────────────────┐  │
Input  →│  │ Multi-Head Attention│  │
         │  └───────┬───────────┘  │
         │  ┌───────▼───────────┐  │
         │  │ Feed-Forward NN   │  │
         │  └───────┬───────────┘  │
         │          │  × N layers  │
         └──────────┼──────────────┘
                    │
         ┌──────────▼──────────────┐
         │       DECODER           │
         │  ┌───────────────────┐  │
         │  │ Masked Multi-Head │  │
         │  │ Self-Attention    │  │
         │  └───────┬───────────┘  │
         │  ┌───────▼───────────┐  │
         │  │ Multi-Head Attn   │  │
         │  │ (encoder-decoder) │  │
         │  └───────┬───────────┘  │
         │  ┌───────▼───────────┐  │
Output ← │  │ Feed-Forward NN   │  │
         │  └───────────────────┘  │
         │          × N layers     │
         └─────────────────────────┘
```

In the original paper, *N* = 6 layers in each stack, with 512-dimensional embeddings.

> **Note:** Models like GPT use only the **decoder** (no encoder). BERT uses only the **encoder**. T5 uses both.

### Self-Attention — the core idea

The **Self-Attention** mechanism allows each token to "attend to" all other tokens in the sequence during processing. Example:

> "Maria told Ana that **she** was promoted."

The token "she" could refer to either Maria or Ana. The attention mechanism computes the relevance of each token to disambiguate.

### Query, Key, Value (Q, K, V)

For each token, the model generates three vectors via linear transformations:

- **Query (Q):** "What am I looking for?"
- **Key (K):** "What do I have to offer?"
- **Value (V):** "What is my content?"

The attention computation:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V
$$

where \( d_k \) is the dimension of the key vectors. Dividing by \( \sqrt{d_k} \) prevents dot products from becoming too large, stabilising the gradient.

### Multi-Head Attention

Instead of computing a single attention, the Transformer splits the embeddings into **multiple heads** and computes attention in parallel across each one:

- GPT-2: **12 heads** of 64 dimensions each (12 × 64 = 768).
- GPT-3: **96 heads** of 128 dimensions each.

Each head can capture a different type of relationship (syntactic, semantic, positional). The results are concatenated and projected back to the original dimension.

### Why better than RNNs?

| Characteristic        | RNN / LSTM                       | Transformer                        |
|-----------------------|----------------------------------|------------------------------------|
| Processing            | Sequential (token by token)      | Parallel (all at once)             |
| Long-range deps       | Difficult (vanishing gradient)   | Native (direct attention)          |
| Training speed        | Slow                             | Much faster (parallelisation)      |
| Scalability           | Limited                          | Scales with hardware (GPUs/TPUs)   |

---

## 4. Probabilities and decoding

After the Transformer processes the embeddings, the final layer produces a vector of **logits** — raw scores for each token in the vocabulary. These logits are converted to probabilities via **softmax**:

$$
P(token_i) = \frac{e^{z_i}}{\sum_{j=1}^{V} e^{z_j}}
$$

where \( z_i \) is the logit for token *i* and *V* is the vocabulary size.

### Example

For the phrase "The sky is...", the model might generate:

| Token     | Probability |
|-----------|-------------|
| blue      | 55%         |
| cloudy    | 18%         |
| clear     | 10%         |
| beautiful | 7%          |
| dark      | 4%          |
| (others)  | 6%          |

### Decoding strategies

**Greedy:** always picks the highest-probability token. Simple, but tends to produce repetitive, low-diversity text.

**Beam Search:** maintains *b* candidate sequences in parallel and expands the most probable ones. Better quality than greedy, but can still be repetitive.

**Sampling with Temperature:** **temperature** (*T*) rescales the logits before softmax:

$$
P(token_i) = \frac{e^{z_i / T}}{\sum_{j=1}^{V} e^{z_j / T}}
$$

| Temperature | Effect                                                    |
|-------------|-----------------------------------------------------------|
| T < 1.0     | Amplifies differences → more deterministic, less creative |
| T = 1.0     | Default softmax, no modification                          |
| T > 1.0     | Compresses differences → more random, more creative       |
| T → 0       | Equivalent to greedy (always picks the most probable)     |

**Top-K:** limits the choice to the *K* most probable tokens, discarding the rest. Example with K=3 in the scenario above: chooses only among "blue", "cloudy", and "clear".

**Top-P (Nucleus Sampling):** selects the smallest set of tokens whose cumulative probability reaches the threshold *p*. Proposed by Holtzman et al. (2019).

Process:
1. Sort tokens by probability in descending order.
2. Sum probabilities until exceeding *p* (e.g., 0.90).
3. Sample from this subset.

Advantage: adapts to the model's confidence — when the model is confident, the subset is small; when uncertain, it is larger.

> In practice, these parameters can be combined. An API might accept `temperature=0.7`, `top_p=0.9`, and `top_k=50` simultaneously.

---

## 5. Step-by-step generation (Autoregressive sampling)

The AI does **not** generate all text at once. It generates **token by token**, in an **autoregressive** manner:

```
Iteration 1: Input = "The sky is"       → Generates "blue"
Iteration 2: Input = "The sky is blue"  → Generates "and"
Iteration 3: Input = "The sky is blue and" → Generates "clear"
...
```

At each iteration:

1. The model analyses all text generated so far (context).
2. Computes probabilities for the next tokens.
3. Picks a token (according to the configured decoding strategy).
4. Adds the token to the context.
5. Repeats until generating an end token (`<EOS>`) or reaching the limit.

> The longer the generated text, the **higher the computational cost**, since the model needs to reprocess the entire context for each new token. This is the main bottleneck of LLMs.

---

## 6. Hallucinations and limitations

### What are hallucinations?

> The model does **not know** what is true or false. It generates the most **probable** token given the context — and probable tokens are not always factual.

When information is missing, the prompt is ambiguous, or the topic is under-represented in training data, the model can produce **false but convincing** statements.

### Types of hallucination

| Type                    | Description                                                | Example                                             |
|-------------------------|------------------------------------------------------------|-----------------------------------------------------|
| Factual fabrication     | Invents facts that do not exist                            | "Python was created in 1985 by Linus Torvalds"     |
| Citation fabrication    | Generates non-existent bibliographic references            | Made-up articles with fake DOIs                     |
| Entity confusion        | Mixes attributes of different entities                     | Attributing Shakespeare's works to Dickens          |
| Temporal confusion      | Outdated or time-mixed data                                | "The current president of the US is..."             |
| Numerical fabrication   | Generates made-up statistics or numbers                    | "73.4% of developers use..."                        |

### Hallucination rates by domain

- Facts about well-known entities: **3–5%**
- Niche technical domains: **15–30%**
- Medical/legal queries (without mitigation): **10–20%**

### How to mitigate hallucinations

1. **RAG (Retrieval-Augmented Generation):** the model queries an external knowledge base before answering, grounding the response in real documents.
2. **Prompt engineering:** provide complete context, instruct the model to say "I don't know" when unsure.
3. **Programmatic guardrails:** systems like NeMo Guardrails that validate model output.
4. **Citation verification:** confirm sources generated by the model.
5. **Confidence scoring:** measure model uncertainty and flag low-confidence answers.
6. **Multi-agent validation:** use multiple models to verify the same answer.

---

## 7. Modern models and trends (2025–2026)

- **Expanded context windows:** Gemini 2.0 Pro reaches 2 million tokens, allowing processing of entire books or code repositories in a single call.
- **Reasoning models:** models that "think" before answering (internal chain-of-thought), improving accuracy on logical and mathematical tasks.
- **Open-weight models:** LLaMA, Mistral, Qwen, and others narrow the performance gap with proprietary models, democratising access.
- **Multimodality:** models that process text, images, audio, and video within the same architecture.
- **Agents:** LLMs that can use tools (web search, code execution, APIs) autonomously.

---

# Chapter 3: Web AI — How AI Works in the Browser

## The Web 4.0 vision

The term **Web 4.0** describes a new generation of the internet where artificial intelligence is **native to the browser**. Instead of relying on remote servers, applications can run AI models directly on the user's machine. Models such as Google's **Gemini Nano** and **DeepSeek** are already being used this way.

> Web 4.0 is the vision of a future where browsers become the true operating systems — capable of running AI natively, for free, and in a decentralised fashion.

Key benefits of on-device AI:

- **Privacy:** user data never leaves the device.
- **Performance:** acceptable latency even for complex tasks, no network round-trip.
- **Cost:** free inference — no API tokens consumed.
- **Offline capability:** works without an internet connection after the initial model download.

---

## Chrome Built-in AI APIs

Google has been investing in **experimental APIs** that embed models like **Gemini Nano** directly into the Chrome browser. Once the browser is installed, the model is downloaded once and shared across all origins — eliminating per-site downloads.

### API landscape

| API | Purpose | Status (Chrome 138+) |
|-----|---------|---------------------|
| **Prompt API** (`LanguageModel`) | Free-form text generation | Stable (text); Origin Trial (multimodal, Chrome 139–144) |
| **Translator API** | On-device text translation | Stable |
| **Language Detector API** | Identify the language of text | Stable |
| **Summarizer API** | Generate summaries from text | Stable |

All four APIs run **entirely on-device** using WebAssembly and WebGPU — no cloud round-trips are involved.

### Hardware requirements

| Requirement | Minimum |
|-------------|---------|
| Disk space | 22 GB free |
| GPU VRAM | > 4 GB |
| CPU fallback | 16 GB RAM, 4+ cores |
| Platforms | Windows 10+, macOS 13+, Linux (no mobile) |

Model status can be inspected at `chrome://on-device-internals`.

---

## The Prompt API in practice

The **Prompt API** (`self.ai.languageModel` or `LanguageModel`) is the primary interface for interacting with Gemini Nano in the browser. It supports creating sessions with system prompts and controlling generation parameters.

### Creating a session and prompting

```js
const session = await LanguageModel.create({
  systemPrompt: "You are a helpful assistant specialising in web development.",
  temperature: 0.7,
  topK: 40
});

// Non-streaming
const answer = await session.prompt("What is the event loop?");

// Streaming (token by token)
const stream = session.promptStreaming("Explain closures in JavaScript.");
for await (const chunk of stream) {
  console.log(chunk);
}
```

### Checking availability and monitoring download

```js
const availability = await LanguageModel.availability();
// "available" | "downloadable" | "downloading" | "unavailable"

const session = await LanguageModel.create({
  monitor(m) {
    m.addEventListener("downloadprogress", (e) => {
      console.log(`Model download: ${(e.loaded * 100).toFixed(1)}%`);
    });
  }
});
```

---

## Temperature and Top-K

Two parameters control the **creativity** and **variety** of responses:

**Temperature** rescales the logits before softmax (see Chapter 2):

$$
P(token_i) = \frac{e^{z_i / T}}{\sum_{j} e^{z_j / T}}
$$

| Temperature | Behaviour |
|-------------|-----------|
| T → 0 | Almost deterministic — always picks the most probable token |
| T = 1 | Default softmax distribution |
| T > 1 | Flatter distribution — more diverse, creative output |

**Top-K** limits the candidate pool to the *K* most probable tokens before sampling. A small K yields focused responses; a large K allows more variation.

### Practical example

- **Prompt:** "The sky is..."
- `temperature=0, topK=1` → "blue" (nearly every time).
- `temperature=2, topK=10` → "vast", "limitless", "full of stars", etc.

---

## Semantic similarity validation

Recalling the embedding concepts from Chapter 2, Gemini Nano also supports basic semantic reasoning. For example:

- **Prompt:** "King − man + woman = ?"
- **Result:** "Queen"

This demonstrates that the model's internal embeddings capture analogical relationships, even when running on-device in a lightweight form.

---

## Challenges and limitations

Despite the benefits, on-device AI comes with significant caveats:

| Challenge | Detail |
|-----------|--------|
| Model size | Gemma ≈ 2.5 GB, DeepSeek ≈ 1.3 GB — large initial downloads |
| Mobile experience | Download times can be prohibitive on cellular networks |
| Browser support | Currently Chrome-only; other browsers lack native support |
| Model capability | Gemini Nano is optimised for summarisation and classification, not large-scale reasoning |
| Hardware floor | Requires modern GPU or substantial RAM |

---

# Chapter 4: Web AI Multimodal

## Beyond text: multimodal inputs

**Multimodality** is the ability of an AI system to process and relate different types of data — text, images, and audio — within a single interaction.

> A multimodal model does not merely accept different formats; it can **relate** content across modalities. You can send an image and ask a question about it, and the model understands both.

Examples of multimodal interactions:

- Send an image and ask "What is in this photo?"
- Send an audio clip and request a transcription.
- Combine text and image in the same prompt for a contextualised answer.

---

## Chrome Prompt API — multimodal support

Starting with Chrome 139, the Prompt API supports **image and audio inputs** alongside text through an Origin Trial (running through Chrome 144).

### Creating a multimodal session

```js
// Image support
const session = await LanguageModel.create({
  expectedInputs: [{ type: "image" }]
});

// Audio support (requires GPU with ≥ 4 GB VRAM)
const audioSession = await LanguageModel.create({
  expectedInputs: [{ type: "audio" }]
});
```

### Sending images in prompts

Images are passed as `ImageBitmap` objects (or directly as `File`/`Blob`):

```js
const file = document.querySelector("#imgUpload").files[0];
const imageBitmap = await createImageBitmap(file);

const description = await session.prompt([
  "Describe the contents of this image in detail.",
  { type: "image", content: imageBitmap }
]);
```

### Structured output with images

Multimodal input can be combined with **JSON schema constraints** to produce structured responses:

```js
const schema = {
  type: "object",
  required: ["tags", "description"],
  additionalProperties: false,
  properties: {
    tags: {
      description: "Objects identified in the image",
      type: "array",
      items: { type: "string" }
    },
    description: {
      description: "One-sentence description of the scene",
      type: "string"
    }
  }
};

const result = await session.prompt([
  "Analyse the image and return structured data.",
  { type: "image", content: imageBitmap }
], { responseConstraint: schema });

const parsed = JSON.parse(result);
// { tags: ["man", "laptop", "dog"], description: "A relaxing sunset scene..." }
```

---

## Practical demonstration

The classroom demo ("Exemplo 05 — Web AI Multimodal") demonstrated capabilities that run **100 % offline** in the browser:

| Input | Result |
|-------|--------|
| Photo of a person with a laptop and a dog | Correctly described as "a relaxing sunset scene with a man, a laptop, and a dog" |
| Image of a CNPJ card (Brazilian tax ID) | Extracted fields: CNPJ number, company name, address, phone, status |
| Audio recording (English) | Transcribed to text |

---

## Handling language limitations

Although the Prompt API accepts Portuguese text prompts, multimodal features (image and audio) still produce better results in **English**. The workaround demonstrated in class uses the built-in **Translator API** as a bridge:

```
User input (PT) → Translate to EN → Process with multimodal AI → Output (EN) → Translate back to PT
```

This round-trip is transparent to the user and completes quickly thanks to on-device translation.

```js
const translator = await Translator.create({
  sourceLanguage: "pt",
  targetLanguage: "en"
});
const englishPrompt = await translator.translate(userPromptPT);

const result = await session.prompt([
  englishPrompt,
  { type: "image", content: imageBitmap }
]);

const backTranslator = await Translator.create({
  sourceLanguage: "en",
  targetLanguage: "pt"
});
const resultPT = await backTranslator.translate(result);
```

---

## Use cases

| Domain | Application |
|--------|-------------|
| **Accessibility** | Automatic alt-text generation, image descriptions for screen readers, audio transcription |
| **Document processing** | Offline OCR of IDs, invoices, tax documents |
| **Content moderation** | Verify uploaded images match site topic before submission |
| **Intelligent assistants** | Site-embedded agents that see, hear, and respond without sending data to servers |

---

## The bigger picture

The ability to run multimodal AI in the browser fundamentally changes how we think about web applications. Assistants can now **see**, **hear**, and **respond** — with acceptable performance and without compromising privacy.

We are at the threshold of a new generation of digital experiences. The future of AI on the web is **local**, **private**, **multimodal**, and **accessible**.

---

## Suggested readings

### Chapter 1 — Genetic Algorithms

- Holland, John H. *Adaptation in Natural and Artificial Systems*. MIT Press, 1992. (Foundational GA work)
- Mitchell, Melanie. *An Introduction to Genetic Algorithms*. MIT Press, 1998.
- Hornby, G. et al. "Automated Antenna Design with Evolutionary Algorithms." *NASA Technical Reports*, 2006. [ntrs.nasa.gov](https://ntrs.nasa.gov/citations/20060024675)
- BoxCar2D — [boxcar2d.com](http://boxcar2d.com/)
- HTML5 Genetic Cars — [github.com/red42/HTML5_Genetic_Cars](https://github.com/red42/HTML5_Genetic_Cars)
- IAMDinosaur — [github.com/ivanseidel/IAMDinosaur](https://github.com/ivanseidel/IAMDinosaur)

### Chapter 2 — LLMs and Transformers

- Vaswani, A. et al. "Attention Is All You Need." *NeurIPS*, 2017. [arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
- Mikolov, T. et al. "Efficient Estimation of Word Representations in Vector Space." *ICLR*, 2013. (Word2Vec)
- Holtzman, A. et al. "The Curious Case of Neural Text Degeneration." *ICLR*, 2020. (Nucleus Sampling / Top-P)
- Jay Alammar. "The Illustrated Transformer." [jalammar.github.io](https://jalammar.github.io/illustrated-transformer/)
- Andrej Karpathy. "Let's build GPT from scratch." [YouTube](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- LLM Visualization — [bbycroft.net/llm](https://bbycroft.net/llm)
- OpenAI Tokenizer — [platform.openai.com/tokenizer](https://platform.openai.com/tokenizer)

### Chapter 3 — Web AI

- Chrome Built-in AI documentation — [developer.chrome.com/docs/ai/built-in](https://developer.chrome.com/docs/ai/built-in)
- Chrome Prompt API reference — [developers.chrome.com/docs/ai/prompt-api](https://developers.chrome.com/docs/ai/prompt-api)
- "Build a chatbot with the Prompt API." *web.dev* — [web.dev/articles/ai-chatbot-promptapi](https://web.dev/articles/ai-chatbot-promptapi)
- Chrome session management best practices — [developers.chrome.com/docs/ai/session-management](https://developers.chrome.com/docs/ai/session-management)
- "Chrome's Built-In AI: Gemini Nano and Prompt API Complete Guide." *flaming.codes* — [flaming.codes/posts/chrome-gemini-nano-built-in-ai](https://flaming.codes/posts/chrome-gemini-nano-built-in-ai)

### Chapter 4 — Web AI Multimodal

- Chrome Prompt API multimodal Origin Trial — [developer.chrome.com/blog/prompt-multimodal-origin-trial](https://developer.chrome.com/blog/prompt-multimodal-origin-trial)
- Camden, Raymond. "Multimodal Support in Chrome's Built-in AI." — [raymondcamden.com/2025/05/22/multimodal-support-in-chromes-built-in-ai](https://www.raymondcamden.com/2025/05/22/multimodal-support-in-chromes-built-in-ai)
- Chrome Translator API — [developer.chrome.com/docs/ai/translator-api](https://developer.chrome.com/docs/ai/translator-api)
- Chrome Language Detector API — [developer.chrome.com/blog/language-detection-origin-trial](https://developer.chrome.com/blog/language-detection-origin-trial)
