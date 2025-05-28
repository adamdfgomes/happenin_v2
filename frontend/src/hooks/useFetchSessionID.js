// src/hooks/useFetchSessionID.js
import { useState, useEffect } from 'react'
import { getTeamData } from '../utils/api'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

export default function useFetchSessionID() {
  // pull in both the current sessionId *and* the setter
  const { teamId, sessionId, setSessionId } = useGameSession()
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!teamId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    // 1️⃣ Initial fetch
    getTeamData(teamId)
      .then(team => {
        if (team.matched && team.session_id) {
          setSessionId(team.session_id)
        }
      })
      .catch(err => {
        setError(err.message || 'Fetch failed')
      })
      .finally(() => {
        setLoading(false)
      })

    // 2️⃣ REAL‐TIME via dedicated channel (Supabase JS v2)
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
        ({ new: row }) => {
          if (row.matched && row.session_id) {
            setSessionId(row.session_id)
            setLoading(false)
          }
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIPTION_ERROR') {
          setError('Realtime subscription failed')
        }
      })

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [teamId, setSessionId])

  // return the *same* sessionId you pulled in above
  return { sessionId, loading, error }
}
