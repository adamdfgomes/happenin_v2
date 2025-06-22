import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import { postMessage } from '../utils/api'

export default function useIntroMessage() {
  const { sessionId, teamId } = useGameSession()
  const navigate = useNavigate()

  const [message, setMessage] = useState('')
  const [timeLeft, setTimeLeft] = useState(30)
  const [isTyping, setIsTyping] = useState(false)
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

  const progressPercentage = ((30 - timeLeft) / 30) * 100
  const isTimeRunningOut = timeLeft <= 10

  return {
    message,
    handleChange,
    timeLeft,
    isTyping,
    progressPercentage,
    isTimeRunningOut,
  }
}
