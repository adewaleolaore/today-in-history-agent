
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { todayInHistoryWorkflow } from './workflows/todayInHistoryWorkflow';
import { summaryAgent } from './agents/summaryAgent';
import { todayInHistoryAgent } from './agents/todayInHistoryAgent';


export const mastra = new Mastra({
  workflows: { todayInHistoryWorkflow },
  agents: { summaryAgent, todayInHistoryAgent },
  storage: new LibSQLStore({
    // stores observability, scores, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  observability: {
    // Enables DefaultExporter and CloudExporter for AI tracing
    default: { enabled: true }, 
  },
});
