import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { todayInHistoryAgent } from "../agents/todayInHistoryAgent";
import { summaryAgent } from "../agents/summaryAgent";

// Step 1: Fetch historical events
const fetchHistory = createStep({
  id: "fetch-history",
  description: "Fetches today's historical events.",
  outputSchema: z.object({
    events: z.string(),
  }),
  execute: async () => {
    console.log("[Workflow] Step 1: Fetching today's history...");
    const result = await todayInHistoryAgent.generate([{
      role: 'user',
      content: 'today'
    }]);
    return { events: result.text || '' };
  },
});

// Step 2: Summarize events
const summarizeHistory = createStep({
  id: "summarize-history",
  description: "Summarizes historical events in 2 sentences.",
  inputSchema: z.object({
    events: z.string(),
  }),
  outputSchema: z.object({
    events: z.string(),
    summary: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log("[Workflow] Step 2: Summarizing...");
    const result = await summaryAgent.generate([{
      role: 'user',
      content: `Summarize these historical events into 2 sentences:\n\n${inputData.events}`
    }]);
    return { events: inputData.events, summary: result.text || '' };
  },
});

// Step 3: Combine and finalize
const finalize = createStep({
  id: "finalize",
  description: "Formats final output text.",
  inputSchema: z.object({
    events: z.string(),
    summary: z.string(),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async ({ inputData }) => {
    console.log("[Workflow] Step 3: Finalizing...");
    const formatted = `📜 TODAY IN HISTORY 📜\n\n${inputData.events}\n\n💡 Summary:\n${inputData.summary}`;
    return { output: formatted };
  },
});

// Build the workflow
export const todayInHistoryWorkflow = createWorkflow({
  id: "today-in-history-workflow",
  inputSchema: z.object({
    date: z.string().optional().describe("Optional date to fetch events for"),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
})
  .then(fetchHistory)
  .then(summarizeHistory)
  .then(finalize);

// Finalize registration
todayInHistoryWorkflow.commit();