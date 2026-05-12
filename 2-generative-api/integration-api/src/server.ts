import fast from "fastify"


export const createServer = ()=>{
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
            return reply.send("hello!")
            } catch (err) {
                console.error("Error handling /chat requests", err)
                return reply.code(500)
                
            }
        }
    )

    return app
}