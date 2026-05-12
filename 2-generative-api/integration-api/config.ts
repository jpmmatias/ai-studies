/// <reference types="node" />

export type ModelConfig = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;
  port: number;
  models: string[];
  temperature: number;
  maxTokens: number;
  systemPrompt: string;

  provider: {
    sort: {
      by: string;
      partition: string;
    }
  }
}


export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY as string,
  httpReferer: 'http://pos-ia.com',
  xTitle: 'SmartModelRouterGateway',
  port: 3000,
  models: [
    "baidu/cobuddy:free",
    "inclusionai/ring-2.6-1t:free"
  ],
  temperature: 0.2,
  maxTokens: 300,
  systemPrompt: 'You are a helpful assistant.',
  provider: {
    sort: {
      by: 'latency',
      partition: 'none'
    }
  }
}