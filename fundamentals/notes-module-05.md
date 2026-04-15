# Módulo 05 -- Inteligência Artificial na Web

> Notas dos capítulos sobre **Algoritmos Genéticos** e **Large Language Models (LLMs)**.

---

# Capítulo 1: Algoritmos Genéticos

## Inteligência artificial além do básico

Nos módulos anteriores vimos como utilizar IA para automatizar tarefas como reconhecimento de objetos num jogo (Duck Hunt). Contudo, nesses casos a IA apenas **reconhecia** padrões visuais e apontava coordenadas — não havia aprendizado genuíno.

Para que uma IA **aprenda** a vencer um jogo, precisamos de abordagens diferentes. Uma delas é o **aprendizado por reforço** (*reinforcement learning*), em que um agente toma decisões sequenciais e recebe recompensas ou penalizações:

- No jogo da cobrinha, a IA ganha pontos ao comer frutas e perde ao colidir com a parede ou com o próprio corpo.
- A cada movimento o agente recebe uma pontuação e ajusta a sua política de decisão.

Outra abordagem, igualmente poderosa e conceitualmente distinta, são os **algoritmos genéticos**.

---

## O que são algoritmos genéticos?

> Um **algoritmo genético (AG)** é um algoritmo de otimização global estocástico inspirado na evolução biológica e na seleção natural de Darwin. Pertence à família dos **algoritmos evolutivos** (*evolutionary computing*).

Em vez de treinar um único agente de forma sequencial, um AG trabalha com uma **população** de soluções candidatas. As melhores são selecionadas, combinadas e ligeiramente modificadas para produzir uma nova geração — repetindo o ciclo até encontrar soluções satisfatórias.

A metáfora biológica é direta:

| Biologia              | Algoritmo Genético               |
|-----------------------|----------------------------------|
| Indivíduo             | Solução candidata                |
| Cromossoma / ADN      | Representação codificada         |
| Gene                  | Parâmetro individual             |
| Aptidão (fitness)     | Qualidade da solução             |
| Seleção natural       | Seleção por fitness              |
| Reprodução / crossover| Combinação de soluções           |
| Mutação               | Perturbação aleatória            |
| Geração               | Iteração do algoritmo            |

---

## Componentes fundamentais

### 1. Representação cromossómica

Cada solução candidata é codificada como um **cromossoma**. Existem vários esquemas de codificação:

- **Binário:** cadeia de bits — `10110010`. Usado em problemas de decisão (on/off) ou quando as variáveis podem ser discretizadas.
- **Real (float):** vetor de números reais — `[3.2, -1.4, 0.8]`. Comum em otimização contínua.
- **Permutação:** sequência de índices — `[3, 1, 4, 2, 5]`. Usado em problemas de ordenação como o Problema do Caixeiro-Viajante (TSP).

### 2. População e inicialização

O algoritmo começa com uma **população** de *N* indivíduos gerados aleatoriamente (ou com heurísticas de domínio). O tamanho da população é um hiperparâmetro — valores típicos vão de 20 a 200 indivíduos.

### 3. Função de fitness

A **função de fitness** avalia a qualidade de cada indivíduo. É o equivalente à "aptidão" na natureza. Exemplos:

- Num simulador de carros: distância percorrida antes de parar.
- No jogo do dinossauro do Chrome: número de obstáculos ultrapassados.
- Numa antena: ganho de sinal e cobertura do diagrama de radiação.

> A função de fitness é o **único** elo entre o problema real e o algoritmo. Um AG bem-sucedido depende criticamente de uma boa função de fitness.

### 4. Seleção

A seleção escolhe quais indivíduos serão "pais" da próxima geração. Os métodos mais comuns:

**Roleta (Roulette Wheel):** a probabilidade de selecionar o indivíduo *i* é proporcional ao seu fitness:

$$
P(i) = \frac{f(i)}{\sum_{j=1}^{N} f(j)}
$$

onde \( f(i) \) é o fitness do indivíduo *i* e *N* é o tamanho da população.

**Torneio (Tournament):** escolhem-se *k* indivíduos aleatoriamente e seleciona-se o melhor. O parâmetro *k* (geralmente 2 ou 3) controla a pressão seletiva.

**Ranking:** ordena-se a população por fitness e atribui-se uma probabilidade baseada na posição, não no valor absoluto. Evita que um indivíduo dominante monopolize a reprodução.

