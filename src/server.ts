// src/server.ts
import "dotenv/config";
import { mastra } from "./mastraInstance";
import cron from "node-cron";
import { todayInHistoryWorkflow } from "./mastra/workflows/todayInHistoryWorkflow";

// Start Mastra dev server
// Note: mastra.start() is a typical method; if your Mastra release uses different API,
(async () => {
  try {
    await mastra.start(); // starts the local Mastra server and Studio
    console.log("Mastra started.");
  } catch (err) {
    console.error("Failed to start Mastra:", err);
  }
})();

// Scheduler: example shows we can call agent.run directly
cron.schedule("0 8 * * *", async () => {
  try {
    const out = await todayInHistoryWorkflow.run("today");
    // For now we just log. Later replace with Telex A2A send.
    console.log("[Running daily Today in History workflow...]", out);
  } catch (err) {
    console.error("Daily cron error:", err);
  }
}, {
  timezone: "Africa/Lagos"
});
