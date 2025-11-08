// src/mastra/agents/todayInHistoryAgent.ts
import { Agent } from "@mastra/core";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import axios from "axios";

/**
 * Agent declaration: purely defines identity, model, and memory.
 * No execution logic inside — handled externally via .runs()
 */
export const todayInHistoryAgent = new Agent({
  id: "today-in-history-agent",
  name: "Today in History Agent",
  description:
    "Fetches and formats notable historical events for today or a requested date.",
  instructions:
    "You are a helpful assistant that provides notable historical events for today or a requested date. When possible, return them clearly as bullet points with the year and short description.",
  model: "gemini/gemini-2.0-flash",
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // relative to .mastra/output
    }),
  }),
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
    const response = await axios.get(url);
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