### 5. Crossover (Cruzamento)

O **crossover** combina material genético de dois pais para gerar filhos. Principais variantes:

**Crossover de 1 ponto:**

```
Ponto de corte: posição 4
Pai 1:  [1 0 1 1 | 0 0 1 0]
Pai 2:  [0 1 0 0 | 1 1 0 1]
         ─────────┼─────────
Filho 1:[1 0 1 1 | 1 1 0 1]
Filho 2:[0 1 0 0 | 0 0 1 0]
```

**Crossover de 2 pontos:**

```
Pontos de corte: posições 2 e 5
Pai 1:  [1 0 | 1 1 0 | 0 1 0]
Pai 2:  [0 1 | 0 0 1 | 1 0 1]
         ────┼───────┼──────
Filho 1:[1 0 | 0 0 1 | 0 1 0]
Filho 2:[0 1 | 1 1 0 | 1 0 1]
```

**Crossover uniforme:** para cada gene, escolhe-se aleatoriamente de qual pai herdar (com probabilidade 50/50).

A **taxa de crossover** (*crossover rate*) define a fração da população que passa por cruzamento — valores típicos: 0.6–0.9.

### 6. Mutação

A **mutação** introduz variação aleatória para manter a diversidade genética e evitar convergência prematura.

| Tipo       | Descrição                                   | Exemplo                          |
|------------|---------------------------------------------|----------------------------------|
| Bit-flip   | Inverte um bit aleatório                    | `10110` → `10010`               |
| Swap       | Troca dois genes de posição                 | `[3,1,4,2]` → `[3,2,4,1]`     |
| Scramble   | Embaralha um sub-segmento                   | `[3,1,4,2,5]` → `[3,4,1,2,5]` |
| Gaussiana  | Soma ruído normal a genes reais             | `2.5` → `2.5 + N(0, σ)`       |

A **taxa de mutação** (*mutation rate*) é geralmente baixa (0.001–0.05 por gene).

> **Taxa muito alta** → resultados imprevisíveis, o AG perde o que já aprendeu.
> **Taxa muito baixa** → estagnação, sem exploração de novas soluções.
> O segredo está no **equilíbrio**.

### 7. Elitismo

O **elitismo** garante que os *n* melhores indivíduos passam diretamente para a próxima geração, sem alteração. Isso impede que a melhor solução encontrada até ao momento se perca por acaso.

---

## Fluxo completo do algoritmo

```
1. Inicializar população aleatória de N indivíduos
2. Avaliar o fitness de cada indivíduo
3. REPETIR até condição de paragem:
   a. Selecionar pais (torneio, roleta, ranking)
   b. Aplicar crossover para gerar filhos
   c. Aplicar mutação nos filhos
   d. Avaliar fitness dos filhos
   e. Substituir a população (com elitismo)
4. Retornar o melhor indivíduo encontrado
```

### Pseudocódigo em JavaScript

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

## Parâmetros e ajustes

| Parâmetro            | Descrição                                              | Valores típicos  |
|----------------------|--------------------------------------------------------|------------------|
| Tamanho da população | Número de indivíduos por geração                       | 20–200           |
| Taxa de crossover    | Probabilidade de cruzamento entre dois pais            | 0.6–0.9          |
| Taxa de mutação      | Probabilidade de mutação por gene                      | 0.001–0.05       |
| Tamanho do torneio   | Número de candidatos no torneio de seleção             | 2–5              |
| Elitismo             | Número de melhores indivíduos preservados              | 1–5              |
| Gerações             | Número de iterações do algoritmo                       | 50–1000+         |

Em simulações de veículos (como BoxCar2D), parâmetros adicionais entram em jogo:

- **Gravidade:** afeta a dinâmica dos corpos simulados.
- **Formato do terreno:** plano, ondulado, com obstáculos — cada um favorece formas diferentes.
- **Fricção e elasticidade:** influenciam como os veículos interagem com o solo.

---

## Simulações e criatividade inesperada

O resultado da evolução pode ser surpreendente. Os "carros" gerados frequentemente possuem **formas incomuns** que um humano jamais projetaria, mas que funcionam incrivelmente bem dentro dos critérios de avaliação. A evolução prioriza **desempenho**, não **estética**.

### Simuladores no navegador

Existem vários simuladores interativos que permitem acompanhar a evolução em tempo real:

