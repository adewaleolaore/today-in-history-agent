# Today in History Agent

A simple AI agent built with **Mastra** that fetches and summarizes notable historical events for the current date (or any date provided by the user).  
It’s designed to integrate seamlessly with **[Telex.im](https://telex.im)** using the A2A protocol.

---

## Features

- **Fetch Historical Events:** Uses the free Wikipedia "On This Day" API.  
- **AI Summarization:** Uses **Google Gemini** through Mastra's provider interface.  
- **Workflow Automation:** Runs a 3-step workflow — Fetch → Summarize → Format.  
- **Persistent Memory:** Uses `@mastra/memory` with `@mastra/libsql` for storage.  
- **Daily Cron Job:** Automatically sends history facts at 8:00 AM (Africa/Lagos timezone).
- **Telex-Ready:** Can be triggered via A2A integration to deliver summaries on demand.

---

## Architecture Overview

Telex Platform 
(User Request)

TodayInHistoryAgent
├── Fetch Wikipedia Events
├── Summarize via Gemini
└── Return formatted text

Mastra Workflow 
(Orchestrates steps)


## Tech Stack

| Component | Description |
|------------|-------------|
| **Mastra** | AI agent framework for composable automation |
| **TypeScript** | Strongly-typed Node.js development |
| **Axios** | HTTP client for external API calls |
| **Gemini API** | LLM provider for summarization |
| **Zod** | Schema validation for workflow steps |
| **LibSQL** | Lightweight persistent memory store |

---

## Getting Started

### 1. Clone the repository

    git clone https://github.com/<your-username>/today-in-history-agent.git
    cd today-in-history-agent   

### ### 2. Install Dependencies

    npm install

### 3. Set up environment variables

    GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
    MASTRA_CLOUD_AI_TRACING_EXPORTER=off

### 4. Start the Mastra dev server

    npx mastra dev

You’ll see your agents and workflows appear in the Mastra Studio interface.

### Run the Workflow Locally
To manually test the workflow from the command line:

    npx ts-node src/testWorkflow.ts

## Deployment

### Deploy to Railway

1. **Push to GitHub** (if not already done)
2. **Connect to Railway:**
   - Go to [Railway.app](https://railway.app)
   - Create new project from GitHub repo
   - Railway will auto-detect Node.js and run `npm run build && npm run start`
3. **Add environment variables in Railway:**
   - `GOOGLE_GENERATIVE_AI_API_KEY` - Your Gemini API key
   - `TELEX_WEBHOOK_URL` (optional) - For daily scheduled messages
4. **Get your public URL** from Railway dashboard
5. **Test the endpoint:**
   ```bash
   curl -X POST https://your-app.railway.app/a2a/message \
     -H "Content-Type: application/json" \
     -d '{"message": "today"}'
   ```

## Telex Integration (A2A)

### On-Demand Messages

To connect with Telex.im for user-triggered requests:

1. Go to [Telex.im](https://telex.im) and create/configure your agent
2. Add your Railway URL as the A2A endpoint:
   ```json
   {
     "nodes": [
       {
         "id": "today_history_agent",
         "name": "Today in History Agent",
         "type": "a2a/mastra-a2a-node",
         "url": "https://your-app.railway.app/a2a/message"
       }
     ]
   }
   ```
3. Users can now message:
   - `today` - Get today's historical events
   - `history 7 4` - Get July 4th events
   - `history 12 25` - Get December 25th events

### Daily Scheduled Messages

The app includes a cron job that runs at **8:00 AM (Africa/Lagos timezone)** daily.

To enable daily delivery to your Telex channel:

1. Get your Telex channel webhook URL from channel settings
2. Add it to Railway environment variables:
   ```
   TELEX_WEBHOOK_URL=https://telex.im/api/webhook/your-channel-id
   ```
3. Uncomment the webhook code in `src/server.ts` (lines 33-37)
4. Redeploy or restart the Railway service

The cron will automatically send daily history facts every morning!

## Project Structure
    today-in-history/
    │
    ├── src/
    │   ├── mastra/
    │   │   ├── agents/
    │   │   │   └── todayInHistoryAgent.ts
    │   │   ├── workflows/
    │   │   │   └── todayInHistoryWorkflow.ts
    │   │   └── index.ts
    │   └── testWorkflow.ts
    │
    ├── .env
    ├── package.json
    ├── tsconfig.json
    └── README.md


## Development Commands

| Command                           | Description                        |
| --------------------------------- | ---------------------------------- |
| `npx mastra dev`                  | Run Mastra Studio locally          |
| `npx mastra build`                | Compile agent/workflow definitions |
| `npx ts-node src/testWorkflow.ts` | Run the workflow manually          |
| `git push origin main`            | Push updates to GitHub             |


## Author
Adewale Olaore
 - Backend Developer | Automation & Workflow Builder
 - https://linkedin.com/in/adewaleolaore


## License
This project is open-source and licensed under the MIT License.