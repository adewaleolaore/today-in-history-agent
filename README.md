# Today in History Agent

A simple AI agent built with **Mastra** that fetches and summarizes notable historical events for the current date (or any date provided by the user).  
It’s designed to integrate seamlessly with **[Telex.im](https://telex.im)** using the A2A protocol.

---

## Features

- **Fetch Historical Events:** Uses the free Wikipedia “On This Day” API.  
- **AI Summarization:** Uses **Google Gemini** through Mastra’s provider interface.  
- **Workflow Automation:** Runs a 3-step workflow — Fetch → Summarize → Format.  
- **Persistent Memory:** Uses `@mastra/memory` with `@mastra/libsql` for storage.  
- **Telex-Ready:** Can be triggered via A2A integration to deliver daily summaries.  

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

## Telex Integration (A2A)

To connect with Telex.im:

1. Deploy your Mastra instance to a public endpoint (e.g., Render, Railway, or Vercel).
2. Use your public /a2a/message endpoint in the Telex workflow JSON.
Example:

    {
        "nodes": [
            {
            "id": "today_history_agent",
            "name": "Today in History Agent",
            "type": "a2a/mastra-a2a-node",
            "url": "https://your-server.com/a2a/message"
            }
        ]
    }
3. On Telex, your agent can respond to messages like:
    >> today
    >> history 7 4 (for July 4th)
    >> history 1 1 (for January 1st)

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