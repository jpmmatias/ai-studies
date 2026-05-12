import { createServer } from "./server.ts";
import { OpenRouterService } from "../services/openRouter.ts";
import { config } from "../config.ts";

const models = ["recraft/recraft-v4-pro"]
const openRouterService = new OpenRouterService(config)

const app = createServer(openRouterService)

await app.listen({
    port:3000,
    host:"0.0.0"
})

app.inject({
    method:"POST",
    url:"chat",
    body:{question:"Hello! How are you? return a message"}
}).then(res=>{
    console.log(res.statusCode)
    console.log(res.body)
})

