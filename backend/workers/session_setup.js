// backend/session_setup.js
import { v4 as uuidv4 } from 'uuid'
import { adminClient } from './supabaseClients.js'
import { subscribeToTable } from './supabaseListener.js'

export async function processTeams() {
  try {
    // 1) figure out which pubs actually have ≥2 waiting teams
    const { data: pubs, error: pubsErr } = await adminClient
      .from('teams')
      .select('pub_name', { count: 'exact' })
      .eq('matched', false)
      .neq('pub_name', null)
      .group('pub_name')
      .having('count', 'gte', 2)

    if (pubsErr) throw pubsErr
    if (!pubs?.length) return

    for (const { pub_name: pub } of pubs) {
      // 2) Atomically mark the *first* two unmatched teams for this pub as matched,
      //    and return their IDs. Postgres will lock & update exactly those two rows,
      //    so no two workers can grab the same teams.
      const { data: picked, count, error: pickErr } = await adminClient
        .from('teams')
        .update({ matched: true })
        .eq('pub_name', pub)
        .eq('matched', false)
        .order('created_at', { ascending: true })
        .limit(2)
        .select('team_id', { count: 'exact' })

      if (pickErr) {
        console.error(`❌ failed to pick teams for pub "${pub}"`, pickErr)
        continue
      }
      if (count < 2) {
        // maybe another worker snatched one of them first
        continue
      }

      // 3) We got exactly two teams — safe to create a session
      const [A, B] = picked.map(t => t.team_id)
      const session_id = uuidv4()

      const { error: sessErr } = await adminClient
        .from('sessions')
        .insert({ session_id, player_1: A, player_2: B, pub_name: pub })

      if (sessErr) {
        console.error(`❌ could not insert session for ${A}&${B}`, sessErr)
        // optionally, roll back their matched flag here if you really need to
        continue
      }

      // 4) Finally stamp the session_id and matched_id onto each team
      await Promise.all([
        adminClient
          .from('teams')
          .update({ matched_id: B, session_id })
          .eq('team_id', A),
        adminClient
          .from('teams')
          .update({ matched_id: A, session_id })
          .eq('team_id', B),
      ])

      console.log(`✅ Synced session ${session_id} for teams ${A} & ${B} at pub "${pub}"`)
    }
  } catch (err) {
    console.error('processTeams:', err)
  }
}

export function startTeamWorkers() {
  console.log('▶️ Session Setup worker listening for changes to teams...')
  return subscribeToTable('teams', () => processTeams())
}
