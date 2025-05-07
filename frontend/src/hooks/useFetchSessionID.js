// src/hooks/useFetchSessionID.js
import React, { useState, useEffect } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { getTeamData } from '../utils/api'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

/**
 * Fetch `session_id` once both teamId and teamName are set in context,
 * then subscribe to realtime updates on that team row, reacting when
 * - matched flips true  → call setMatched()
 * - session_id is written → call setSessionId()
 */
export default function useFetchSessionID() {
  const {
    teamId,
    teamName,
    sessionId,
    setSessionId,
    setMatched,        // NEW: context setter for the matched flag
  } = useGameSession()

  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    // 0) Bail early if we don’t have the basic context
    if (!teamId || !teamName) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // 1) Subscribe first to *all* updates on this team row
    const channel = supabase
      .channel(`team_session_${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `team_id=eq.${teamId}`,
        },
        payload => {
          const oldRow = payload.old || {}
          const newRow = payload.new || {}

          unstable_batchedUpdates(() => {
            // a) matched flag just turned true?
            if (!oldRow.matched && newRow.matched) {
              setMatched(true)
            }

            // b) session_id just appeared?
            if (
              newRow.session_id &&
              newRow.session_id !== oldRow.session_id
            ) {
              setSessionId(newRow.session_id)
              setLoading(false)
            }
          })
        }
      )
      .subscribe()

    // 2) Then do an initial fetch (in case it's already matched or has a session)
    getTeamData(teamId)
      .then(team => {
        // apply any existing state on first load
        if (team.matched) {
          setMatched(true)
        }
        if (team.session_id) {
          setSessionId(team.session_id)
        }
      })
      .catch(err => {
        setError(err.message || 'Fetch failed')
      })
      .finally(() => {
        setLoading(false)
      })

    // 3) Cleanup on unmount / dependency change
    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, teamName, setSessionId, setMatched])

  return { sessionId, loading, error }
}
