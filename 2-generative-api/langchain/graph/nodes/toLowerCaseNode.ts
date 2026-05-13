
import { type GraphState} from "../graph";


export function lowercaseCaseNode(state:GraphState):GraphState{
    const responseText = state.output.toLocaleLowerCase()

    return {
        ...state,
        output: responseText
    }

}