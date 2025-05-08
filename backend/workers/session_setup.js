import { adminClient } from './supabaseClients.js'

export async function processTeams() {
  try {
    const { data: pairs, error } = await adminClient
      .rpc('match_all_pairs')   // call our new stored-procedure
    if (error) {
      console.error('❌ match_all_pairs RPC error', error)
      return
    }

    if (!pairs || pairs.length === 0) {
      console.log('🔍 no new matches right now')
      return
    }

    // log each new match
    for (const { session_id, player1, player2, pub_name } of pairs) {
      console.log(`✅ Synced session ${session_id} for teams ${player1} & ${player2} at pub ${pub_name}`)
    }
  } catch (err) {
    console.error('processTeams error:', err)
  }
}

/**
 * Start realtime listeners on `teams` table events.
 */
export function startTeamWorkers() {
  console.log('▶️  Session Setup worker listening for changes to teams...')
  const unsubscribe = subscribeToTable(
    'teams',
    () => processTeams()
  )
  return unsubscribe
}
