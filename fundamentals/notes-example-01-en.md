# Module 01 -- E-commerce Recommendation System with TensorFlow.js

> Notes for the hands-on example: `exemplo-01-ecommerce-recomendations-template/`

---

## Part A -- Theory Recap

### What is Machine Learning?

**Machine Learning (ML)** is a subfield of Artificial Intelligence where, instead of writing rules by hand, we supply **data** and let the algorithm **learn patterns** so it can make predictions on new, unseen data.

The outcome of training is a **model** -- a parameterized function that takes inputs and produces outputs (predictions) without repeating the entire learning process.

### Supervised learning and recommendation

In **supervised learning** each example has an associated answer (label). The recommendation system in this project follows a similar logic: we use past purchase data (the "labels") to infer preferences and predict which products will be relevant.

In practice we use a **content-based** approach, where product features (category, color, price, buyer age profile) are encoded as vectors and compared with the user's profile.

### Tensors in a nutshell

A **tensor** is a multidimensional array of numbers. Key properties:

| Property  | Meaning                          | Example            |
|-----------|----------------------------------|--------------------|
| **rank**  | Number of dimensions             | `1` (1D vector)    |
| **shape** | Size along each dimension        | `[12]`             |
| **dtype** | Value type                       | `float32`          |

In TensorFlow.js, tensors are created with `tf.tensor1d(...)`, `tf.tensor2d(...)`, etc.

### TensorFlow.js -- three ways to work

1. **Pre-trained model** -- load and run inference only.
2. **Transfer learning** -- retrain final layers of an existing model.
3. **Build, train, and predict in JS** -- define everything in the JavaScript ecosystem.

This example uses **mode 3**: we build the feature vectors and compute similarity entirely in JS/TF.js.

### Memory management

Tensors may live on the GPU (via WebGL). Accumulating tensors without releasing them causes silent memory leaks.

- `tensor.dispose()` -- frees a single tensor.
- `tf.tidy(() => { ... })` -- runs a block and automatically disposes all intermediate tensors, returning only the final result.

```js
const y = tf.tidy(() => a.square().neg());
// intermediate tensors from .square() are automatically disposed
```

---

## Part B -- Practical Concepts

### 1. Content-based recommendation systems

There are two major families:

| Approach                   | Data used                              | When to use                        |
|----------------------------|----------------------------------------|------------------------------------|
| **Collaborative filtering** | Behavior of similar users             | Large user bases                   |
| **Content-based**          | Item attributes                        | Small catalogs with rich features  |

This project uses **content-based**: each product is described by attributes (category, color, price, buyer age profile) and turned into a numeric vector. The user profile is built from the vectors of products they purchased.

### 2. Feature encoding

To feed data into the model we must convert it to numbers. Three techniques used:

#### a) Min-max normalization

Transforms a continuous value to the [0, 1] range:

$$
\text{normalize}(x) = \frac{x - \min}{\max - \min}
$$

If `max === min`, we return `0.5` (degenerate case, all values equal).

Used for **price** and **average buyer age**.

```js
const normalize = (value, min, max) =>
    max === min ? 0.5 : (value - min) / (max - min);
```

#### b) One-hot encoding

Turns a categorical variable (e.g., `"eletrônicos"`) into a binary vector where only the corresponding position is 1:

```
Categories: ["eletrônicos", "vestuário", "calçados", "acessórios"]
"vestuário" → [0, 1, 0, 0]
```

In TF.js: `tf.oneHot(index, depth)` -- `index` is the position, `depth` is the total number of categories.

#### c) Weighted feature concatenation

Each feature block is multiplied by a weight before concatenation:

```js
const WEIGHTS = {
    category: 0.4,  // most influential attribute
    color: 0.3,
    price: 0.2,
    age: 0.1,       // least influential attribute
}
```

The final product vector is the concatenation:

```
[price_norm * 0.2, age_norm * 0.1, ...one_hot_category * 0.4, ...one_hot_color * 0.3]
```

**Changing the weights changes the recommendations**: increasing category weight makes products in the same category "closer"; increasing color weight makes color dominant.

#### d) Building index maps

For one-hot encoding we need `{value: numeric_index}` maps with only **unique** values:

