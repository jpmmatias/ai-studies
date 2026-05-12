import fast from "fastify"
type ChatService = {
    sendMessage: (message: string) => Promise<unknown>
}


export const createServer = (openRouterService: ChatService)=>{
    const app = fast()

    app.post("/chat",
        {
            schema:{
                body:{
                    type: "object",
                    required: ["question"],
                    properties: {
                        question:{
                        type: "string",
                        minLength: 5

                        }
                    }
                }
            }
        },
        async(request, reply)=>{
            try {
                
            const {question} = request.body as {question:string}
            const res = await openRouterService.sendMessage(question)
            return reply.send(res)
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