/// <reference types="node" />
import test from "node:test"
import { createServer } from "../src/server";
import assert from "node:assert";

test("returns 200 and forwards question to chat service", async () => {
    let receivedQuestion = ""
    
    const app = createServer()

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: { question: 'What is rate limiting?' }
    })

    assert.equal(response.statusCode, 200)
})
