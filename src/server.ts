// src/server.ts
import "dotenv/config";
import { mastra } from "./mastraInstance";
import cron from "node-cron";
import { todayInHistoryWorkflow } from "./mastra/workflows/todayInHistoryWorkflow";

// Mastra instance is initialized and ready to use
console.log("Today in History server starting...");
console.log("✅ Mastra initialized successfully");

// Scheduler: example shows we can call agent.run directly
const task = cron.schedule("0 8 * * *", async () => {
  try {
    const out = await todayInHistoryWorkflow.run("today");
    // For now we just log. Later replace with Telex A2A send.
    console.log("[Running daily Today in History workflow...]", out);
  } catch (err) {
    console.error("Daily cron error:", err);
  }
}, 
{
  timezone: "Africa/Lagos"
});

console.log("⏰ Cron job scheduled for 8:00 AM (Africa/Lagos timezone)");
console.log("🚀 Server is running. Press Ctrl+C to stop.");

// Keep the process alive
process.on('SIGINT', () => {
  console.log("\n👋 Shutting down gracefully...");
  task.stop();
  process.exit(0);
});
