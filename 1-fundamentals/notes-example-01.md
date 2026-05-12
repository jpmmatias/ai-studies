# Módulo 01 -- Sistema de Recomendação E-commerce com TensorFlow.js

> Notas do exemplo prático: `exemplo-01-ecommerce-recomendations-template/`

---

## Parte A -- Recapitulação Teórica

### O que é Machine Learning?

**Machine Learning (ML)** é uma subárea da Inteligência Artificial onde, em vez de escrever regras manualmente, fornecemos **dados** e deixamos o algoritmo **aprender padrões** para fazer previsões em dados novos.

O resultado desse treino é um **modelo** — uma função parametrizada que recebe entradas e produz saídas (previsões) sem repetir todo o processo de aprendizado.

### Aprendizado supervisionado e recomendação

No **aprendizado supervisionado** cada exemplo tem uma resposta associada (rótulo). O sistema de recomendação deste projeto segue uma lógica parecida: usamos os dados de compras passadas dos utilizadores (os "rótulos") para inferir preferências e prever quais produtos serão relevantes.

Na prática, usamos uma abordagem **content-based** (baseada em conteúdo), onde as características dos produtos (categoria, cor, preço, perfil etário) são codificadas como vetores e comparadas com o perfil do utilizador.

### Tensores em resumo

Um **tensor** é um array multidimensional de números. Propriedades fundamentais:

| Propriedade | Significado                          | Exemplo             |
|-------------|--------------------------------------|---------------------|
| **rank**    | Número de dimensões                  | `1` (vetor 1D)      |
| **shape**   | Tamanho ao longo de cada dimensão    | `[12]`              |
| **dtype**   | Tipo dos valores                     | `float32`           |

No TensorFlow.js, tensores são criados com `tf.tensor1d(...)`, `tf.tensor2d(...)`, etc.

### TensorFlow.js -- três modos de trabalho

1. **Modelo pré-treinado** — carregar e fazer apenas inferência.
2. **Transfer learning** — re-treinar camadas finais de um modelo existente.
3. **Construir, treinar e prever em JS** — definir tudo no ecossistema JavaScript.

Este exemplo usa o **modo 3**: construímos os vetores de features e calculamos similaridade inteiramente em JS/TF.js.

### Gestão de memória

Tensores podem residir na GPU (via WebGL). Acumular tensores sem libertar provoca fugas de memória silenciosas.

- `tensor.dispose()` — liberta um tensor individual.
- `tf.tidy(() => { ... })` — executa um bloco e descarta automaticamente todos os tensores intermediários, retornando apenas o resultado final.

```js
const y = tf.tidy(() => a.square().neg());
// tensores intermediários de .square() são descartados automaticamente
```

---

## Parte B -- Conceitos Práticos

### 1. Sistemas de recomendação baseados em conteúdo

Existem duas famílias principais:

| Abordagem                  | Dados usados                            | Quando usar                         |
|----------------------------|-----------------------------------------|-------------------------------------|
| **Collaborative filtering** | Comportamento de utilizadores similares | Grande volume de utilizadores       |
| **Content-based**          | Atributos dos itens                     | Catálogos pequenos com features ricas |

Neste projeto usamos **content-based**: cada produto é descrito por atributos (categoria, cor, preço, perfil etário) e transformado num vetor numérico. O perfil do utilizador é construído a partir dos vetores dos produtos que comprou.

### 2. Codificação de features (Feature Encoding)

Para que o modelo trabalhe com dados, é preciso convertê-los em números. As três técnicas usadas:

#### a) Normalização min-max

Transforma um valor contínuo para o intervalo [0, 1]:

$$
\text{normalize}(x) = \frac{x - \min}{\max - \min}
$$

Se `max === min`, devolvemos `0.5` (caso degenerado, todos os valores iguais).

Usada para **preço** e **idade média dos compradores**.

```js
const normalize = (value, min, max) =>
    max === min ? 0.5 : (value - min) / (max - min);
```

#### b) One-hot encoding

Transforma uma variável categórica (ex: `"eletrônicos"`) num vetor binário onde apenas a posição correspondente é 1:

```
Categorias: ["eletrônicos", "vestuário", "calçados", "acessórios"]
"vestuário" → [0, 1, 0, 0]
```

Em TF.js: `tf.oneHot(index, depth)` — `index` é a posição, `depth` é o número total de categorias.

#### c) Concatenação com pesos (Weighted Feature Concatenation)

Cada bloco de features é multiplicado por um peso antes de concatenar:

```js
const WEIGHTS = {
    category: 0.4,  // atributo mais influente
    color: 0.3,
    price: 0.2,
    age: 0.1,       // atributo menos influente
}
```

O vetor final de um produto resulta da concatenação:

```
[preço_norm * 0.2, idade_norm * 0.1, ...one_hot_categoria * 0.4, ...one_hot_cor * 0.3]
```

**Alterar os pesos muda as recomendações**: se aumentarmos o peso da categoria, produtos da mesma categoria ficam mais "próximos"; se aumentarmos o peso da cor, a cor passa a dominar.

#### d) Construção de mapas de índice

