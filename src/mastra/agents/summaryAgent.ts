import { Agent } from "@mastra/core/agent";

export const summaryAgent = new Agent({
  name: "Summary Agent",
  instructions: `
    You are a concise writer who takes a list of historical events and turns them into a short, engaging summary paragraph.
    Make it sound like a "Did you know?" post.
    Keep it under 2 sentences, friendly tone.
  `,
  model: "gemini/gemini-2.0-flash",
  /**
   * Takes a list of historical events and returns a short, engaging summary paragraph.
   * The AI model itself will generate the summary based on the input.
   * @param {string} input - a list of historical events
   * @returns {string} a short, engaging summary paragraph
   */

});
