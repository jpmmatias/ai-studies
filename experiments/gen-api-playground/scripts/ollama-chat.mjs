#!/usr/bin/env node
/**
 * experiments/gen-api-playground/scripts/ollama-chat.mjs
 * Minimal OpenAI-compat chat completion against local Ollama.
 */

const base =
  process.env.OLLAMA_HOST?.replace(/\/$/, '') ?? 'http://127.0.0.1:11434';
const model = process.env.OLLAMA_MODEL ?? 'llama3.2';

const url = `${base}/v1/chat/completions`;

const body = {
  model,
  messages: [
    {
      role: 'system',
      content:
        'You are a concise assistant. Reply in at most three short sentences.',
    },
    {
      role: 'user',
      content: 'What is tokenisation in LLMs?',
    },
  ],
  temperature: 0.3,
  stream: false,
};

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
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
