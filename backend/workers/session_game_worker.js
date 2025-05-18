// backend/session_game_worker.js
import randomizeWheel from '../utils/randomizeWheel.js'
import { adminClient } from './supabaseClients.js'
import { subscribeToTable } from './supabaseListener.js'
import throttle from 'lodash/throttle.js'
import { acquireLock, releaseLock } from './lockHelpers.js'

// List of available games (must match front-end options)
const GAMES = ['trivia', 'two-truths-one-lie', 'drawing']

// pick a unique lock ID for cleanup (make sure your locks table allows it)
const GAME_LOCK_KEY = 44

/**
 * 1. Find all sessions with two players and no selected_game yet.
 * 2. Randomly pick a game for each.
 * 3. Persist selected_game field in sessions table (only if still null).
 */
export async function processSessions() {
  try {
    const { data: pending, error: fetchErr } = await adminClient
      .from('sessions')
      .select('session_id')
      .not('player_2', 'is', null)
      .is('selected_game', null)

    if (fetchErr) throw fetchErr
    if (!pending || pending.length === 0) return

    for (const { session_id } of pending) {
      const choice = randomizeWheel(GAMES)
      const { data, error: updateErr, count } = await adminClient
        .from('sessions')
        .update({ selected_game: choice })
        .eq('session_id', session_id)
        .is('selected_game', null)
        .select('*', { count: 'exact' })

      if (updateErr) {
        console.error('Failed to set selected_game for session', session_id, updateErr)
      } else if (count === 0) {
        console.log(`Session ${session_id} already had a game assigned`)  
      } else {
        console.log(`Assigned game '${choice}' to session ${session_id}`)
      }
    }
  } catch (err) {
    console.error('processSessions error:', err)
  }
}

// --- Locking + Throttling to prevent races and hammering DB ---
let isRunning = false

async function safeProcess() {
  const gotLock = await acquireLock(GAME_LOCK_KEY)
  if (isRunning || !gotLock) return
  isRunning = true
  try {
    await processSessions()
  } finally {
    isRunning = false
    await releaseLock(GAME_LOCK_KEY)
  }
}

// Throttle invocations: at most once every 5s, with leading + trailing calls
const throttledProcessSessions = throttle(safeProcess, 5000, {
  leading: true,
  trailing: true,
})

/**
 * Start a listener on sessions table to auto-assign games when two players join.
 * Wrapped in throttle + advisory-lock guard to avoid race conditions.
 */
export function startSessionGameWorker() {
  console.log('▶️  Session Game worker listening for changes to sessions...')
  const unsubscribe = subscribeToTable(
    'sessions',
    throttledProcessSessions
  )
  return unsubscribe
}
