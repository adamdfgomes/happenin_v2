import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import { postTTOLAnswers } from '../utils/api'

/**
 * Hook to manage Two Truths One Lie answer submission.
 * Returns current labels, whether all have been edited, and handlers.
 */
export function useTwoTruthsOneLie() {
  const { sessionId, teamId, player1Id } = useGameSession()
  const navigate = useNavigate()

  const initialLabels = ['Enter a truth', 'Enter a lie', 'Enter a truth']
  const [labels, setLabels] = useState([...initialLabels])

  const handleLabelChange = useCallback((index, value) => {
    setLabels((prev) => {
      const next = [...prev]
      next[index] = value.trim() || initialLabels[index]
      return next
    })
  }, [])

  const allEdited = labels.every(
    (label, i) => label !== initialLabels[i] && label.trim().length > 0
  )

  const handleSubmit = useCallback(async () => {
    if (!sessionId) {
      console.error('No session ID')
      return
    }

    const amIPlayer1 = teamId === player1Id
    const answers = amIPlayer1
      ? {
          p1_truth1: labels[0],
          p1_lie: labels[1],
          p1_truth2: labels[2],
        }
      : {
          p2_truth1: labels[0],
          p2_lie: labels[1],
          p2_truth2: labels[2],
        }

    try {
      await postTTOLAnswers(sessionId, answers)
      navigate(
        `/two-truths-one-lie/${sessionId}/waiting`,
        { state: { justSubmitted: true } }
      )
    } catch (err) {
      console.error('Failed saving your answers:', err)
    }
  }, [sessionId, teamId, player1Id, labels, navigate])

  return {
    labels,
    handleLabelChange,
    allEdited,
    handleSubmit,
  }
}
