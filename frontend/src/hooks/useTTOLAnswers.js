import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../utils/supabasePublicClient'
import randomizeWheel from '../utils/randomizeWheel'
import { useGameSession } from '../context/GameSessionContext'

/**
 * useTTOLAnswers()
 * Fetches opponent's TTOL responses, shuffles them, and manages selection/submission.
 */
export function useTTOLAnswers() {
  const { sessionId, teamId, player1Id } = useGameSession()
  const navigate = useNavigate()

  const [statements, setStatements] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(null)

  // Load and shuffle statements
  useEffect(() => {
    if (!sessionId) return
    (async () => {
      const { data, error } = await supabase
        .from('two-truths-one-lie')
        .select('p1_truth1,p1_truth2,p1_lie,p2_truth1,p2_truth2,p2_lie')
        .eq('session_id', sessionId)
        .single()
      if (error || !data) {
        console.error('Error loading TTOL answers:', error)
        return
      }
      const amIPlayer1 = teamId === player1Id
      const truths = amIPlayer1
        ? [data.p2_truth1, data.p2_truth2]
        : [data.p1_truth1, data.p1_truth2]
      const lie = amIPlayer1 ? data.p2_lie : data.p1_lie

      const opts = [
        { text: truths[0], isLie: false },
        { text: truths[1], isLie: false },
        { text: lie,        isLie: true  }
      ]

      const shuffled = []
      while (opts.length) {
        const pick = randomizeWheel(opts)
        shuffled.push(pick)
        opts.splice(opts.indexOf(pick), 1)
      }
      setStatements(shuffled)
    })()
  }, [sessionId, teamId, player1Id])

  const handleSelect = useCallback((index) => {
    setSelectedIndex((prev) => (prev === index ? null : index))
  }, [])

  const handleSubmit = useCallback(() => {
    if (selectedIndex === null) return
    const isCorrect = statements[selectedIndex].isLie
    navigate(
      `/two-truths-one-lie/${sessionId}/results`,
      { state: { isCorrect } }
    )
  }, [selectedIndex, statements, sessionId, navigate])

  return {
    statements,
    selectedIndex,
    handleSelect,
    handleSubmit,
  }
}
