import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import axios from 'axios';

const todayInHistoryAgent = new Agent({
  name: "Today in History Agent",
  instructions: "You are a helpful historical assistant. Provide notable historical events for today or a requested date.",
  model: "gemini/gemini-2.0-flash",
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db"
      // path is relative to the .mastra/output directory
    })
  }),
  // Main function that runs on incoming messages
  run: async (input) => {
    try {
      let month, day;
      const msg = input.trim().toLowerCase();
      if (msg === "today") {
        const today = /* @__PURE__ */ new Date();
        month = today.getMonth() + 1;
        day = today.getDate();
      } else {
        const match = msg.match(/history\s+(\d{1,2})\s+(\d{1,2})/);
        if (match) {
          month = parseInt(match[1], 10);
          day = parseInt(match[2], 10);
        } else {
          return "Please type 'today' or 'history <month> <day>'. Example: history 6 12";
        }
      }
      const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
      const response = await axios.get(url);
      const events = response.data.events.slice(0, 5);
      if (events.length === 0) return `No historical events found for ${month}/${day}.`;
      const formatted = events.map((e) => `\u2022 ${e.year}: ${e.text}`).join("\n");
      return `Historical events for ${month}/${day}:
${formatted}`;
    } catch (err) {
      console.error(err);
      return "Sorry, I couldn't fetch historical events right now.";
    }
  }
});

const summaryAgent = new Agent({
  name: "Summary Agent",
  instructions: `
    You are a concise writer who takes a list of historical events and turns them into a short, engaging summary paragraph.
    Make it sound like a "Did you know?" post.
    Keep it under 2 sentences, friendly tone.
  `,
  model: "gemini/gemini-2.0-flash"
  /**
   * Takes a list of historical events and returns a short, engaging summary paragraph.
   * The AI model itself will generate the summary based on the input.
   * @param {string} input - a list of historical events
   * @returns {string} a short, engaging summary paragraph
   */
});

const fetchHistory = createStep({
  id: "fetch-history",
  description: "Fetches today's historical events.",
  outputSchema: z.object({
    events: z.string()
  }),
  execute: async () => {
    console.log("[Workflow] Step 1: Fetching today's history...");
    const result = await todayInHistoryAgent.run("today");
    return { events: result };
  }
});
const summarizeHistory = createStep({
  id: "summarize-history",
  description: "Summarizes historical events in 2 sentences.",
  inputSchema: z.object({
    events: z.string()
  }),
  outputSchema: z.object({
    events: z.string(),
    summary: z.string()
  }),
  execute: async ({ inputData }) => {
    console.log("[Workflow] Step 2: Summarizing...");
    const summary = await summaryAgent.run(
      `Summarize these historical events into 2 sentences:

${inputData.events}`
    );
    return { events: inputData.events, summary };
  }
});
const finalize = createStep({
  id: "finalize",
  description: "Formats final output text.",
  inputSchema: z.object({
    events: z.string(),
    summary: z.string()
  }),
  outputSchema: z.object({
    output: z.string()
  }),
  execute: async ({ inputData }) => {
    console.log("[Workflow] Step 3: Finalizing...");
    const formatted = `\u{1F4DC} TODAY IN HISTORY \u{1F4DC}

${inputData.events}

\u{1F4A1} Summary:
${inputData.summary}`;
    return { output: formatted };
  }
});
const todayInHistoryWorkflow = createWorkflow({
  id: "today-in-history-workflow",
  inputSchema: z.object({
    date: z.string().optional().describe("Optional date to fetch events for")
  }),
  outputSchema: z.object({
    output: z.string()
  })
}).then(fetchHistory).then(summarizeHistory).then(finalize);
todayInHistoryWorkflow.commit();

const mastra = new Mastra({
  workflows: {
    todayInHistoryWorkflow
  },
  agents: {
    summaryAgent,
    todayInHistoryAgent
  },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:"
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info"
  }),
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: {
      enabled: true
    }
  }
});

export { mastra };
