// src/hooks/useFetchSessionID.js
import { useState, useEffect } from 'react'
import { getTeamData } from '../utils/api'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

/**
 * Fetch `session_id` once both teamId and teamName are set in context,
 * then subscribe to realtime updates on that team row, reacting only when
 * the `session_id` column itself changes.
 */
export default function useFetchSessionID() {
  const { teamId, teamName, sessionId, setSessionId } = useGameSession()
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    // Only run when we have both teamId and teamName
    if (!teamId || !teamName) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // 1) Subscribe first
    const channel = supabase
      .channel(`team_session_${teamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams',
          filter: `team_id=eq.${teamId}`,
        },
        payload => {
          const oldId = payload.old.session_id
          const newId = payload.new.session_id
          if (newId && newId !== oldId) {
            setSessionId(newId)
            setLoading(false)
          }
        }
      )
      .subscribe()

    // 2) Then do the initial fetch
    getTeamData(teamId)
      .then(team => {
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

    // Cleanup on unmount or teamId/teamName change
    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId, teamName, setSessionId])

  return { sessionId, loading, error }
}