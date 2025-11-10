// test-agent.ts
import { todayInHistoryAgent } from './src/mastra/agents/todayInHistoryAgent.js';

async function testAgent() {
  console.log('Testing todayInHistoryAgent...\n');
  
  try {
    // Test with "today"
    console.log('Test 1: Asking for today\'s events');
    const result1 = await todayInHistoryAgent.generate([
      { role: 'user', content: 'today' }
    ]);
    console.log('Result:', result1.text);
    console.log('\n' + '='.repeat(80) + '\n');
    
    // Test with specific date
    console.log('Test 2: Asking for November 11');
    const result2 = await todayInHistoryAgent.generate([
      { role: 'user', content: 'November 11' }
    ]);
    console.log('Result:', result2.text);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAgent();
