import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import { postMessage } from '../utils/api'

// Single source of truth for the intro-timer length
const TIME_LIMIT = 30
// Warn when we're in the last third of the time
const WARN_THRESHOLD = Math.ceil(TIME_LIMIT * 0.33)

export default function useIntroMessage() {
  const { sessionId, teamId } = useGameSession()
  const navigate = useNavigate()

  const [message, setMessage]     = useState('')
  const [timeLeft, setTimeLeft]   = useState(TIME_LIMIT)
  const [isTyping, setIsTyping]   = useState(false)
  const [isSending, setIsSending] = useState(false)

  // 1) Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 2) Auto‐send when timer hits zero
  useEffect(() => {
    if (timeLeft > 0 || isSending) return
    setIsSending(true)

    ;(async () => {
      try {
        const row = await postMessage(sessionId, teamId, message)
        // small delay so the user sees the send action
        await new Promise((r) => setTimeout(r, 500))
        navigate(
          `/messagereceive/${sessionId}`,
          { state: { since: row.created_at } }
        )
      } catch (err) {
        console.error('IntroMessage send failed', err)
        navigate(`/messagereceive/${sessionId}`)
      }
    })()
  }, [timeLeft, sessionId, teamId, message, navigate, isSending])

  // textarea change
  function handleChange(e) {
    const v = e.target.value.slice(0, 300)
    setMessage(v)
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000)
  }

  // Progress bar and warning derived from our constants
  const progressPercentage = ((TIME_LIMIT - timeLeft) / TIME_LIMIT) * 100
  const isTimeRunningOut   = timeLeft <= WARN_THRESHOLD

  return {
    message,
    handleChange,
    timeLeft,
    isTyping,
    progressPercentage,
    isTimeRunningOut,
  }
}
