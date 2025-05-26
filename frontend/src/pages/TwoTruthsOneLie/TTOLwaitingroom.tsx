// src/pages/TwoTruthsOneLie/TTOLwaitingroom.tsx
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../../utils/supabasePublicClient'
import { useGameSession } from '../../context/GameSessionContext'
import Header from '../../components/Header'
import Background from '../../components/Background'

const TTOLwaitingroom: React.FC = () => {
  const { sessionId } = useGameSession()
  const navigate = useNavigate()
  const scheduledRef = useRef(false)
  let timeoutId: number

  useEffect(() => {
    if (!sessionId) return

    // Are all six fields filled?
    const checkComplete = (r: any) =>
      r.p1_truth1 != null &&
      r.p1_truth2 != null &&
      r.p1_lie    != null &&
      r.p2_truth1 != null &&
      r.p2_truth2 != null &&
      r.p2_lie    != null

    // Start a 2s timer exactly when we first detect "complete"
    const scheduleNav = () => {
      if (scheduledRef.current) return
      scheduledRef.current = true
      timeoutId = window.setTimeout(() => {
        navigate(`/two-truths-one-lie/${sessionId}/answers`)
      }, 2000)
    }

    // 1) Check right away (for player 2 or race‐ahead cases)
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

    // 2) Subscribe for future updates (for player 1)
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
          if (checkComplete(row)) {
            scheduleNav()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      clearTimeout(timeoutId)
    }
  }, [sessionId, navigate])

  return (
    <Background>
      <Header title="Waiting for your competition… hang tight!" />
    </Background>
  )
}

export default TTOLwaitingroom
