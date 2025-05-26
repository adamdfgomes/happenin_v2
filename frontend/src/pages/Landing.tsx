import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import supabase from '../utils/supabasePublicClient'   // ← add this
import Button from '../components/Button'
import { updateSessionReady } from '../utils/api'     // note: rematchTeam is removed
import Background from '../components/Background';

const Landing: FC = () => {
  const {
    sessionId,
    player1Id,
    setSessionId,      // ← now available
    setSelectedGame,   // ← now available
    setPlayer1Ready,
    setPlayer2Ready,
  } = useGameSession()

  const { loading, error, me, them } = useFetchSelectedGame()
  const navigate = useNavigate()

  // treat expired-session error as “go back”
  useEffect(() => {
    if (error?.includes('JSON object requested')) {
      navigate('/waiting')
    }
  }, [error, navigate])

  // min-delay, timer, ready logic (unchanged)…
  const [minDelayPassed, setMinDelayPassed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 2000)
    return () => clearTimeout(t)
  }, [])

  const [readyTimer, setReadyTimer] = useState<number | null>(null)
  useEffect(() => {
    if (!loading && minDelayPassed && sessionId && readyTimer === null) {
      setReadyTimer(30)
    }
  }, [loading, minDelayPassed, sessionId, readyTimer])

  useEffect(() => {
    if (readyTimer == null || readyTimer <= 0) return
    const tick = setTimeout(() => setReadyTimer(r => (r ?? 0) - 1), 1000)
    return () => clearTimeout(tick)
  }, [readyTimer])

  useEffect(() => {
    if (me.ready && them.ready && sessionId) {
      navigate(`/Wheel/${sessionId}`)
    }
  }, [me.ready, them.ready, sessionId, navigate])

  // missed-ready UI
  const [showMissed, setShowMissed] = useState(false)
  useEffect(() => {
    if (readyTimer !== null && readyTimer <= 0 && !me.ready) {
      setShowMissed(true)
    }
  }, [readyTimer, me.ready])

  // slow-match UI
  const [showSlow, setShowSlow] = useState(false)
  useEffect(() => {
    if (readyTimer !== null && readyTimer <= 0 && me.ready) {
      setShowSlow(true)
      setTimeout(async () => {
        await handleRematch()     // ← reuse our new handler
      }, 3000)
    }
  }, [readyTimer, me.ready])

  // --- handlers ---
  const handleReady = async () => {
    if (!sessionId) return
    const slot = me.id === player1Id ? 1 : 2
    try {
      await updateSessionReady(sessionId, slot, true)
      slot === 1 ? setPlayer1Ready(true) : setPlayer2Ready(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRematch = async () => {
    try {
      // 1) Clear all leftover session data on your team row
      await supabase
        .from('teams')
        .update({
          matched:    false,
          session_id: null,
          matched_id: null
        })
        .eq('team_id', me.id)

      // 2) Reset all local context
      setSessionId(null)
      setSelectedGame(null)
      setPlayer1Ready(false)
      setPlayer2Ready(false)
    } catch (err) {
      console.error('Rematch error', err)
    } finally {
      navigate('/waiting')
    }
  }

  // ---- RENDER ----

  if (error?.includes('JSON object requested')) return null

  if (showMissed) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Too slow!</h1>
        <p className="text-gray-600 mb-4">You missed your chance to ready up.</p>
        <Button onClick={handleRematch} className="bg-blue-500 hover:bg-blue-600">
          Rematch
        </Button>
      </main>
    )
  }

  if (showSlow) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Your match is too slow…
          </h1>
          <p className="text-gray-600 mb-4">Let’s find you a new one!</p>
        </div>
      </main>
    )
  }

  if (readyTimer !== null && readyTimer <= 0) {
    return null
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-red-600">Error loading match details: {error}</p>
      </main>
    )
  }

  if (loading || !minDelayPassed) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Waiting for a match…</h1>
        <div
          className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin"
          aria-label="Loading spinner"
        />
      </main>
    )
  }

  return (
    <Background>
      {readyTimer !== null && (
        <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded shadow">
          Time left: {readyTimer}s
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Game on!</h1>
      <p className="text-2xl text-gray-900 mb-4">
        {me.name} vs. {them.name}
      </p>
      <p className="text-sm text-gray-500 mb-2">Ready up to get going!</p>
      <Button
        onClick={handleReady}
        disabled={me.ready}
        className={me.ready ? 'bg-green-500 hover:bg-green-600' : ''}
      >
        {me.ready ? 'Ready!' : 'Ready Up'}
      </Button>
    </Background>
  )
}

export default Landing
