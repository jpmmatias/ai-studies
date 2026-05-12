import 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';
import { workerEvents } from '../events/constants.js';

console.log('Model training worker initialized');
let _globalCtx = {};

const WEIGHTS = {
    category: 0.4,
    color: 0.3,
    price: 0.2,
    age: 0.1,
}

const normalize = (value, min, max) =>
    max === min ? 0.5 : (value - min) / (max - min);

function makeContext(catalogData, users) {
    const ages = users.map(user => user.age);
    const prices = catalogData.map(product => product.price);

    const minAge = Math.min(...ages);
    const maxAge = Math.max(...ages);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const colors = catalogData.map(product => product.color);
    const categories = catalogData.map(product => product.category);

    const uniqueColors = [...new Set(colors)];
    const uniqueCategories = [...new Set(categories)];
    const colorIndex = Object.fromEntries(uniqueColors.map((c, i) => [c, i]));
    const categoryIndex = Object.fromEntries(uniqueCategories.map((c, i) => [c, i]));

    // Compute average buyer age per product (helps personalize recommendations)
    const midAge = (minAge + maxAge) / 2;
    const ageSums = {}
    const ageCounts = {}

    users.forEach(user => {
        user.purchases.forEach(purchase => {
            if (!ageSums[purchase.name]) {
                ageSums[purchase.name] = 0;
                ageCounts[purchase.name] = 0;
            }

            ageSums[purchase.name] += user.age;
            ageCounts[purchase.name]++;
        });
    });

    const productAvgAgeNorm = Object.fromEntries(
        catalogData.map(product => {
            const avg = ageCounts[product.name] ? ageSums[product.name] / ageCounts[product.name] : midAge;
            return [product.name, normalize(avg, minAge, maxAge)];
        })
    )

    return {
        catalog: catalogData,
        users: users,
        colorIndex: colorIndex,
        categoryIndex: categoryIndex,
        productAvgAgeNorm: productAvgAgeNorm,
        minAge: minAge,
        maxAge: maxAge,
        minPrice: minPrice,
        maxPrice: maxPrice,
        numCategories: uniqueCategories.length,
        numColors: uniqueColors.length,
        dimensions: 2 + uniqueCategories.length + uniqueColors.length,
    }
}

const oneHotWeighted = (index, length, weight) => {
    return tf.oneHot(index, length).cast('float32').mul(weight)
}

function encodeProduct(product, context) {
    const price = tf.tensor1d([
        normalize(product.price, context.minPrice, context.maxPrice) * WEIGHTS.price
    ])

    const age = tf.tensor1d([
        (context.productAvgAgeNorm[product.name] ?? 0.5) * WEIGHTS.age
    ])

    const category = oneHotWeighted(context.categoryIndex[product.category], context.numCategories, WEIGHTS.category)
    const color = oneHotWeighted(context.colorIndex[product.color], context.numColors, WEIGHTS.color)

    return tf.concat([price, age, category, color])
}

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

async function trainModel({ users }) {
    console.log('Training model with users:', users)

    postMessage({ type: workerEvents.progressUpdate, progress: { progress: 50 } });
    const response = await fetch('/data/products.json');
    const catalogData = await response.json();
    console.log('Catalog data:', catalogData);

    const context = makeContext(catalogData, users);
    context.productVectors = catalogData.map(product => {
        return {
            name: product.name,
            meta: { ...product },
            vector: encodeProduct(product, context)
        }
    });

    _globalCtx = context;

    postMessage({
        type: workerEvents.trainingLog,
        epoch: 1,
        loss: 0,
        accuracy: 1
    });

    postMessage({
        type: workerEvents.tfVisData,
        data: {
            weights: WEIGHTS,
            catalog: catalogData,
            users: users,
        }
    });

    setTimeout(() => {
        postMessage({ type: workerEvents.progressUpdate, progress: { progress: 100 } });
        postMessage({ type: workerEvents.trainingComplete });
    }, 1000);
}

function recommend(user, ctx) {
    console.log('will recommend for user:', user)

    if (!ctx.productVectors || !user.purchases) {
        postMessage({ type: workerEvents.recommend, user, recommendations: [] });
        return;
    }

    const purchasedNames = new Set(user.purchases.map(p => p.name));

    const purchasedVectors = ctx.productVectors
        .filter(pv => purchasedNames.has(pv.name))
        .map(pv => pv.vector);

    if (purchasedVectors.length === 0) {
        postMessage({ type: workerEvents.recommend, user, recommendations: [] });
        return;
    }

    const userProfile = tf.tidy(() =>
        tf.stack(purchasedVectors).mean(0)
    );

    const scored = ctx.productVectors
        .filter(pv => !purchasedNames.has(pv.name))
        .map(pv => ({
            ...pv.meta,
            score: cosineSimilarity(userProfile, pv.vector)
        }))
        .sort((a, b) => b.score - a.score);

    userProfile.dispose();

    postMessage({
        type: workerEvents.recommend,
        user,
        recommendations: scored
    });
}

const handlers = {
    [workerEvents.trainModel]: trainModel,
    [workerEvents.recommend]: d => recommend(d.user, _globalCtx),
};

self.onmessage = e => {
    const { action, ...data } = e.data;
    if (handlers[action]) handlers[action](data);
};