```js
const uniqueColors = [...new Set(colors)];
const colorIndex = Object.fromEntries(uniqueColors.map((c, i) => [c, i]));
// { "preto": 0, "prata": 1, "azul": 2, "branco": 3, ... }
```

### 3. User profile construction

The profile is the **arithmetic mean** of the vectors of products the user purchased:

$$
\vec{u} = \frac{1}{n} \sum_{i=1}^{n} \vec{p_i}
$$

In TF.js:

```js
const userProfile = tf.tidy(() =>
    tf.stack(purchasedVectors).mean(0)  // stack and average along axis 0
);
```

### 4. Cosine similarity

Measures the **angle** between two vectors, regardless of magnitude:

$$
\cos(\theta) = \frac{\vec{a} \cdot \vec{b}}{||\vec{a}|| \times ||\vec{b}||}
$$

- **1.0** -- vectors point in the same direction (maximum similarity)
- **0.0** -- vectors are perpendicular (no relation)
- **-1.0** -- vectors point in opposite directions

For recommendation: we compute the similarity between the user profile and each product. Products with the highest score (closest to the profile) are recommended.

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

### 5. Data preparation and feature engineering

#### Average buyer age per product

To personalize recommendations by age bracket, we compute the normalized average age of users who purchased each product:

```js
users.forEach(user => {
    user.purchases.forEach(purchase => {
        ageSums[purchase.name] += user.age;
        ageCounts[purchase.name]++;
    });
});

// For each product: avg = sum / count, or midAge if nobody bought it
const avg = ageCounts[name] ? ageSums[name] / ageCounts[name] : midAge;
const normalized = normalize(avg, minAge, maxAge);
```

Products typically bought by younger users will have a low value; by older users, a high value. This makes the system tend to recommend products whose age profile is close to the user's age.

---

## Part C -- Code Walkthrough and Architecture

### 1. Project structure

```
exemplo-01-ecommerce-recomendations-template/
├── index.html            ← main page, loads Bootstrap + TF-Vis + JS module
├── style.css
├── data/
│   ├── products.json     ← catalog of 10 products
│   └── users.json        ← 5 users with purchase history
└── src/
    ├── index.js           ← entry point, instantiates services/views/controllers
    ├── controller/
    │   ├── UserController.js
    │   ├── ProductController.js
    │   ├── ModelTrainingController.js
    │   ├── TFVisorController.js
    │   └── WorkerController.js     ← bridge between Web Worker and event bus
    ├── service/
    │   ├── UserService.js           ← user CRUD via sessionStorage
    │   └── ProductService.js        ← product fetching
    ├── view/
    │   ├── View.js                  ← base class with loadTemplate/replaceTemplate
    │   ├── UserView.js
    │   ├── ProductView.js
    │   ├── ModelTrainingView.js
    │   ├── TFVisorView.js           ← training charts with tfjs-vis
    │   └── templates/
    │       ├── product-card.html
    │       └── past-purchase.html
    ├── events/
    │   ├── constants.js             ← event keys (DOM and Worker)
    │   └── events.js                ← event bus over CustomEvent/document
    └── workers/
        └── modelTrainingWorker.js   ← ML logic: encoding + training + recommendation
```

### 2. MVC with Event Bus pattern

The architecture follows **Model-View-Controller** with decoupled communication via **custom DOM events**:

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

- **Views** -- manipulate the DOM, register callbacks.
- **Controllers** -- orchestrate logic, dispatch events.
- **Services** -- data access (fetch, sessionStorage).
- **Events** -- static class wrapping `document.addEventListener` / `document.dispatchEvent` with `CustomEvent`.

Each event has an `on*`/`dispatch*` pair:

```js
// Listen
Events.onUserSelected((user) => { ... });

// Fire
Events.dispatchUserSelected(user);
```

### 3. Web Workers for ML

Training and recommendation run in a **Web Worker** -- a separate thread that **does not block the UI**. Communication uses `postMessage` / `onmessage`:

```
Main Thread                          Worker Thread
────────────                         ─────────────
worker.postMessage({                 self.onmessage = e => {
  action: 'train:model',              const { action, ...data } = e.data;
  users: [...]                        handlers[action](data);
})                                   }

                                     // response:
worker.onmessage = (event) => {      postMessage({
  // event.data.type                   type: 'progress:update',
}                                      progress: { progress: 100 }
                                     })
```

