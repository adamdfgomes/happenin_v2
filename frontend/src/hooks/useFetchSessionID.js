// src/hooks/useFetchSessionID.js
import { useState, useEffect, useRef } from 'react'
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
  const [error, setError] = useState(null)

  // Ref for debounce timer
  const debounceRef = useRef(null)

  useEffect(() => {
    // Only run when we have both teamId and teamName
    if (!teamId || !teamName) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Function to apply the session_id update
    const applySessionUpdate = (newId) => {
      setSessionId(newId)
      setLoading(false)
    }

    // Debounced handler for real-time updates
    const debouncedHandler = (payload) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const oldId = payload.old.session_id
        const newId = payload.new.session_id
        if (newId && newId !== oldId) {
          applySessionUpdate(newId)
        }
      }, 50)
    }

    // 1) Subscribe to realtime updates on this team row FIRST
    const channel = supabase
      .channel(`team_session_${teamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams',
          filter: `team_id=eq.${teamId}`
        },
        debouncedHandler
      )
      .subscribe()

    // 2) Then do the initial fetch via API
    getTeamData(teamId)
      .then(team => {
        if (team.session_id) {
          applySessionUpdate(team.session_id)
        }
      })
      .catch(err => {
        setError(err.message || 'Fetch failed')
        setLoading(false)
      })

    // Cleanup on unmount or dependency change
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (channel) supabase.removeChannel(channel)
    }
  }, [teamId, teamName, setSessionId])

  return { sessionId, loading, error }
}
