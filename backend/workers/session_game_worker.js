// backend/session_game_worker.js
import sampleSize from 'lodash/sampleSize.js'
import { adminClient } from './supabaseClients.js'
import { subscribeToTable } from './supabaseListener.js'
import { acquireLock, releaseLock } from './lockHelpers.js'
import throttle from 'lodash/throttle.js'

const GAME_LOCK_KEY = 44

/**
 * 1. Load active games.
 * 2. Find sessions where no game slots are filled.
 * 3. Assign as many distinct games as possible (up to 3).
 */
export async function processSessions() {
  const { data: gameRows, error: gameErr } = await adminClient
    .from('games')
    .select('name')
    .eq('active', true)

  if (gameErr) {
    console.error('Failed to fetch active games:', gameErr)
    return
  }

  const GAMES = gameRows.map(g => g.name).filter(Boolean)
  if (GAMES.length === 0) {
    console.log('[SessionGameWorker] no active games to assign')
    return
  }

  try {
    const { data: pending, error: fetchErr } = await adminClient
      .from('sessions')
      .select('session_id')
      .not('player_2', 'is', null)
      .is('selected_game', null)
      .is('selected_game2', null)
      .is('selected_game3', null)

    if (fetchErr) throw fetchErr
    if (!pending?.length) return

    for (const { session_id } of pending) {
      const picks = sampleSize(GAMES, Math.min(3, GAMES.length))

      const updateData = {}
      if (picks[0]) updateData.selected_game  = picks[0]
      if (picks[1]) updateData.selected_game2 = picks[1]
      if (picks[2]) updateData.selected_game3 = picks[2]

      const { error: updateErr } = await adminClient
        .from('sessions')
        .update(updateData)
        .eq('session_id', session_id)

      if (updateErr) {
        console.error(`Failed to assign games for session ${session_id}:`, updateErr)
      } else {
        console.log(`Assigned ${picks.length} game(s) to session ${session_id}:`, picks.join(', '))
      }
    }
  } catch (err) {
    console.error('processSessions error:', err)
  }
}

// --- Locking + throttling ---
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

const throttledProcess = throttle(safeProcess, 5000, {
  leading: true,
  trailing: true,
})

export function startSessionGameWorker() {
  console.log('▶️  Session Game worker listening for changes to sessions...')
  return subscribeToTable('sessions', throttledProcess)
}
