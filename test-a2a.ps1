# Test script for A2A endpoint
Write-Host "Testing A2A endpoint..." -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`n1. Health check..." -ForegroundColor Yellow
curl.exe http://localhost:8080/

# Test 2: Ping endpoint
Write-Host "`n`n2. Ping endpoint..." -ForegroundColor Yellow
curl.exe -X POST http://localhost:8080/a2a/ping -H "Content-Type: application/json"

# Test 3: Message with 'today'
Write-Host "`n`n3. Testing 'today' message..." -ForegroundColor Yellow
curl.exe -X POST http://localhost:8080/a2a/message `
  -H "Content-Type: application/json" `
  -d '{\"message\": \"today\"}'

# Test 4: Message with specific date
Write-Host "`n`n4. Testing 'history 7 4' message..." -ForegroundColor Yellow
curl.exe -X POST http://localhost:8080/a2a/message `
  -H "Content-Type: application/json" `
  -d '{\"message\": \"history 7 4\"}'

Write-Host "`n`nTests complete!" -ForegroundColor Green