Para o one-hot encoding, precisamos de mapas `{valor: índice_numérico}` apenas com valores **únicos**:

```js
const uniqueColors = [...new Set(colors)];
const colorIndex = Object.fromEntries(uniqueColors.map((c, i) => [c, i]));
// { "preto": 0, "prata": 1, "azul": 2, "branco": 3, ... }
```

### 3. Perfil do utilizador (User Profile)

O perfil é a **média aritmética** dos vetores dos produtos que o utilizador comprou:

$$
\vec{u} = \frac{1}{n} \sum_{i=1}^{n} \vec{p_i}
$$

Em TF.js:

```js
const userProfile = tf.tidy(() =>
    tf.stack(purchasedVectors).mean(0)  // empilha e calcula média ao longo do eixo 0
);
```

### 4. Similaridade do cosseno (Cosine Similarity)

Mede o **ângulo** entre dois vetores, independentemente da magnitude:

$$
\text{cos}(\theta) = \frac{\vec{a} \cdot \vec{b}}{||\vec{a}|| \times ||\vec{b}||}
$$

- **1.0** → vetores na mesma direção (máxima similaridade)
- **0.0** → vetores perpendiculares (sem relação)
- **-1.0** → vetores opostos

Para recomendação: calculamos a similaridade entre o perfil do utilizador e cada produto. Os produtos com maior score (mais próximos do perfil) são os recomendados.

```js
function cosineSimilarity(a, b) {
    return tf.tidy(() => {
        const dot = a.dot(b);
        const normA = a.norm();
        const normB = b.norm();
        const denom = normA.mul(normB);
        const denomVal = denom.dataSync()[0];
        if (denomVal === 0) return 0;
        return dot.div(denom).dataSync()[0];
    });
}
```

### 5. Preparação de dados e feature engineering

#### Média de idade dos compradores por produto

Para personalizar a recomendação por faixa etária, calculamos a idade média normalizada dos utilizadores que compraram cada produto:

```js
users.forEach(user => {
    user.purchases.forEach(purchase => {
        ageSums[purchase.name] += user.age;
        ageCounts[purchase.name]++;
    });
});

// Para cada produto: avg = soma / contagem, ou midAge se ninguém comprou
const avg = ageCounts[name] ? ageSums[name] / ageCounts[name] : midAge;
const normalized = normalize(avg, minAge, maxAge);
```

Produtos comprados tipicamente por utilizadores mais jovens terão um valor baixo; por mais velhos, um valor alto. Isto faz com que o sistema tenda a recomendar produtos cujo perfil etário se aproxima do utilizador.

---

## Parte C -- Walkthrough do Código e Arquitetura

### 1. Estrutura do projeto

```
exemplo-01-ecommerce-recomendations-template/
├── index.html            ← página principal, carrega Bootstrap + TF-Vis + módulo JS
├── style.css
├── data/
│   ├── products.json     ← catálogo de 10 produtos
│   └── users.json        ← 5 utilizadores com histórico de compras
└── src/
    ├── index.js           ← ponto de entrada, instancia serviços/views/controllers
    ├── controller/
    │   ├── UserController.js
    │   ├── ProductController.js
    │   ├── ModelTrainingController.js
    │   ├── TFVisorController.js
    │   └── WorkerController.js     ← ponte entre Web Worker e event bus
    ├── service/
    │   ├── UserService.js           ← CRUD de utilizadores via sessionStorage
    │   └── ProductService.js        ← fetch de produtos
    ├── view/
    │   ├── View.js                  ← classe base com loadTemplate/replaceTemplate
    │   ├── UserView.js
    │   ├── ProductView.js
    │   ├── ModelTrainingView.js
    │   ├── TFVisorView.js           ← gráficos de treino com tfjs-vis
    │   └── templates/
    │       ├── product-card.html
    │       └── past-purchase.html
    ├── events/
    │   ├── constants.js             ← chaves de eventos (DOM e Worker)
    │   └── events.js                ← event bus sobre CustomEvent/document
    └── workers/
        └── modelTrainingWorker.js   ← lógica ML: encoding + treino + recomendação
```

### 2. Padrão MVC com Event Bus

A arquitetura segue o padrão **Model-View-Controller** com comunicação desacoplada via **eventos customizados do DOM**:

```
┌──────────┐     CustomEvent      ┌──────────────┐     CustomEvent     ┌──────────┐
│  Views   │ ◄──────────────────► │ Controllers  │ ◄────────────────► │ Services │
└──────────┘                      └──────────────┘                     └──────────┘
                                        │
                                        │ postMessage / onmessage
                                        ▼
                                  ┌──────────────┐
                                  │  Web Worker  │
                                  │  (TF.js ML)  │
                                  └──────────────┘
```

- **Views** — manipulam o DOM, registam callbacks.
- **Controllers** — orquestram a lógica, despacham eventos.
- **Services** — acesso a dados (fetch, sessionStorage).
- **Events** — classe estática que encapsula `document.addEventListener` / `document.dispatchEvent` com `CustomEvent`.

Cada evento tem um par `on*`/`dispatch*`:

