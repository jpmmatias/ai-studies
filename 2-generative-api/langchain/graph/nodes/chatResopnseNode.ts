import {AIMessage} from "langchain"

import { type GraphState} from "../graph";


export function chatResponseNode(state:GraphState):GraphState{
    const responseText = state.output
    const aIMessage = new AIMessage(responseText)

    return {
        ...state,
        messages: [
            ...state.messages,
            aIMessage
        ],
        output: responseText
    }

}