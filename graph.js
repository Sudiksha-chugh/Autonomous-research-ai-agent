import { StateGraph, MessagesAnnotation, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { chatModel } from "./llm.js";
import { tools } from "./tools.js";

const modelWithTools = chatModel.bindTools(tools);

// Node: the LLM looks at the conversation and decides what to do next
async function agentNode(state) {
  const response = await modelWithTools.invoke(state.messages);
  return { messages: [response] };
}

// Edge logic: did the LLM ask to call a tool, or is it done?
function shouldContinue(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return END;
}

const toolNode = new ToolNode(tools); // runs whichever tool(s) the LLM requested

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", agentNode)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addConditionalEdges("agent", shouldContinue, { tools: "tools", [END]: END })
  .addEdge("tools", "agent"); // after tools run, go back to the agent to decide again

export const graph = workflow.compile();

export function buildInitialMessages(topic) {
  return [
    new SystemMessage(
      `You are an autonomous research agent. Use the tools available:
- memory_search: check what's already known from past research first
- web_search: search the web for new information (also saves results to memory automatically)

Use tools as many times as needed until you have enough information, then respond with
a FINAL report (no more tool calls) containing:
- A short intro
- 2-4 thematic sections
- A brief conclusion
- A Sources list with titles/links you used

Do not call more than 6 tools total.`
    ),
    new HumanMessage(`Research topic: ${topic}`),
  ];
}