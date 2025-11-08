import { todayInHistoryWorkflow } from "./mastra/workflows/todayInHistoryWorkflow.js";

(async () => {
  const result = await todayInHistoryWorkflow.runs;
  console.log("\n✅ Workflow Result:\n", result);
})();
