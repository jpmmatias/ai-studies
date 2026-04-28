#!/usr/bin/env node
/**
 * experiments/gen-api-playground/scripts/openrouter-chat.mjs
 * Chat completion via OpenRouter (OpenAI-compatible).
 */

const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error(
    'Missing OPENROUTER_API_KEY or OPENAI_API_KEY in environment.',
  );
  process.exit(1);
}

const model =
  process.env.MODEL ?? 'openai/gpt-4o-mini'; // sensible default on OpenRouter
const url =
  process.env.OPENROUTER_BASE_URL ??
  'https://openrouter.ai/api/v1/chat/completions';

const body = {
  model,
  messages: [
    {
      role: 'system',
      content: 'You reply briefly and clearly.',
    },
    {
      role: 'user',
      content:
        'In one paragraph, explain what a Bearer token does in HTTPS APIs.',
    },
  ],
  temperature: 0.4,
};

const response = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    // Optional on OpenRouter — see https://openrouter.ai/docs
    'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER ?? 'http://localhost',
    'X-Title': process.env.OPENROUTER_TITLE ?? 'gen-api-playground',
  },
  body: JSON.stringify(body),
});

const text = await response.text();
if (!response.ok) {
  console.error(response.status, text);
  process.exit(1);
}

const data = JSON.parse(text);
const content = data.choices?.[0]?.message?.content;
console.log(content ?? JSON.stringify(data, null, 2));
