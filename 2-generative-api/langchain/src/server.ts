import fast from "fastify"
import { buildGraph } from "../graph/graph";
import { HumanMessage } from "langchain";

type ChatService = {
    sendMessage: (message: string) => Promise<unknown>
}

const graph = buildGraph()


export const createServer = () => {
    const app = fast()

    app.post("/chat",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["question"],
                    properties: {
                        question: {
                            type: "string",
                            minLength: 5

                        }
                    }
                }
            }
        },
        async (request, reply) => {
            try {
                const { question } = request.body as { question: string }
                const response = await graph.invoke({
                    messages: [new HumanMessage(question)]
                })

                return reply.code(200).send(response.output)

            } catch (err) {
                console.error("Error handling /chat requests", err)
                return reply.code(500).send({
                    error: "Internal server error"
                })

            }
        }
    )

    return app
}