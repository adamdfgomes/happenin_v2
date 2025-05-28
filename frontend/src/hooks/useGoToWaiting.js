// src/hooks/useGoToWaiting.js
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'

export default function useGoToWaiting() {
  const navigate = useNavigate()
  const { resetSession } = useGameSession()

  return useCallback(() => {
    // 1️⃣ Clear session-specific context (sessionId, startTime, ready flags)
    resetSession()
    // 2️⃣ Navigate back into the queue
    navigate('/waiting')
  }, [resetSession, navigate])
}