```js
// Escutar
Events.onUserSelected((user) => { ... });

// Disparar
Events.dispatchUserSelected(user);
```

### 3. Web Workers para ML

O treino e a recomendação correm num **Web Worker** — uma thread separada que **não bloqueia a UI**. A comunicação é feita via `postMessage` / `onmessage`:

```
Main Thread                          Worker Thread
────────────                         ─────────────
worker.postMessage({                 self.onmessage = e => {
  action: 'train:model',              const { action, ...data } = e.data;
  users: [...]                        handlers[action](data);
})                                   }

                                     // resposta:
worker.onmessage = (event) => {      postMessage({
  // event.data.type                   type: 'progress:update',
}                                      progress: { progress: 100 }
                                     })
```

O `WorkerController` serve de ponte: recebe `postMessage` do Worker e converte-os em `CustomEvent` no DOM (e vice-versa). Isto mantém o resto da aplicação agnóstico à existência do Worker.

### 4. Fluxo de treino (trainModel)

```
1. index.js → WorkerController.triggerTrain(users)
2. Worker recebe 'train:model'
3. Worker faz fetch('/data/products.json')
4. makeContext() constrói:
   - mapas de índice (cor, categoria)
   - normalização de preços e idades
   - média de idade dos compradores por produto
5. Cada produto é codificado em tensor via encodeProduct()
6. Contexto salvo em _globalCtx
7. Worker envia progressUpdate(100) + trainingComplete
8. WorkerController converte em eventos DOM
9. ModelTrainingView actualiza o botão; recommend fica habilitado
```

### 5. Fluxo de recomendação (recommend)

```
1. Utilizador clica "Run Recommendation"
2. ModelController → Events.dispatchRecommend(user)
3. WorkerController → Worker.postMessage('recommend', user)
4. Worker:
   a) Filtra vetores dos produtos já comprados
   b) Calcula perfil = média dos vetores comprados
   c) Para cada produto NÃO comprado: calcula cosineSimilarity(perfil, produto)
   d) Ordena por score descendente
   e) postMessage({ type: 'recommend', recommendations: [...] })
5. WorkerController → Events.dispatchRecommendationsReady(data)
6. ProductView.render(recommendations) — mostra produtos ordenados por relevância
```

### 6. Operações TF.js usadas no projeto

| Operação | Descrição | Exemplo |
|----------|-----------|---------|
| `tf.tensor1d([...])` | Cria tensor 1D a partir de array | `tf.tensor1d([0.15])` |
| `tf.oneHot(idx, depth)` | Cria vetor one-hot | `tf.oneHot(2, 4)` → `[0,0,1,0]` |
| `.cast('float32')` | Converte tipo do tensor | Necessário antes de `.mul()` com floats |
| `.mul(scalar)` | Multiplicação por escalar | Aplica peso à feature |
| `tf.concat([...])` | Concatena tensores num só | Junta price + age + category + color |
| `tf.stack([...])` | Empilha tensores (cria nova dimensão) | Cria matriz de vetores comprados |
| `.mean(axis)` | Média ao longo de um eixo | `.mean(0)` → vetor perfil do utilizador |
| `.dot(other)` | Produto escalar | Usado na similaridade do cosseno |
| `.norm()` | Norma euclidiana (L2) | Magnitude do vetor |
| `.div(other)` | Divisão element-wise | `dot / (normA * normB)` |
| `.dataSync()` | Extrai valores para JS (síncrono) | Lê o resultado do tensor |
| `tf.tidy(() => {...})` | Gestão automática de memória | Descarta intermediários |
| `.dispose()` | Liberta tensor manualmente | `userProfile.dispose()` |

### 7. Função encodeProduct -- passo a passo

```js
function encodeProduct(product, context) {
    // 1. Preço normalizado [0,1], multiplicado pelo peso 0.2
    const price = tf.tensor1d([
        normalize(product.price, context.minPrice, context.maxPrice) * WEIGHTS.price
    ])

    // 2. Idade média dos compradores normalizada, multiplicada pelo peso 0.1
    const age = tf.tensor1d([
        (context.productAvgAgeNorm[product.name] ?? 0.5) * WEIGHTS.age
    ])

    // 3. Categoria em one-hot, multiplicada pelo peso 0.4
    const category = oneHotWeighted(
        context.categoryIndex[product.category],
        context.numCategories,
        WEIGHTS.category
    )

    // 4. Cor em one-hot, multiplicada pelo peso 0.3
    const color = oneHotWeighted(
        context.colorIndex[product.color],
        context.numColors,
        WEIGHTS.color
    )

    // 5. Concatenação: [preço, idade, ...categoria, ...cor]
    return tf.concat([price, age, category, color])
}
```

Para o catálogo actual (4 categorias, 8 cores únicas), o vetor final tem dimensão `2 + 4 + 8 = 14`.

---

## Leituras sugeridas

- Gerard, Charlie. *Practical Machine Learning in JavaScript: TensorFlow.js for Web Developers*. Apress, 2021.
- Cai, Shanqing; Bileschi, Stan; Nielsen, Eric; Chollet, François. *Deep Learning with JavaScript*. Manning.
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
