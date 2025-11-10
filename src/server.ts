// src/server.ts
import "dotenv/config";
import { mastra } from "./mastraInstance.js";

// Mastra instance is initialized and ready to use
console.log("Today in History server starting...");
console.log("✅ Mastra initialized successfully");
console.log("🚀 Server is running. Press Ctrl+C to stop.");

// Keep the process alive
process.on('SIGINT', () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});
