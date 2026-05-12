/// <reference types="node" />
import test from "node:test"
import { createServer } from "../src/server";
import assert from "node:assert";

test("returns 200 and forwards question to chat service", async () => {
    let receivedQuestion = ""
    const expectedPayload = {
        model: "test-model",
        content: "Rate limiting controls how many requests are allowed in a timeframe."
    }

    const fakeService = {
        sendMessage: async (question: string) => {
            receivedQuestion = question
            return expectedPayload
        }
    }
    const app = createServer(fakeService)

    const response = await app.inject({
        method: 'POST',
        url: '/chat',
        body: { question: 'What is rate limiting?' }
    })

    assert.equal(response.statusCode, 200)
    const body = response.json()

    assert.equal(receivedQuestion, "What is rate limiting?")
    assert.deepEqual(body, expectedPayload)
})

test("returns 400 for invalid question payload", async () => {
    const fakeService = {
        sendMessage: async () => ({ model: "unused", content: "unused" })
    }
    const app = createServer(fakeService)

    const response = await app.inject({
        method: "POST",
        url: "/chat",
        body: { question: "hey" }
    })

    assert.equal(response.statusCode, 400)
})

test("returns 500 when chat service fails", async () => {
    const fakeService = {
        sendMessage: async () => {
            throw new Error("service unavailable")
        }
    }
    const app = createServer(fakeService)

    const response = await app.inject({
        method: "POST",
        url: "/chat",
        body: { question: "What is rate limiting?" }
    })

    assert.equal(response.statusCode, 500)
})