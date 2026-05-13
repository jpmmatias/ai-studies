import { type GraphState } from "../graph";

export function identifyIntent(state: GraphState): GraphState {
    const input = state.messages.at(-1)?.text ?? ""
    const inputLower = input.toLocaleLowerCase()

    let command: GraphState["command"] = "unknown"

    if (inputLower.includes("upper")) {
        command = "uppercase"
    } 
    
    if (inputLower.includes("lower")) {
        command = "lowercase"
    }


    return {
        ...state,
        command, output: input
    }
}