// src/a2a-server.ts
import "dotenv/config";
import express from "express";
import { mastra } from "./mastraInstance";

const app = express();
app.use(express.json());

// Health check
app.get("/", (_req, res) => res.send("✅ Today in History A2A Server"));

// A2A endpoint - properly handle Telex requests
app.post("/a2a/message", async (req, res) => {
  try {
    console.log("📥 Received A2A request:", JSON.stringify(req.body, null, 2));
    
    // Extract message from Telex request (handle multiple possible formats)
    const userMessage = req.body?.message || req.body?.text || req.body?.content || "today";
    const channelId = req.body?.channelId || req.body?.channel_id;
    const userId = req.body?.userId || req.body?.user_id;
    
    console.log(`Processing message: "${userMessage}" from user ${userId}`);

    // Get the agent from Mastra
    const agent = mastra.getAgent("today-in-history-agent");
    
    if (!agent) {
      throw new Error("Agent 'today-in-history-agent' not found");
    }

    // Run the agent with the user's message
    const result = await agent.generate([
      {
        role: "user",
        content: userMessage
      }
    ]);

    // Extract text response
    const responseText = result.text || "Sorry, I couldn't process that request.";
    
    console.log("📤 Sending response:", responseText.substring(0, 100) + "...");

    // Return in A2A-compliant format
    res.status(200).json({
      response: responseText,
      success: true,
      agent: "today-in-history-agent",
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("❌ A2A error:", err);
    res.status(500).json({ 
      response: "Sorry, I encountered an error processing your request.",
      success: false,
      error: err.message 
    });
  }
});

// Ping endpoint for Telex health checks
app.post("/a2a/ping", (_req, res) => {
  res.status(200).json({ 
    status: "ok", 
    agent: "today-in-history-agent",
    timestamp: new Date().toISOString() 
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 A2A server listening on port ${port}`);
  console.log(`📍 Endpoint: http://localhost:${port}/a2a/message`);
});
