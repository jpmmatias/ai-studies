import { createServer } from "./server.ts";

const app = createServer()

await app.listen({
    port:3000,
    host:"0.0.0"
})

app.inject({
    method:"POST",
    url:"chat",
    body:{question:"Hello World"}
}).then(res=>{
    console.log(res.statusCode)
    console.log(res.body)
})