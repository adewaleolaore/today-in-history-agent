# Running Mastra Studio Locally

## Overview

You have **two different servers** in this project:

1. **Mastra Studio** (`npm run dev`) - Interactive development UI for testing agents/workflows
2. **A2A Server** (`npm run a2a`) - Production endpoint for Telex.im integration

## Option 1: Mastra Studio (for Development/Testing)

### Start Mastra Studio
```bash
npm run dev
```

This runs `src/server.ts` which:
- Starts the Mastra Studio web interface
- Includes a cron scheduler (runs daily at 8am WAT)
- Provides interactive UI for testing agents and workflows

### Access the Studio
Once started, Mastra Studio will be available at:
```
http://localhost:8080
```
(Check the console output for the exact URL)

### What You Can Do in Studio
- ✅ Test agents interactively
- ✅ Run workflows step-by-step
- ✅ View agent responses in real-time
- ✅ Debug tool calls and parameters
- ✅ Inspect agent memory and context

### When to Use
- 🧪 Testing your agent logic
- 🐛 Debugging issues
- 📊 Viewing workflow execution
- 🎨 Iterating on agent instructions

---

## Option 2: A2A Server (for Production/Telex Integration)

### Start A2A Server
```bash
npm run a2a
```

This runs `src/a2a-server.ts` which:
- Exposes REST endpoints for Telex.im
- Handles A2A protocol requests
- Production-ready HTTP server

### Endpoints
```
http://localhost:8080/              # Health check
http://localhost:8080/a2a/message   # Main A2A endpoint
http://localhost:8080/a2a/ping      # Ping endpoint
```

### When to Use
- 🚀 Testing Telex.im integration locally
- 🔌 Connecting external services
- 📡 Production deployment
- 🧪 Testing with curl/Postman

---

## Running Both Simultaneously

You **can** run both at the same time for comprehensive testing:

### Terminal 1: Mastra Studio
```bash
npm run dev
```

### Terminal 2: A2A Server
```bash
npm run a2a
```

This lets you:
1. Test agent logic in Mastra Studio
2. Verify A2A integration works correctly
3. Compare responses between both interfaces

**Note:** They use different ports, so no conflicts!

---

## Quick Command Reference

| Command | What It Does | Port | Use Case |
|---------|--------------|------|----------|
| `npm run dev` | Mastra Studio + Cron | 3000 | Interactive testing |
| `npm run a2a` | A2A HTTP Server | 8080 | Telex integration |
| `npm start` | Build + Run A2A | 8080 | Production |
| `npx mastra dev` | CLI Mastra Studio | 3000 | Alternative Studio launcher |

---

## Testing Your Agent

### In Mastra Studio:
1. Run `npm run dev`
2. Open `http://localhost:8080`
3. Navigate to "Agents" → "today-in-history-agent"
4. Type messages like "today" or "history 7 4"
5. See responses in real-time

### Via A2A Server:
1. Run `npm run a2a`
2. Use curl or test script:
   ```bash
   curl -X POST http://localhost:8080/a2a/message \
     -H "Content-Type: application/json" \
     -d '{"message": "today"}'
   ```
3. Or run: `.\test-a2a.ps1`

---

## Troubleshooting

### Mastra Studio Won't Start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process if needed (replace PID)
taskkill /PID <process_id> /F
```

### A2A Server Won't Start
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Kill the process if needed
taskkill /PID <process_id> /F
```

### Both Are Running But Can't Access
- Check your `.env` file has `GOOGLE_GEMINI_API_KEY`
- Verify firewall isn't blocking ports 3000/8080
- Try `http://localhost:8080` explicitly (not `127.0.0.1`)

---

## Recommended Workflow

1. **Development Phase:**
   - Use `npm run dev` (Mastra Studio)
   - Test and refine your agent logic
   - Debug tool calls and responses

2. **Integration Testing:**
   - Switch to `npm run a2a` (A2A Server)
   - Test with curl/Postman
   - Verify A2A protocol compliance

3. **Deployment:**
   - Use `npm start` for production
   - Deploy to Railway/Render/Vercel
   - Point Telex.im to your deployed URL

---

## Pro Tips

💡 **Use Mastra Studio first** - It's much easier to debug agent issues in the UI than through curl requests

💡 **Test A2A locally before deploying** - Use the test script to catch issues early

💡 **Check both servers' logs** - They show different information useful for debugging

💡 **Use `tsx --watch`** - Auto-restart on file changes:
```bash
tsx --watch src/a2a-server.ts
```

---

## Summary

- **Development:** `npm run dev` → Mastra Studio (http://localhost:3000)
- **Production Testing:** `npm run a2a` → A2A Server (http://localhost:8080)
- **Deploy:** `npm start` → Production-ready A2A Server

Both servers use the same Mastra instance, so your agents work identically in both! 🎯
