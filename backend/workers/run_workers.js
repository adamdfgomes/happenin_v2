import dotenv from 'dotenv'
import { startTeamWorkers } from './session_setup.js'
import { startSessionGameWorker } from './session_game_worker.js'

dotenv.config()

// Listen for team matching events
startTeamWorkers()

// Listen for fully-formed sessions (two players joined) and assign games
startSessionGameWorker()
