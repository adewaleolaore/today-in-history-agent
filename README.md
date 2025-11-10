# Today in History Agent

A simple AI agent built with **Mastra** that fetches and summarizes historical events for today or any date, and integrates with **Telex.im**.

## Features
- Fetches events from the Wikipedia “On This Day” API
- Summarizes results using Google Gemini via Mastra
- Modular workflow (fetch → summarize → respond)
- Ready for Telex A2A integration

## Tech Stack
- Node.js + TypeScript
- Mastra Framework
- Gemini API
- Axios
- Zod

## Run Locally
```bash
npm install
npx mastra dev
