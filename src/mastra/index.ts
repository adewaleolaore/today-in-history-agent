
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { todayInHistoryWorkflow } from './workflows/todayInHistoryWorkflow.js';
import { summaryAgent } from './agents/summaryAgent.js';
import { todayInHistoryAgent } from './agents/todayInHistoryAgent.js';


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
    // Disable cloud tracing to avoid API errors
    default: { enabled: false }, 
  },
  server: {
    port: 8080,
    middleware: [
      {
        path: '/a2a/message',
        handler: async (c, next) => {
          if (c.req.method !== 'POST') {
            await next();
            return;
          }
          
          try {
            let body: any = {};
            try {
              body = await c.req.json();
            } catch (jsonErr) {
              console.log('⚠️ Empty or invalid JSON body, using defaults');
            }
            console.log('📥 Received A2A request:', JSON.stringify(body, null, 2));
            
            // Extract message from Telex request
            const userMessage = body?.message || body?.text || body?.content || 'today';
            const userId = body?.userId || body?.user_id;
            
            console.log(`Processing message: "${userMessage}" from user ${userId}`);
            
            // Get the agent from Mastra
            const agent = mastra.getAgent('today-in-history-agent');
            
            if (!agent) {
              return c.json({
                response: 'Agent not found',
                success: false,
                error: 'Agent "today-in-history-agent" not found'
              }, 500);
            }
            
            // Run the agent with the user's message
            const result = await agent.generate([
              {
                role: 'user',
                content: userMessage
              }
            ]);
            
            // Extract text response
            const responseText = result.text || "Sorry, I couldn't process that request.";
            
            console.log('📤 Sending response:', responseText.substring(0, 100) + '...');
            
            // Return in A2A-compliant format
            return c.json({
              response: responseText,
              success: true,
              agent: 'today-in-history-agent',
              timestamp: new Date().toISOString()
            });
          } catch (err: any) {
            console.error('❌ A2A error:', err);
            return c.json({
              response: 'Sorry, I encountered an error processing your request.',
              success: false,
              error: err.message
            }, 500);
          }
        }
      },
      {
        path: '/a2a/ping',
        handler: async (c) => {
          if (c.req.method !== 'POST') {
            return c.json({ error: 'Method not allowed' }, 405);
          }
          
          return c.json({
            status: 'ok',
            agent: 'today-in-history-agent',
            timestamp: new Date().toISOString()
          });
        }
      }
    ]
  }
});
