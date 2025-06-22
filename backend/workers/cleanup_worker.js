// backend/workers/cleanup_worker.js
import throttle from 'lodash/throttle.js'
import { adminClient } from './supabaseClients.js'
import { acquireLock, releaseLock } from './lockHelpers.js'

const PROCESS_INTERVAL = 2_000      // 2 seconds
const NAME_TIMEOUT     = 5 * 60 * 1000  // 5 minutes
const MATCH_TIMEOUT    = 10 * 60 * 1000 // 10 minutes
const READY_TIMEOUT    = 30 * 1_000    // 30 seconds

// Unique lock key for this worker
const CLEANUP_LOCK_KEY = 43

const processCleanup = throttle(async () => {
  console.log(`[Cleanup] start at ${new Date().toISOString()}`)
  let actionTaken = false

  const gotLock = await acquireLock(CLEANUP_LOCK_KEY)
  if (!gotLock) {
    console.log('[Cleanup] could not acquire lock')
    return
  }

  try {
    const now = Date.now()

    // 1) Delete “ghost” teams older than NAME_TIMEOUT with no team_name
    const cutoffName = new Date(now - NAME_TIMEOUT).toISOString()
    const { data: ghostData, error: ghostErr } = await adminClient
      .from('teams')
      .delete({ returning: 'representation' })
      .lte('created_at', cutoffName)
      .is('team_name', null)

    if (ghostErr) throw ghostErr
    if (ghostData?.length) {
      console.log(`[Cleanup] removed ${ghostData.length} ghost teams`)
      actionTaken = true
    }

    // 2) Expire unmatched teams 10 minutes after start_time or creation time
    const { data: teams, error: teamErr } = await adminClient
      .from('teams')
      .select('team_id, pub_name, created_at')
      .or('matched.eq.false,matched.is.null')

    if (teamErr) throw teamErr
    console.log(`[Cleanup] found ${teams.length} unmatched teams across pubs`)

    const pubNames = [...new Set(teams.map(t => t.pub_name))]
    const { data: pubs, error: pubErr } = await adminClient
      .from('pubs')
      .select('name, start_time')
      .in('name', pubNames)

    if (pubErr) throw pubErr

    // Build a map of { pub_name → start_timestamp }
    const startMap = pubs.reduce((map, p) => {
      if (p.start_time) {
        const [h, m, s] = p.start_time.split(':').map(Number)
        const stDate = new Date()
        stDate.setHours(h, m, s, 0)
        map[p.name] = stDate.getTime()
      }
      return map
    }, {})

    // Find teams whose effective wait has exceeded MATCH_TIMEOUT
    const expiredTeams = teams
      .filter(t => {
        const pubTs    = startMap[t.pub_name] || 0
        const createTs = new Date(t.created_at).getTime()
        const startTs  = Math.max(pubTs, createTs)
        return now - startTs > MATCH_TIMEOUT
      })
      .map(t => t.team_id)

    if (expiredTeams.length) {
      const { data: expData, error: expErr } = await adminClient
        .from('teams')
        .delete({ returning: 'representation' })
        .in('team_id', expiredTeams)

      if (expErr) throw expErr
      console.log(
        `[Cleanup] removed ${expData.length} expired teams after effective wait`
      )
      actionTaken = true
    }

    // 3 & 4) Clean up stalled ready-up sessions
    //    We now include `in_session` in the SELECT so we can check it below.
    const { data: sessions, error: sessErr } = await adminClient
      .from('sessions')
      .select(
        'session_id, created_at, player1_ready, player2_ready, player_1, player_2, in_session'
      )

    if (sessErr) throw sessErr

    for (const s of sessions) {
      const age = now - new Date(s.created_at).getTime()
      // wait one extra second past READY_TIMEOUT:
      const deleteThreshold = READY_TIMEOUT + 1_000  // 31 seconds

      // 3️⃣ Neither clicked “Ready” within (READY_TIMEOUT + 1 s) → delete session
      //    only if in_session !== true
      if (
        !s.player1_ready &&
        !s.player2_ready &&
        s.in_session !== true &&
        age > deleteThreshold
      ) {
        await adminClient
          .from('sessions')
          .delete()
          .eq('session_id', s.session_id)

        console.log(
          `[Cleanup] session ${s.session_id}: deleted session (nobody readied, in_session≠true, age>${deleteThreshold}ms)`
        )
        actionTaken = true
        continue
      }

      // 4️⃣ Exactly one clicked but the other didn’t → only delete if in_session !== true
      const oneReady =
        (s.player1_ready && !s.player2_ready) ||
        (!s.player1_ready && s.player2_ready)

      if (
        oneReady &&
        age > deleteThreshold &&
        s.in_session !== true
      ) {
        const readyId   = s.player1_ready ? s.player_1 : s.player_2
        const unreadyId = s.player1_ready ? s.player_2 : s.player_1

        // 1) Clear session_id & matched_id on the un-ready team (leave matched=true)
        const { error: clearErr } = await adminClient
          .from('teams')
          .update({ session_id: null, matched_id: null })
          .eq('team_id', unreadyId)

        if (clearErr) throw clearErr
        console.log(
          `[Cleanup] session ${s.session_id}: cleared session_id on unready team ${unreadyId}`
        )

        // 2) Reset the ready team back into the matching queue
        const { error: resetErr } = await adminClient
          .from('teams')
          .update({ matched: false, session_id: null, matched_id: null })
          .eq('team_id', readyId)

        if (resetErr) throw resetErr
        console.log(
          `[Cleanup] session ${s.session_id}: reset team ${readyId} to queue`
        )

        // 3) Delete the session record itself
        const { error: delSessErr2 } = await adminClient
          .from('sessions')
          .delete()
          .eq('session_id', s.session_id)

        if (delSessErr2) throw delSessErr2
        console.log(
          `[Cleanup] session ${s.session_id}: deleted session (one ready, in_session≠true, age>${deleteThreshold}ms)`
        )

        actionTaken = true
      }
    }

    if (!actionTaken) {
      console.log('[Cleanup] no actions needed')
    }
  } catch (err) {
    console.error('Cleanup worker error:', err)
  } finally {
    await releaseLock(CLEANUP_LOCK_KEY)
  }
}, PROCESS_INTERVAL, { leading: true, trailing: false })

export function startCleanupWorker() {
  processCleanup()
  setInterval(processCleanup, PROCESS_INTERVAL)
}