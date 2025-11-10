import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { Agent } from '@mastra/core';
import { Memory } from '@mastra/memory';
import axios from 'axios';
import { Agent as Agent$1 } from '@mastra/core/agent';

function getInstructions() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `You are a helpful assistant that provides historical events.

When the user asks for "today" or a specific date, immediately call the fetchHistoricalEvents tool:
- For "today": call fetchHistoricalEvents(${month}, ${day})
- For "Nov 11" or "November 11": call fetchHistoricalEvents(11, 11)
- For "12/25": call fetchHistoricalEvents(12, 25)

Month mapping: Jan=1, Feb=2, Mar=3, Apr=4, May=5, Jun=6, Jul=7, Aug=8, Sep=9, Oct=10, Nov=11, Dec=12

After getting the events, format them nicely with "\u{1F4DC} Today in History \u{1F4DC}" at the top.`;
}
const todayInHistoryAgent = new Agent({
  id: "today-in-history-agent",
  name: "Today in History Agent",
  description: "Fetches and formats notable historical events for today or a requested date.",
  instructions: getInstructions(),
  model: "google/gemini-2.0-flash",
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db"
      // relative to .mastra/output
    })
  }),
  tools: {
    fetchHistoricalEvents: {
      description: "Fetches historical events for a specific date from Wikipedia's 'On This Day' API. Always provide both month and day as numbers.",
      parameters: {
        type: "object",
        properties: {
          month: {
            type: "number",
            description: "Month as a number from 1 (January) to 12 (December)",
            minimum: 1,
            maximum: 12
          },
          day: {
            type: "number",
            description: "Day of month as a number from 1 to 31",
            minimum: 1,
            maximum: 31
          }
        },
        required: ["month", "day"],
        additionalProperties: false
      },
      execute: async ({ month, day }) => {
        try {
          if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
            if (month === void 0 && day === void 0) {
              return "Please provide both month and day numbers.";
            }
            console.error(`\u274C Invalid parameters: month=${month}, day=${day}`);
            return "Invalid date parameters. Month must be 1-12 and day must be 1-31.";
          }
          console.log(`\u{1F50D} Fetching historical events for ${month}/${day}...`);
          const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
          const response = await axios.get(url, {
            headers: {
              "User-Agent": "TodayInHistoryBot/1.0 (Educational Project)"
            }
          });
          const events = response.data.events.slice(0, 5);
          if (!events.length) {
            return `No historical events found for ${month}/${day}.`;
          }
          const formatted = events.map((e) => `\u2022 ${e.year}: ${e.text}`).join("\n");
          return `\u{1F4DC} Historical events for ${month}/${day}:

${formatted}`;
        } catch (err) {
          console.error("Error fetching historical events:", err);
          return "Sorry, I couldn't fetch historical events right now. The Wikipedia API might be temporarily unavailable.";
        }
      }
    }
  }
});

const summaryAgent = new Agent$1({
  name: "Summary Agent",
  instructions: `
    You are a concise writer who takes a list of historical events and turns them into a short, engaging summary paragraph.
    Make it sound like a "Did you know?" post.
    Keep it under 2 sentences, friendly tone.
  `,
  model: "google/gemini-2.0-flash"
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
    const result = await todayInHistoryAgent.generate([{
      role: "user",
      content: "today"
    }]);
    return { events: result.text || "" };
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
    const result = await summaryAgent.generate([{
      role: "user",
      content: `Summarize these historical events into 2 sentences:

${inputData.events}`
    }]);
    return { events: inputData.events, summary: result.text || "" };
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
    // Disable cloud tracing to avoid API errors
    default: {
      enabled: false
    }
  },
  server: {
    port: 8080,
    middleware: [{
      path: "/a2a/message",
      handler: async (c, next) => {
        if (c.req.method !== "POST") {
          await next();
          return;
        }
        try {
          let body = {};
          try {
            body = await c.req.json();
          } catch (jsonErr) {
            console.log("\u26A0\uFE0F Empty or invalid JSON body, using defaults");
          }
          console.log("\u{1F4E5} Received A2A request:", JSON.stringify(body, null, 2));
          const userMessage = body?.message || body?.text || body?.content || "today";
          const userId = body?.userId || body?.user_id;
          console.log(`Processing message: "${userMessage}" from user ${userId}`);
          const agent = mastra.getAgent("today-in-history-agent");
          if (!agent) {
            return c.json({
              response: "Agent not found",
              success: false,
              error: 'Agent "today-in-history-agent" not found'
            }, 500);
          }
          const result = await agent.generate([{
            role: "user",
            content: userMessage
          }]);
          const responseText = result.text || "Sorry, I couldn't process that request.";
          console.log("\u{1F4E4} Sending response:", responseText.substring(0, 100) + "...");
          return c.json({
            response: responseText,
            success: true,
            agent: "today-in-history-agent",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        } catch (err) {
          console.error("\u274C A2A error:", err);
          return c.json({
            response: "Sorry, I encountered an error processing your request.",
            success: false,
            error: err.message
          }, 500);
        }
      }
    }, {
      path: "/a2a/ping",
      handler: async (c) => {
        if (c.req.method !== "POST") {
          return c.json({
            error: "Method not allowed"
          }, 405);
        }
        return c.json({
          status: "ok",
          agent: "today-in-history-agent",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }]
  }
});

export { mastra };
