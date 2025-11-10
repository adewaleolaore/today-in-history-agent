import { Mastra } from "@mastra/core";

import { todayInHistoryAgent } from "./mastra/agents/todayInHistoryAgent";
import { summaryAgent } from "./mastra/agents/summaryAgent";

import { todayInHistoryWorkflow } from "./mastra/workflows/todayInHistoryWorkflow";

export const mastra = new Mastra({
  agents: { 
    'today-in-history-agent': todayInHistoryAgent, 
    'summary-agent': summaryAgent 
  },
  workflows: { todayInHistoryWorkflow },
  
  // 🔧 This section tells Mastra's bundler not to inline external dependencies
  bundler: {
    externals: ["axios", "node-cron", "dotenv"],
  },
});

export default mastra;