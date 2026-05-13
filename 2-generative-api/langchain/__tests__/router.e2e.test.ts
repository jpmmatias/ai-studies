/// <reference types="node" />
import assert from "node:assert";
import { describe, test } from "node:test";
import { createServer } from "../src/server";

describe("POST /chat", () => {
    test("returns 200 and echoes question when no upper/lower intent", async () => {
        const app = createServer();
        const question = "What is rate limiting?";

        const response = await app.inject({
            method: "POST",
            url: "/chat",
            body: { question },
        });

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.headers["content-type"], "text/plain; charset=utf-8");
        assert.strictEqual(response.body, question);
    });

    test("returns 200 and lowercases output when question contains lower", async () => {
        const app = createServer();
        const question = "hello lower WORLD";

        const response = await app.inject({
            method: "POST",
            url: "/chat",
            body: { question },
        });

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body, question.toLocaleLowerCase());
    });

    test("returns 200 and uppercases output when question contains upper", async () => {
        const app = createServer();
        const question = "hello upper world";

        const response = await app.inject({
            method: "POST",
            url: "/chat",
            body: { question },
        });

        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.body, question.toUpperCase());
    });

    test("returns 400 when question is shorter than minLength", async () => {
        const app = createServer();

        const response = await app.inject({
            method: "POST",
            url: "/chat",
            body: { question: "hi" },
        });

        assert.strictEqual(response.statusCode, 400);
        const payload = JSON.parse(response.body) as { message?: string };
        assert.match(payload.message ?? "", /fewer than 5 characters/);
    });

    test("returns 400 when question is missing", async () => {
        const app = createServer();

        const response = await app.inject({
            method: "POST",
            url: "/chat",
            body: {},
        });

        assert.strictEqual(response.statusCode, 400);
        const payload = JSON.parse(response.body) as { message?: string };
        assert.match(payload.message ?? "", /required property 'question'/);
    });
});
