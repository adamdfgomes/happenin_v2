import dotenv from 'dotenv'
import http from 'http'
import { startTeamWorkers } from './session_setup.js'
import { startSessionGameWorker } from './session_game_worker.js'

// Load environment variables from .env
dotenv.config()

// HTTP server for Render health checks
// Render will send periodic GET requests to the root or /healthz to verify the service is alive.
const PORT = parseInt(process.env.PORT, 10) || 3000
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('OK')
  } else {
    res.writeHead(404)
    res.end()
  }
})

server.listen(PORT, () => {
  console.log(`▶️ Worker HTTP server listening on port ${PORT}`)
})

// Start your Supabase-backed workers
startTeamWorkers()
startSessionGameWorker()

// Self-ping to keep service from idling on Render free tier
// Set SELF_URL to your public Render URL (e.g. https://my-app.onrender.com/healthz)
const SELF_URL = process.env.SELF_URL || `http://localhost:${PORT}/healthz`
setInterval(() => {
  fetch(SELF_URL)
    .then(() => console.log('🔔 Self-ping successful'))
    .catch(err => console.error('🔔 Self-ping failed', err))
}, 5 * 60 * 1000) // every 5 minutes

// Note: Ensure you add SELF_URL as an environment variable in Render to point at your live endpoint.
