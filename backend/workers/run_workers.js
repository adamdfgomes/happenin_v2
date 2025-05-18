import dotenv from 'dotenv'
import { startTeamWorkers } from './session_setup.js'
import { startSessionGameWorker } from './session_game_worker.js'
import { startCleanupWorker } from './cleanup_worker.js'

// Load environment variables from .env
dotenv.config()

// Start your Supabase-backed workers
console.log('▶️ Starting workers…')
startTeamWorkers()
startSessionGameWorker()
startCleanupWorker()