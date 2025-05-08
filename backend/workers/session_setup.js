// backend/session_setup.js
import { v4 as uuidv4 } from 'uuid'
import { adminClient } from './supabaseClients.js'
import { subscribeToTable } from './supabaseListener.js'

// Simple in-memory lock
let isMatching = false

export async function processTeams() {
  // if we're already mid-match, bail out
  if (isMatching) return
  isMatching = true

  try {
    // --- your existing logic below, unchanged ---
    const { data: unmatched, error: fetchErr } = await adminClient
      .from('teams')
      .select('team_id, team_name, pub_name')
      .eq('matched', false)
      .order('created_at', { ascending: true })

    if (fetchErr) throw fetchErr
    if (!unmatched || unmatched.length < 2) return

    const byPub = unmatched.reduce((map, team) => {
      if (!team.team_name) return map
      map[team.pub_name] = map[team.pub_name] || []
      map[team.pub_name].push(team.team_id)
      return map
    }, {})

    for (const [pub, teamIds] of Object.entries(byPub)) {
      const queue = [...teamIds]
      while (queue.length >= 2) {
        const A = queue.shift()
        const B = queue.shift()
        const session_id = uuidv4()

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
        const t1Err = resA.error, t2Err = resB.error, sErr = resS.error

        if (t1Err || t2Err || sErr) {
          console.error('Error syncing pair', { A, B, t1Err, t2Err, sErr })
        } else {
          console.log(`Synced session ${session_id} for teams ${A} & ${B}`)
        }
      }
    }
    // --- end existing logic ---
  } catch (err) {
    console.error('processTeams error:', err)
  } finally {
    // release the in-process lock
    isMatching = false
  }
}

export function startTeamWorkers() {
  console.log('▶️  Session Setup worker listening for changes to teams...')
  return subscribeToTable('teams', () => processTeams())
}
