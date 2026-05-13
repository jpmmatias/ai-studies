import { END, MessagesZodMeta, START, StateGraph, StateSchema } from "@langchain/langgraph"
import { withLangGraph } from "@langchain/langgraph/zod";
import { BaseMessage } from "langchain";
import { z } from "zod/v3"
import { identifyIntent } from "./nodes/identifyIntentNode.ts";
import { chatResponseNode } from "./nodes/chatResopnseNode.ts";
import { lowercaseCaseNode } from "./nodes/toLowerCaseNode.ts";
import { upperCaseNode } from "./nodes/uppercaseNode.ts";

const GraphState = z.object({
    messages: withLangGraph(
        z.custom<BaseMessage[]>(),
        MessagesZodMeta
    ),
    output: z.string(),
    command: z.enum(["uppercase", "lowercase", "unknown"])
})

export type GraphState = z.infer<typeof GraphState>

export function buildGraph() {
    const workflow = new StateGraph({
        stateSchema: GraphState
    })

        .addNode("identifyIntent", identifyIntent)
        .addNode("chatResponse", chatResponseNode)
        .addNode("lowerCase", lowercaseCaseNode)
        .addNode("upperCaseNode", upperCaseNode)

        .addEdge(START, "identifyIntent")
        .addConditionalEdges(
            "identifyIntent",
            (state: GraphState) => {
                switch (state.command) {
                    case "uppercase":
                        return "uppercase";
                    case "lowercase":
                        return "lowercase";
                    default:
                        return "fallback";
                }
            },
            {
                uppercase: "upperCaseNode",
                lowercase: "lowerCase",
                fallback: "chatResponse",
            }
        )
        .addEdge("upperCaseNode", "chatResponse")
        .addEdge("lowerCase", "chatResponse")
        .addEdge("chatResponse", END)



    return workflow.compile()
}