`WorkerController` acts as a bridge: it receives `postMessage` from the Worker and converts them into `CustomEvent` on the DOM (and vice versa). This keeps the rest of the application agnostic of the Worker's existence.

### 4. Training flow (trainModel)

```
1. index.js → WorkerController.triggerTrain(users)
2. Worker receives 'train:model'
3. Worker fetches /data/products.json
4. makeContext() builds:
   - index maps (color, category)
   - price and age normalization bounds
   - average buyer age per product
5. Each product is encoded into a tensor via encodeProduct()
6. Context saved to _globalCtx
7. Worker sends progressUpdate(100) + trainingComplete
8. WorkerController converts to DOM events
9. ModelTrainingView updates the button; recommend becomes enabled
```

### 5. Recommendation flow (recommend)

```
1. User clicks "Run Recommendation"
2. ModelController → Events.dispatchRecommend(user)
3. WorkerController → Worker.postMessage('recommend', user)
4. Worker:
   a) Filters vectors of already-purchased products
   b) Computes profile = mean of purchased vectors
   c) For each NOT-purchased product: computes cosineSimilarity(profile, product)
   d) Sorts by descending score
   e) postMessage({ type: 'recommend', recommendations: [...] })
5. WorkerController → Events.dispatchRecommendationsReady(data)
6. ProductView.render(recommendations) — shows products ranked by relevance
```

### 6. TF.js operations used in the project

| Operation | Description | Example |
|-----------|-------------|---------|
| `tf.tensor1d([...])` | Creates a 1D tensor from an array | `tf.tensor1d([0.15])` |
| `tf.oneHot(idx, depth)` | Creates a one-hot vector | `tf.oneHot(2, 4)` → `[0,0,1,0]` |
| `.cast('float32')` | Converts tensor dtype | Needed before `.mul()` with floats |
| `.mul(scalar)` | Scalar multiplication | Applies weight to a feature |
| `tf.concat([...])` | Concatenates tensors into one | Joins price + age + category + color |
| `tf.stack([...])` | Stacks tensors (adds a new dimension) | Creates a matrix of purchased vectors |
| `.mean(axis)` | Mean along an axis | `.mean(0)` → user profile vector |
| `.dot(other)` | Dot product | Used in cosine similarity |
| `.norm()` | Euclidean norm (L2) | Vector magnitude |
| `.div(other)` | Element-wise division | `dot / (normA * normB)` |
| `.dataSync()` | Extracts values to JS (synchronous) | Reads the tensor result |
| `tf.tidy(() => {...})` | Automatic memory management | Disposes intermediates |
| `.dispose()` | Manually frees a tensor | `userProfile.dispose()` |

### 7. encodeProduct -- step by step

```js
function encodeProduct(product, context) {
    // 1. Normalized price [0,1], multiplied by weight 0.2
    const price = tf.tensor1d([
        normalize(product.price, context.minPrice, context.maxPrice) * WEIGHTS.price
    ])

    // 2. Normalized average buyer age, multiplied by weight 0.1
    const age = tf.tensor1d([
        (context.productAvgAgeNorm[product.name] ?? 0.5) * WEIGHTS.age
    ])

    // 3. Category as one-hot, multiplied by weight 0.4
    const category = oneHotWeighted(
        context.categoryIndex[product.category],
        context.numCategories,
        WEIGHTS.category
    )

    // 4. Color as one-hot, multiplied by weight 0.3
    const color = oneHotWeighted(
        context.colorIndex[product.color],
        context.numColors,
        WEIGHTS.color
    )

    // 5. Concatenation: [price, age, ...category, ...color]
    return tf.concat([price, age, category, color])
}
```

For the current catalog (4 categories, 8 unique colors), the final vector has dimension `2 + 4 + 8 = 14`.

---

## Suggested readings

- Gerard, Charlie. *Practical Machine Learning in JavaScript: TensorFlow.js for Web Developers*. Apress, 2021.
- Cai, Shanqing; Bileschi, Stan; Nielsen, Eric; Chollet, François. *Deep Learning with JavaScript*. Manning.
- [TensorFlow.js Guide](https://www.tensorflow.org/js/guide)
- [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
