import { OpenRouter } from '@openrouter/sdk';
import type { ModelConfig } from '../config.ts';


export class OpenRouterService {
    private readonly sdk: OpenRouter
    private config: ModelConfig
    constructor(configOverride: ModelConfig) {
        this.config = configOverride
        this.sdk = new OpenRouter({
            apiKey: configOverride.apiKey,
            httpReferer: configOverride.httpReferer,
            appTitle: configOverride.xTitle,
        });
    }

    private extractMessageText(message: { content?: unknown; reasoning?: string | null } | undefined) {
        if (!message) return ""

        if (typeof message.content === "string" && message.content.trim().length > 0) return message.content

        if (Array.isArray(message.content)) {
            const chunks = message.content
                .map((chunk) => {
                    if (typeof chunk === "string") return chunk
                    if (chunk && typeof chunk === "object" && "text" in chunk && typeof (chunk as { text?: unknown }).text === "string") {
                        return (chunk as { text: string }).text
                    }
                    return ""
                })
                .filter(Boolean)
                .join("\n")
                .trim()

            if (chunks.length > 0) return chunks
        }

        if (typeof message.reasoning === "string" && message.reasoning.trim().length > 0) return message.reasoning

        return ""
    }

    async sendMessage(msg: string) {
        const res = await this.sdk.chat.send({
            chatRequest: {
                models: this.config.models,
                messages: [
                    {
                        role: "system",
                        content: this.config.systemPrompt
                    },
                    {
                        role: "user",
                        content: msg
                    }
                ],
                stream: false,
                temperature: this.config.temperature,
                maxTokens: this.config.maxTokens,
                reasoning: {
                    effort: "minimal"
                },
                provider: this.config.provider

            }
        })

        const message = res.choices.at(0)?.message
        const content = this.extractMessageText(message)

        return {
            model: res.model,
            content,

        }


    }


}


