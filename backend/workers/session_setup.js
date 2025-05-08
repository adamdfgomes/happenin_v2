// backend/session_setup.js
import { v4 as uuidv4 } from 'uuid'
import { adminClient } from './supabaseClients.js'
import { subscribeToTable } from './supabaseListener.js'

/**
 * 1) Acquire advisory lock to prevent concurrent runs.
 * 2) Match unmatched teams within the same pub_name and mark them matched.
 * 3) Assign a new session_id UUID to each matched pair.
 * 4) Update both teams with session_id and upsert the session record.
 * 5) Release advisory lock.
 */
export async function processTeams() {
  // 1) acquire lock
  const { error: lockErr } = await adminClient.rpc('acquire_match_lock')
  if (lockErr) {
    console.error('❌ Failed to acquire match lock', lockErr)
    return
  }

  try {
    // 2) Fetch all unmatched teams ordered by creation
    const { data: unmatched, error: fetchErr } = await adminClient
      .from('teams')
      .select('team_id, team_name, pub_name')
      .eq('matched', false)
      .order('created_at', { ascending: true })

    if (fetchErr) throw fetchErr
    if (!unmatched || unmatched.length < 2) return

    // 3) Group by pub_name
    const byPub = unmatched.reduce((map, team) => {
      if (!team.team_name) return map
      map[team.pub_name] = map[team.pub_name] || []
      map[team.pub_name].push(team.team_id)
      return map
    }, {})

    // 4) For each pub, pair off teams two at a time
    for (const [pub, teamIds] of Object.entries(byPub)) {
      const queue = [...teamIds]
      while (queue.length >= 2) {
        const A = queue.shift()
        const B = queue.shift()
        const session_id = uuidv4()

        // prepare the three operations in parallel
        const updateA = adminClient
          .from('teams')
          .update({ matched: true, matched_id: B, session_id })
          .eq('team_id', A)

        const updateB = adminClient
          .from('teams')
          .update({ matched: true, matched_id: A, session_id })
          .eq('team_id', B)

        const upsertSess = adminClient
          .from('sessions')
          .upsert(
            { session_id, player_1: A, player_2: B, pub_name: pub },
            { onConflict: ['session_id'] }
          )

        const [resA, resB, resS] = await Promise.all([updateA, updateB, upsertSess])
        const { error: t1Err } = resA
        const { error: t2Err } = resB
        const { error: sErr } = resS

        if (t1Err || t2Err || sErr) {
          console.error('❌ Error syncing pair', { A, B, t1Err, t2Err, sErr })
        } else {
          console.log(`✅ Synced session ${session_id} for teams ${A} & ${B}`)
        }
      }
    }
  } catch (err) {
    console.error('processTeams error:', err)
  } finally {
    // 5) release lock
    const { error: unlockErr } = await adminClient.rpc('release_match_lock')
    if (unlockErr) {
      console.error('❌ Failed to release match lock', unlockErr)
    }
  }
}

/**
 * Start realtime listeners on `teams` table events.
 */
export function startTeamWorkers() {
  console.log('▶️  Session Setup worker listening for changes to teams...')
  const unsubscribe = subscribeToTable('teams', () => processTeams())
  return unsubscribe
}
