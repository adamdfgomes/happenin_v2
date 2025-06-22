// src/hooks/useTTOLWaiting.js
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

/**
 * useTTOLWaiting: subscribes to TTOL answer updates and navigates
 * when both players have submitted, after a 3s delay.
 */
export function useTTOLWaiting() {
  const { sessionId } = useGameSession()
  const navigate = useNavigate()
  const scheduledRef = useRef(false)

  useEffect(() => {
    if (!sessionId) return
    let timeoutId

    const checkComplete = (r) =>
      r.p1_truth1 != null &&
      r.p1_truth2 != null &&
      r.p1_lie    != null &&
      r.p2_truth1 != null &&
      r.p2_truth2 != null &&
      r.p2_lie    != null

    const scheduleNav = () => {
      if (scheduledRef.current) return
      scheduledRef.current = true
      timeoutId = window.setTimeout(() => {
        navigate(`/two-truths-one-lie/${sessionId}/answers`)
      }, 3000)
    }

    // 1) Initial check
    supabase
      .from('two-truths-one-lie')
      .select('p1_truth1,p1_truth2,p1_lie,p2_truth1,p2_truth2,p2_lie')
      .eq('session_id', sessionId)
      .single()
      .then(({ data, error }) => {
        if (!error && data && checkComplete(data)) {
          scheduleNav()
        }
      })

    // 2) Listen for updates
    const channel = supabase
      .channel(`ttol_row_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'two-truths-one-lie',
          filter: `session_id=eq.${sessionId}`,
        },
        ({ new: row }) => {
          if (checkComplete(row)) scheduleNav()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeoutId)
    }
  }, [sessionId, navigate])
}