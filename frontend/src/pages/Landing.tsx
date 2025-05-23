// src/pages/Landing.tsx
import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import Button from '../components/Button'
import { updateSessionReady, rematchTeam } from '../utils/api'

const Landing: FC = () => {
  const { sessionId, player1Id, setPlayer1Ready, setPlayer2Ready } = useGameSession()
  const { loading, error, me, them } = useFetchSelectedGame()
  const navigate = useNavigate()

  // 1) 2-second minimum delay
  const [minDelayPassed, setMinDelayPassed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // 2) 30-second ready timer
  const [readyTimer, setReadyTimer] = useState<number | null>(null)
  useEffect(() => {
    if (!loading && minDelayPassed && sessionId && readyTimer === null) {
      setReadyTimer(30)
    }
  }, [loading, minDelayPassed, sessionId, readyTimer])

  // 3) tick down once per second
  useEffect(() => {
    if (readyTimer == null || readyTimer <= 0) return
    const tick = setTimeout(() => setReadyTimer(r => (r ?? 0) - 1), 1000)
    return () => clearTimeout(tick)
  }, [readyTimer])

  // 4) navigate into the game when both ready
  useEffect(() => {
    if (me.ready && them.ready && sessionId) {
      navigate(`/Wheel/${sessionId}`)
    }
  }, [me.ready, them.ready, sessionId, navigate])

  // 5a) “Too slow!” if you never clicked ready
  const [showMissed, setShowMissed] = useState(false)
  useEffect(() => {
    if (readyTimer !== null && readyTimer <= 0 && !me.ready) {
      setShowMissed(true)
    }
  }, [readyTimer, me.ready])

  // 5b) “Slow match” if you clicked but they didn’t
  const [showSlow, setShowSlow] = useState(false)
  useEffect(() => {
    if (readyTimer !== null && readyTimer <= 0 && me.ready) {
      setShowSlow(true)
      // after at least 3s, only navigate if matched flipped false
      setTimeout(async () => {
        try {
          const team = await rematchTeam(me.id)  // this flips matched:false
          // then send back to waiting
        } catch (err) {
          console.error('Rematch error', err)
        } finally {
          navigate('/waiting')
        }
      }, 3000)
    }
  }, [readyTimer, me.ready, me.id, navigate])

  // 6) handlers
  const handleReady = async () => {
    if (!sessionId) return
    const slot = me.id === player1Id ? 1 : 2
    try {
      await updateSessionReady(sessionId, slot, true)
      if (slot === 1) setPlayer1Ready(true)
      else setPlayer2Ready(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRematch = async () => {
    try {
      await rematchTeam(me.id)
    } catch (err) {
      console.error('Rematch API error', err)
    } finally {
      navigate('/waiting')
    }
  }

  // --- RENDER ---

  // missed ready
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

  // match too slow
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

  // suppress other UI during post-timeout
  if (readyTimer !== null && readyTimer <= 0) {
    return null
  }

  // real fetch error
  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-red-600">Error loading match details: {error}</p>
      </main>
    )
  }

  // waiting for match placeholder
  if (loading || !minDelayPassed) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Loading your session…
        </h1>
        <div
          className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin"
          aria-label="Loading spinner"
        />
      </main>
    )
  }

  // ready-up UI
  return (
    <main className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {readyTimer !== null && (
        <div className="absolute top-4 right-4 bg-white text-gray-800 px-3 py-1 rounded shadow">
          Time left: {readyTimer}s
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Game on!</h1>
      <p className="text-2xl text-gray-900 mb-4">{me.name} vs. {them.name}</p>
      <p className="text-sm text-gray-500 mb-2">Ready up to get going!</p>
      <Button
        onClick={handleReady}
        disabled={me.ready}
        className={me.ready ? 'bg-green-500 hover:bg-green-600' : ''}
      >
        {me.ready ? 'Ready!' : 'Ready Up'}
      </Button>
    </main>
  )
}

export default Landing
