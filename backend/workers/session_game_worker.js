// backend/session_game_worker.js
import randomizeWheel from '../utils/randomizeWheel.js';
import { adminClient } from './supabaseClients.js';
import { subscribeToTable } from './supabaseListener.js';

// List of available games (must match front-end options)
const GAMES = ['trivia', 'two-truths-one-lie', 'drawing'];

/**
 * 1. Find all sessions with two players and no selected_game yet.
 * 2. Randomly pick a game for each.
 * 3. Persist selected_game field in sessions table.
 */
export async function processSessions() {
  try {
    const { data: pending, error: fetchErr } = await adminClient
      .from('sessions')
      .select('session_id')
      .not('player_2', 'is', null)    // <-- fix here
      .is('selected_game', null);

    if (fetchErr) throw fetchErr;
    if (!pending || pending.length === 0) return;

    for (const { session_id } of pending) {
      const choice = randomizeWheel(GAMES);
      const { error: updateErr } = await adminClient
        .from('sessions')
        .update({ selected_game: choice })
        .eq('session_id', session_id);

      if (updateErr) {
        console.error(
          'Failed to set selected_game for session',
          session_id,
          updateErr
        );
      } else {
        console.log(`Assigned game '${choice}' to session ${session_id}`);
      }
    }
  } catch (err) {
    console.error('processSessions error:', err);
  }
}

/**
 * Start a listener on sessions table to auto-assign games when two players join.
 */
export function startSessionGameWorker() {
  console.log(
    '▶️  Session Game worker listening for changes to sessions...'
  );
  const unsubscribe = subscribeToTable(
    'sessions',
    () => processSessions()
  );
  return unsubscribe;
}
