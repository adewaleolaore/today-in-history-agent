// src/server.ts
import "dotenv/config";
import { mastra } from "./mastraInstance.js";
import cron from "node-cron";
import axios from "axios";

// Mastra instance is initialized and ready to use
console.log("Today in History server starting...");
console.log("✅ Mastra initialized successfully");

// Cron job: Send daily history to Telex at 8:00 AM
const task = cron.schedule("0 8 * * *", async () => {
  try {
    console.log("⏰ Running daily Today in History task...");
    
    // Get the agent and generate response
    const agent = mastra.getAgent("today-in-history-agent");
    if (!agent) {
      console.error("❌ Agent not found");
      return;
    }
    
    const result = await agent.generate([{
      role: "user",
      content: "today"
    }]);
    
    const message = result.text || "No events available today.";
    console.log("📜 Generated message:", message.substring(0, 100) + "...");
    
    // TODO: Send to Telex channel
    // If you have a Telex webhook URL, uncomment and configure:
    // const TELEX_WEBHOOK = process.env.TELEX_WEBHOOK_URL;
    // if (TELEX_WEBHOOK) {
    //   await axios.post(TELEX_WEBHOOK, { message });
    //   console.log("✅ Sent to Telex channel");
    // }
    
    console.log("✅ Daily task completed");
  } catch (err: any) {
    console.error("❌ Daily cron error:", err.message);
  }
}, {
  timezone: "Africa/Lagos"
});

console.log("⏰ Cron job scheduled for 8:00 AM daily (Africa/Lagos timezone)");
console.log("🚀 Server is running. Press Ctrl+C to stop.");

// Keep the process alive
process.on('SIGINT', () => {
  console.log("\n👋 Shutting down gracefully...");
  task.stop();
  process.exit(0);
});
