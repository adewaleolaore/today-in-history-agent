// src/mastra/agents/todayInHistoryAgent.ts
import { Agent } from "@mastra/core";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import axios from "axios";

/**
 * Generate dynamic instructions with current date
 */
function getInstructions() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  return `You are a helpful assistant that provides historical events.

When the user asks for "today" or a specific date, immediately call the fetchHistoricalEvents tool:
- For "today": call fetchHistoricalEvents(${month}, ${day})
- For "Nov 11" or "November 11": call fetchHistoricalEvents(11, 11)
- For "12/25": call fetchHistoricalEvents(12, 25)

Month mapping: Jan=1, Feb=2, Mar=3, Apr=4, May=5, Jun=6, Jul=7, Aug=8, Sep=9, Oct=10, Nov=11, Dec=12

After getting the events, format them nicely with "📜 Today in History 📜" at the top.`;
}

/**
 * Create the tool for fetching historical events
 */
const fetchHistoricalEventsTool = createTool({
  id: "fetchHistoricalEvents",
  description: "Fetches historical events for a specific date from Wikipedia's 'On This Day' API. Always provide both month and day as numbers.",
  inputSchema: z.object({
    month: z.number().min(1).max(12).describe("Month as a number from 1 (January) to 12 (December)"),
    day: z.number().min(1).max(31).describe("Day of month as a number from 1 to 31")
  }),
  outputSchema: z.string().describe("Formatted historical events text"),
  execute: async ({ context }) => {
    const { month, day } = context;
    
    try {
      // Validate parameters
      if (!month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
        console.error(`❌ Invalid parameters: month=${month}, day=${day}`);
        return "Invalid date parameters. Month must be 1-12 and day must be 1-31.";
      }
      
      console.log(`🔍 Fetching historical events for ${month}/${day}...`);
      
      const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'TodayInHistoryBot/1.0 (Educational Project)'
        }
      });
      const events = response.data.events.slice(0, 5);
      
      if (!events.length) {
        return `No historical events found for ${month}/${day}.`;
      }
      
      const formatted = events.map((e: any) => `• ${e.year}: ${e.text}`).join("\n");
      return `📜 Historical events for ${month}/${day}:\n\n${formatted}`;
    } catch (err) {
      console.error("Error fetching historical events:", err);
      return "Sorry, I couldn't fetch historical events right now. The Wikipedia API might be temporarily unavailable.";
    }
  }
});

/**
 * Agent with tool integration for fetching historical events
 */
export const todayInHistoryAgent = new Agent({
  id: "today-in-history-agent",
  name: "Today in History Agent",
  description:
    "Fetches and formats notable historical events for today or a requested date.",
  instructions: getInstructions(),
  model: "google/gemini-2.0-flash",
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // relative to .mastra/output
    }),
  }),
  tools: {
    fetchHistoricalEvents: fetchHistoricalEventsTool
  }
});

/**
 * Helper function: encapsulates the logic previously in `run`
 * This can be called inside a workflow step or API route.
 */
export async function fetchTodayInHistory(input: string): Promise<string> {
  try {
    let month: number;
    let day: number;
    const msg = input.trim().toLowerCase();

    if (msg === "today") {
      const today = new Date();
      month = today.getMonth() + 1; // JS months are 0-indexed
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
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'TodayInHistoryBot/1.0 (Educational Project)'
      }
    });
    const events = response.data.events.slice(0, 5);

    if (!events.length) return `No historical events found for ${month}/${day}.`;

    const formatted = events.map((e: any) => `• ${e.year}: ${e.text}`).join("\n");
    return `Historical events for ${month}/${day}:\n${formatted}`;
  } catch (err) {
    console.error("[TodayInHistoryAgent] Error fetching data:", err);
    return "Sorry, I couldn't fetch historical events right now.";
  }
}

/**
 * Modern invocation example:
 * const result = await todayInHistoryAgent.runs({
 *   messages: [{ role: "user", content: "today" }]
 * });
 *
 * or directly:
 * const text = await fetchTodayInHistory("today");
 */