- **BoxCar2D** — [boxcar2d.com](http://boxcar2d.com/) — o simulador original que usa o motor de física Box2D. Gera 20 formas aleatórias com rodas e evolui ao longo de gerações.
- **HTML5 Genetic Cars** — [github.com/red42/HTML5_Genetic_Cars](https://github.com/red42/HTML5_Genetic_Cars) — reimplementação em HTML5 Canvas com JavaScript puro, sem dependências de build.
- **Genetic Cars (Matter.js)** — [geneticcars.willwade.dev](https://geneticcars.willwade.dev/) — versão moderna usando o motor de física Matter.js, com controlos avançados para métodos de crossover, seleção e salvamento de estado.

Nestes simuladores pode-se ajustar taxa de mutação, elitismo, tipo de terreno e observar como esses parâmetros influenciam a evolução.

---

## Casos de uso reais

### Antena da NASA (Space Technology 5)

Um dos exemplos mais notáveis de aplicação de algoritmos genéticos é o design da **antena de banda X** para a missão **Space Technology 5 (ST5)** da NASA, lançada em 2006.

- O AG gerou automaticamente um design de antena que **superou** a antena projetada manualmente por engenheiros.
- O design foi concluído em **3 meses** (contra 5 meses do processo convencional).
- Quando os requisitos da missão mudaram (parâmetros orbitais), uma nova antena foi evoluída em **poucas semanas**.
- Foi a **primeira peça de hardware evoluída por computador** enviada ao espaço.

A antena evoluída tinha uma forma orgânica e irregular que nenhum engenheiro humano teria projetado, mas que cumpria perfeitamente os requisitos de ganho e cobertura.

### Jogo do dinossauro do Chrome

Vários projetos usam AG + redes neurais para ensinar uma IA a jogar o jogo do T-Rex do Chrome:

- **IAMDinosaur** ([github.com/ivanseidel/IAMDinosaur](https://github.com/ivanseidel/IAMDinosaur)) — implementação em Node.js usando a biblioteca Synaptic. A rede neural recebe como entradas a distância ao próximo obstáculo, tamanho do obstáculo e velocidade atual, e decide se deve saltar, abaixar-se ou não fazer nada. A população de redes é evoluída com AG.
- **dino-neat** ([github.com/AkashKarnatak/dino-neat](https://github.com/AkashKarnatak/dino-neat)) — usa o algoritmo **NEAT** (NeuroEvolution of Augmenting Topologies) para evoluir a topologia e os pesos da rede neural simultaneamente.
- **TensorFlow.js** — abordagem que utiliza TensorFlow.js para construir e evoluir redes diretamente no browser.

Em todos os casos, a IA **aprende sozinha** a pular e esquivar-se dos obstáculos, sem nenhuma instrução específica sobre como jogar.

### Outras aplicações

- **Logística e rotas:** otimização de rotas de entrega (variantes do TSP).
- **Escalonamento:** alocação de tarefas a recursos (job-shop scheduling).
- **Design de circuitos:** otimização de layouts de circuitos integrados.
- **Bioinformática:** alinhamento de sequências de ADN/proteínas.
- **Jogos e simulações:** AIs que aprendem a estacionar carros, fazer balizas com drift, e outros comportamentos emergentes.

---

## Algoritmos genéticos vs. aprendizado por reforço

| Critério                    | Algoritmo Genético (AG)                          | Aprendizado por Reforço (RL)                     |
|-----------------------------|--------------------------------------------------|--------------------------------------------------|
| **Unidade de trabalho**     | População de soluções                            | Agente individual                                |
| **Como aprende**            | Evolução: seleção, crossover, mutação            | Tentativa e erro com recompensas                 |
| **Tipo de decisão**         | Avaliação global de cada solução                 | Decisões sequenciais passo a passo               |
| **Feedback**                | Fitness calculado ao final da avaliação          | Recompensa a cada ação                           |
| **Paralelismo**             | Naturalmente paralelo (toda a população)         | Geralmente um agente por vez                     |
| **Espaço de busca**         | Exploração ampla e diversa                       | Exploração focada via política                   |
| **Pontos fortes**           | Problemas combinatórios, sem gradiente           | Decisões sequenciais, ambientes dinâmicos        |
| **Pontos fracos**           | Lento para espaços muito grandes, sem memória    | Sensível à forma da recompensa (*reward shaping*)|
| **Exemplo clássico**        | Evoluir forma de um carro                        | Ensinar agente a jogar Atari                     |

> Não existe um vencedor universal — a escolha depende do problema. Pesquisas recentes (Salimans et al., 2017) mostram que, em tarefas de controlo contínuo, nenhuma abordagem domina consistentemente.

---

# Capítulo 2: Como funcionam LLMs — Transformers, Embeddings, Attention

## O que são LLMs?

> **LLM** (*Large Language Model*) é um modelo de linguagem de grande escala treinado com quantidades massivas de texto para aprender padrões da linguagem humana e gerar respostas coerentes.

O termo **GPT** (*Generative Pre-trained Transformer*) decompõe-se em:

- **Generative** — o modelo é gerador de texto.
- **Pre-trained** — é treinado previamente com enormes corpus de texto antes de ser afinado para tarefas específicas.
- **Transformer** — a arquitetura de rede neural que torna tudo possível (Vaswani et al., 2017).

### Escala dos modelos modernos

| Modelo          | Parâmetros       | Dados de treino         | Janela de contexto |
|-----------------|------------------|-------------------------|--------------------|
| GPT-2 (2019)    | 1.5 mil milhões  | ~40 GB de texto         | 1 024 tokens       |
| GPT-3 (2020)    | 175 mil milhões  | ~570 GB de texto        | 4 096 tokens       |
| GPT-4 (2023)    | ~1.8 triliões*   | Não divulgado           | 128 000 tokens     |
| LLaMA 3 (2024)  | 8–70 mil milhões | ~15 triliões de tokens  | 128 000 tokens     |
| Claude 3.5 (2024)| Não divulgado   | Não divulgado           | 200 000 tokens     |
| Gemini 2.0 (2025)| Não divulgado   | Não divulgado           | 2 000 000 tokens   |

*\* Valores estimados, não confirmados oficialmente.*

---

## 1. Tokenização

Antes de processar texto, o modelo precisa de o converter em números. Esse processo chama-se **tokenização**.

### Como funciona

O texto é quebrado em unidades menores chamadas **tokens**. Tokens **não** são necessariamente palavras — podem ser partes de palavras, espaços, pontuação ou caracteres especiais.

O método mais comum é o **Byte Pair Encoding (BPE)**:

1. Começa com cada caractere como token individual.
2. Identifica o par de tokens adjacentes mais frequente.
3. Funde esse par num novo token.
4. Repete até atingir o tamanho de vocabulário desejado.

### Exemplo

```
Texto original: "inteligência artificial"

Possível tokenização:
["int", "elig", "ência", " ", "art", "ificial"]
→ 6 tokens

Em inglês: "artificial intelligence"
["artificial", " intelligence"]
→ 2 tokens
```

> Uma palavra pode conter **vários tokens**. Quando um modelo limita um prompt a 4 000 tokens, isso **não** significa 4 000 palavras — geralmente são menos.

### Impacto prático

- Línguas com palavras longas ou aglutinativas (como alemão ou português) gastam mais tokens por palavra.
- Código e caracteres especiais podem gastar tokens inesperadamente.
- O vocabulário do GPT-2 contém cerca de **50 257 tokens**.
- Otimizar prompts para usar menos tokens reduz custos em APIs comerciais.

---

## 2. Embeddings

Uma vez tokenizado, cada token é transformado num **vetor de números** chamado **embedding**. Esses vetores representam o **significado** das palavras no contexto.

### Dimensões típicas

| Modelo   | Dimensão do embedding |
|----------|-----------------------|
| GPT-2    | 768                   |
| GPT-3    | 12 288                |
| LLaMA    | 4 096                 |

### Relações semânticas

Palavras que aparecem em contextos semelhantes acabam com embeddings próximos no espaço vetorial. Isto permite **aritmética vetorial**:

$$
\vec{Rei} - \vec{Homem} + \vec{Mulher} \approx \vec{Rainha}
$$

$$
\vec{Paris} - \vec{França} + \vec{Itália} \approx \vec{Roma}
$$

Estas relações emergem naturalmente do treino — o modelo nunca foi instruído explicitamente sobre geografia ou género.

### Word2Vec — como os embeddings são aprendidos

O **Word2Vec** (Mikolov et al., 2013) foi um dos primeiros métodos eficazes para aprender embeddings. Duas arquiteturas:

- **CBOW** (*Continuous Bag of Words*): prevê a palavra central a partir do contexto.
- **Skip-gram**: prevê as palavras de contexto a partir da palavra central.

Modelos modernos (como o GPT) aprendem embeddings como parte do treino end-to-end, mas o princípio é o mesmo: **palavras em contextos semelhantes recebem vetores semelhantes**.

### Similaridade por cosseno

Para medir a semelhança entre dois embeddings, usa-se a **similaridade por cosseno**:

$$
\text{sim}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{||\vec{A}|| \cdot ||\vec{B}||} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \cdot \sqrt{\sum_{i=1}^{n} B_i^2}}
$$

- Valor **1**: vetores idênticos em direção (máxima semelhança).
- Valor **0**: vetores ortogonais (sem relação).
- Valor **-1**: vetores opostos.

### Positional Encoding

Os embeddings, por si só, não carregam informação de **ordem**. Para o modelo distinguir "o cão mordeu o homem" de "o homem mordeu o cão", adicionam-se **positional encodings** — vetores que codificam a posição de cada token na sequência.

O Transformer original usa funções sinusoidais:

$$
PE_{(pos, 2i)} = \sin\left(\frac{pos}{10000^{2i/d}}\right)
$$

$$
PE_{(pos, 2i+1)} = \cos\left(\frac{pos}{10000^{2i/d}}\right)
$$

onde *pos* é a posição do token, *i* é a dimensão e *d* é a dimensão total do embedding.

---

## 3. A arquitetura Transformer

### Contexto histórico

Antes dos Transformers, modelos de linguagem usavam **RNNs** (*Recurrent Neural Networks*) e **LSTMs** (*Long Short-Term Memory*). Esses modelos processavam tokens **sequencialmente** (um a um), o que criava dois problemas:

1. **Lentidão:** não era possível paralelizar o treino.
2. **Dependências longas:** informação no início da sequência "desvanecia" ao longo do processamento (*vanishing gradient*).

Em 2017, Vaswani et al. publicaram o artigo **"Attention Is All You Need"**, introduzindo o **Transformer** — uma arquitetura que processa todos os tokens **em paralelo** e captura relações de longa distância com o mecanismo de **atenção**.

### Estrutura encoder-decoder

```
         ┌─────────────────────────┐
         │       ENCODER           │
         │  ┌───────────────────┐  │
Entrada →│  │ Multi-Head Attention│  │
         │  └───────┬───────────┘  │
         │  ┌───────▼───────────┐  │
         │  │ Feed-Forward NN   │  │
         │  └───────┬───────────┘  │
         │          │  × N camadas │
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
Saída  ← │  │ Feed-Forward NN   │  │
         │  └───────────────────┘  │
         │          × N camadas    │
         └─────────────────────────┘
```

No artigo original, *N* = 6 camadas em cada stack, com embeddings de dimensão 512.

> **Nota:** Modelos como o GPT usam apenas o **decoder** (sem encoder). BERT usa apenas o **encoder**. O T5 usa ambos.

### Self-Attention — a ideia central

O mecanismo de **Self-Attention** permite que cada token "preste atenção" a todos os outros tokens da sequência ao ser processado. Exemplo:

> "A Maria contou para a Ana que **ela** foi promovida."

O token "ela" pode referir-se à Maria ou à Ana. O mecanismo de attention calcula a relevância de cada token para desambiguar.

### Query, Key, Value (Q, K, V)

Para cada token, o modelo gera três vetores por transformação linear:

- **Query (Q):** "O que estou à procura?"
- **Key (K):** "O que tenho para oferecer?"
- **Value (V):** "Qual é o meu conteúdo?"

O cálculo da atenção:

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right) V
$$

onde \( d_k \) é a dimensão dos vetores key. A divisão por \( \sqrt{d_k} \) evita que os produtos escalares fiquem muito grandes, estabilizando o gradiente.

### Multi-Head Attention

Em vez de calcular uma única atenção, o Transformer divide os embeddings em **múltiplas cabeças** (*heads*) e calcula atenção em paralelo em cada uma:

- GPT-2: **12 cabeças** de 64 dimensões cada (12 × 64 = 768).
- GPT-3: **96 cabeças** de 128 dimensões cada.

Cada cabeça pode capturar um tipo diferente de relação (sintática, semântica, posicional). Os resultados são concatenados e projetados de volta à dimensão original.

### Porquê melhor que RNNs?

| Característica        | RNN / LSTM                       | Transformer                        |
|-----------------------|----------------------------------|------------------------------------|
| Processamento         | Sequencial (token a token)       | Paralelo (todos ao mesmo tempo)    |
| Dependências longas   | Difícil (vanishing gradient)     | Nativo (attention direta)          |
| Velocidade de treino  | Lenta                            | Muito mais rápida (paralelização)  |
| Escalabilidade        | Limitada                         | Escala com hardware (GPUs/TPUs)    |

---

## 4. Probabilidades e decoding

Após o Transformer processar os embeddings, a última camada produz um vetor de **logits** — pontuações brutas para cada token do vocabulário. Esses logits são convertidos em probabilidades via **softmax**:

$$
P(token_i) = \frac{e^{z_i}}{\sum_{j=1}^{V} e^{z_j}}
$$

onde \( z_i \) é o logit do token *i* e *V* é o tamanho do vocabulário.

### Exemplo

Para a frase "O céu é...", o modelo pode gerar:

| Token      | Probabilidade |
|------------|---------------|
| azul       | 55%           |
| nublado    | 18%           |
| claro      | 10%           |
| bonito     | 7%            |
| escuro     | 4%            |
| (outros)   | 6%            |

### Estratégias de decoding

**Greedy (Guloso):** sempre escolhe o token com maior probabilidade. Simples, mas tende a gerar texto repetitivo e pouco diverso.

**Beam Search:** mantém *b* sequências candidatas em paralelo e expande as mais prováveis. Melhor qualidade que greedy, mas ainda pode ser repetitivo.

**Sampling com Temperature:** a **temperature** (*T*) reescala os logits antes do softmax:

$$
P(token_i) = \frac{e^{z_i / T}}{\sum_{j=1}^{V} e^{z_j / T}}
$$

| Temperature | Efeito                                                    |
|-------------|-----------------------------------------------------------|
| T < 1.0     | Amplifica diferenças → mais determinístico, menos criativo|
| T = 1.0     | Softmax padrão, sem modificação                           |
| T > 1.0     | Comprime diferenças → mais aleatório, mais criativo       |
| T → 0       | Equivalente a greedy (sempre o mais provável)             |

**Top-K:** limita a escolha aos *K* tokens mais prováveis, descartando o resto. Exemplo com K=3 no cenário acima: escolhe apenas entre "azul", "nublado" e "claro".

**Top-P (Nucleus Sampling):** seleciona o menor conjunto de tokens cuja probabilidade acumulada atinge o limiar *p*. Proposto por Holtzman et al. (2019).

Processo:
1. Ordena tokens por probabilidade decrescente.
2. Soma probabilidades até ultrapassar *p* (ex.: 0.90).
3. Amostra desse subconjunto.

Vantagem: adapta-se à confiança do modelo — quando o modelo está seguro, o subconjunto é pequeno; quando está incerto, é maior.

> Na prática, estes parâmetros podem ser combinados. Uma API pode aceitar `temperature=0.7`, `top_p=0.9` e `top_k=50` simultaneamente.

---

## 5. Geração passo a passo (Sampling autoregressivo)

A IA **não** gera todo o texto de uma vez. Gera **token por token**, de forma **autoregressiva**:

```
Iteração 1: Entrada = "O céu é"      → Gera "azul"
Iteração 2: Entrada = "O céu é azul" → Gera "e"
Iteração 3: Entrada = "O céu é azul e" → Gera "limpo"
...
```

A cada iteração:

1. O modelo analisa todo o texto gerado até ao momento (contexto).
2. Calcula as probabilidades dos próximos tokens.
3. Escolhe um token (segundo a estratégia de decoding configurada).
4. Adiciona o token ao contexto.
5. Repete até gerar um token de fim (`<EOS>`) ou atingir o limite.

> Quanto maior o texto gerado, **maior o custo computacional**, pois o modelo precisa de reprocessar todo o contexto a cada novo token. Este é o principal gargalo dos LLMs.

---

## 6. Alucinações e limitações

### O que são alucinações?

> O modelo **não sabe** o que é verdade ou mentira. Gera o token mais **provável** dado o contexto — e tokens prováveis nem sempre são factuais.

Quando falta informação, o prompt é ambíguo ou o tema é pouco representado nos dados de treino, o modelo pode gerar afirmações **falsas mas convincentes**.

### Tipos de alucinação

| Tipo                     | Descrição                                                  | Exemplo                                              |
|--------------------------|------------------------------------------------------------|------------------------------------------------------|
| Fabricação factual       | Inventa factos que não existem                             | "O Python foi criado em 1985 por Linus Torvalds"    |
| Fabricação de citações   | Gera referências bibliográficas inexistentes               | Artigos inventados com DOIs falsos                   |
| Confusão de entidades    | Mistura atributos de entidades diferentes                  | Atribuir obras de Machado de Assis a José Saramago   |
| Confusão temporal        | Dados desatualizados ou misturados no tempo                | "O presidente atual do Brasil é..."                  |
| Fabricação numérica      | Gera estatísticas ou números inventados                    | "73.4% dos desenvolvedores usam..."                  |

### Taxas de alucinação por domínio

- Factos sobre entidades conhecidas: **3–5%**
- Domínios técnicos de nicho: **15–30%**
- Consultas médicas/legais (sem mitigação): **10–20%**

### Como mitigar alucinações

1. **RAG (Retrieval-Augmented Generation):** o modelo consulta uma base de dados externa antes de responder, fundamentando a resposta em documentos reais.
2. **Prompt engineering:** fornecer contexto completo, instruir o modelo a dizer "não sei" quando não tem certeza.
3. **Guardrails programáticos:** sistemas como NeMo Guardrails que validam a saída do modelo.
4. **Verificação de citações:** confirmar fontes geradas pelo modelo.
5. **Confidence scoring:** medir a incerteza do modelo e sinalizar respostas de baixa confiança.
6. **Multi-agent validation:** usar múltiplos modelos para verificar a mesma resposta.

---

## 7. Modelos modernos e tendências (2025–2026)

- **Janelas de contexto expandidas:** Gemini 2.0 Pro atinge 2 milhões de tokens, permitindo processar livros inteiros ou repositórios de código numa única chamada.
- **Reasoning models:** modelos que "pensam" antes de responder (chain-of-thought interno), melhorando a precisão em tarefas lógicas e matemáticas.
- **Modelos open-weight:** LLaMA, Mistral, Qwen e outros reduzem a diferença de desempenho em relação a modelos proprietários, democratizando o acesso.
- **Multimodalidade:** modelos que processam texto, imagem, áudio e vídeo na mesma arquitetura.
- **Agentes:** LLMs que podem usar ferramentas (busca web, execução de código, APIs) de forma autónoma.

---

## Leituras sugeridas

### Capítulo 1 — Algoritmos Genéticos

- Holland, John H. *Adaptation in Natural and Artificial Systems*. MIT Press, 1992. (Obra fundadora dos AGs)
- Mitchell, Melanie. *An Introduction to Genetic Algorithms*. MIT Press, 1998.
- Hornby, G. et al. "Automated Antenna Design with Evolutionary Algorithms." *NASA Technical Reports*, 2006. [ntrs.nasa.gov](https://ntrs.nasa.gov/citations/20060024675)
- BoxCar2D — [boxcar2d.com](http://boxcar2d.com/)
- HTML5 Genetic Cars — [github.com/red42/HTML5_Genetic_Cars](https://github.com/red42/HTML5_Genetic_Cars)
- IAMDinosaur — [github.com/ivanseidel/IAMDinosaur](https://github.com/ivanseidel/IAMDinosaur)

### Capítulo 2 — LLMs e Transformers

- Vaswani, A. et al. "Attention Is All You Need." *NeurIPS*, 2017. [arxiv.org/abs/1706.03762](https://arxiv.org/abs/1706.03762)
- Mikolov, T. et al. "Efficient Estimation of Word Representations in Vector Space." *ICLR*, 2013. (Word2Vec)
- Holtzman, A. et al. "The Curious Case of Neural Text Degeneration." *ICLR*, 2020. (Nucleus Sampling / Top-P)
- Jay Alammar. "The Illustrated Transformer." [jalammar.github.io](https://jalammar.github.io/illustrated-transformer/)
- Andrej Karpathy. "Let's build GPT from scratch." [YouTube](https://www.youtube.com/watch?v=kCc8FmEb1nY)
- LLM Visualization — [bbycroft.net/llm](https://bbycroft.net/llm)
- OpenAI Tokenizer — [platform.openai.com/tokenizer](https://platform.openai.com/tokenizer)
