// src/pages/Matchmaking/WaitingRoom.tsx
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header'
import { useGameSession } from '../../context/GameSessionContext'
import useFetchSessionID from '../../hooks/useFetchSessionID'
import useFetchSelectedGame from '../../hooks/useFetchSelectedGame'
import Background from '../../components/Background'

const WaitingRoom: React.FC = () => {
  const { startTime } = useGameSession()

  // 1️⃣ find our sessionId
  const {
    sessionId,
    loading: sessionLoading,
    error:   sessionError,
  } = useFetchSessionID()

  // 2️⃣ load that session record
  const {
    loading: sessionRecLoading,
    error:   sessionRecError,
    me:      sessionMe,
    them:    sessionThem,
  } = useFetchSelectedGame()

  // ▶️ only “loaded” once sessionId + both loads done + both IDs & names exist
  const sessionRecordLoaded =
    Boolean(sessionId) &&
    !sessionLoading &&
    !sessionRecLoading &&
    !sessionRecError &&
    Boolean(sessionMe?.id) &&
    Boolean(sessionThem?.id) &&
    Boolean(sessionMe?.name) &&
    Boolean(sessionThem?.name)

  // … rest of your countdown & redirect logic unchanged …
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [invalidStartTime, setInvalidStartTime] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const navigate = useNavigate()
  const didRedirect = useRef(false)

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
        clearInterval(intervalRef.current!)
        intervalRef.current = null
      } else {
        setTimeLeft(diff)
      }
    }
    tick()
    intervalRef.current = window.setInterval(tick, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [startTime])

  useEffect(() => {
    if (
      !didRedirect.current &&
      timeLeft === 0 &&
      sessionRecordLoaded
    ) {
      didRedirect.current = true
      navigate(`/landing/${sessionId}`, {
        replace: true,
        state: { next: 'message' },
      })
    }
  }, [timeLeft, sessionRecordLoaded, sessionId, navigate])

  useEffect(() => {
    if (sessionError) {
      navigate('/')
    }
  }, [sessionError, navigate])

  // …UI unchanged…
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
  // formatTime & return JSX…
  const formatTime = (ms: number) => {
    const hrs  = Math.floor(ms / 3_600_000)
    const mins = Math.floor((ms % 3_600_000) / 60_000)
    const secs = Math.floor((ms % 60_000) / 1000)
    return `${hrs.toString().padStart(2,'0')}:` +
           `${mins.toString().padStart(2,'0')}:` +
           `${secs.toString().padStart(2,'0')}`
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
