import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { useGameSession } from '../../context/GameSessionContext'
import useFetchSessionID from '../../hooks/useFetchSessionID'
import Background from '../../components/Background';

const WaitingRoom: React.FC = () => {
  const {
    startTime,
    sessionId,      // from context
    setSessionId,   // setter in context
  } = useGameSession()


  // Now use your existing hook to expose sessionId
  const {
    loading: sessionLoading,
    error: sessionError,
  } = useFetchSessionID()

  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [invalidStartTime, setInvalidStartTime] = useState(false)
  const navigate = useNavigate()
  const intervalRef = useRef<number | null>(null)

  // Countdown till pub’s start time…
  useEffect(() => {
    if (!startTime) return

    const startDate = new Date(startTime)
    if (isNaN(startDate.getTime())) {
      setInvalidStartTime(true)
      return
    }

    const tick = () => {
      const diff = startDate.getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft(0)
        clearInterval(intervalRef.current!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
        intervalRef.current = null
      } else {
        setTimeLeft(diff)
      }
    }

    tick()
    intervalRef.current = window.setInterval(tick, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [startTime])

  // Redirect effect: only when countdown hits zero AND we have a NEW sessionId
  useEffect(() => {
    if (timeLeft === 0 && sessionId) {
      navigate(`/landing/${sessionId}`, { state: { next: 'message' } })
    }
  }, [timeLeft, sessionId, navigate])

  // If supabase says the row has been deleted / error → go home
  useEffect(() => {
    if (sessionError) {
      console.warn('Session removed, returning to lobby')
      navigate('/')
    }
  }, [sessionError, navigate])

  // --- UI below ---
  if (sessionError) return null

  if (!startTime || invalidStartTime) {
    return (
      <main className="min-h-screen bg-red-900 flex flex-col items-center justify-center text-white p-4">
        <Header title="Error" />
        <p className="mt-6 text-xl text-red-300">
          Invalid or missing start time. Please try again later.
        </p>
      </main>
    )
  }

  const formatTime = (ms: number) => {
    const hrs = Math.floor(ms / 3_600_000)
    const mins = Math.floor((ms % 3_600_000) / 60_000)
    const secs = Math.floor((ms % 60_000) / 1000)
    return `${hrs.toString().padStart(2, '0')}:` +
           `${mins.toString().padStart(2, '0')}:` +
           `${secs.toString().padStart(2, '0')}`
  }

  return (
    <Background>
      <Header title="Hold Tight!" />
      <div className="mt-10 flex flex-col items-center gap-6">
        <div className="text-5xl font-mono tracking-widest">
          {timeLeft == null
            ? 'Loading...'
            : timeLeft > 0
            ? formatTime(timeLeft)
            : sessionId
            ? 'Game starting now!'
            : 'Waiting for a match...'}
        </div>
        <p className="text-xl font-semibold text-center">
          {timeLeft == null
            ? ''
            : timeLeft > 0
            ? 'Waiting for the games to begin'
            : sessionId
            ? 'Get ready for the game!'
            : 'We’ll redirect as soon as a match is found.'}
        </p>
      </div>
    </Background>
  )
}

export default WaitingRoom
