// src/pages/Landing.tsx
import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import Button from '../components/Button'
import { updateSessionReady } from '../utils/api'

const Landing: FC = () => {
  const {
    sessionId,
    player1Id,
    setPlayer1Ready,
    setPlayer2Ready,
  } = useGameSession()
  const { loading, error, me, them } = useFetchSelectedGame()
  const navigate = useNavigate()

  // 2 second minimum delay
  const [minDelayPassed, setMinDelayPassed] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setMinDelayPassed(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Once both are ready, navigate to the game
  useEffect(() => {
    if (me.ready && them.ready && sessionId) {
      navigate(`/Wheel/${sessionId}`)
    }
  }, [me.ready, them.ready, sessionId, navigate])

  const handleReady = async () => {
    if (!sessionId) return
    const slot = me.id === player1Id ? 1 : 2
    try {
      await updateSessionReady(sessionId, slot, true)
      if (slot === 1) setPlayer1Ready(true)
      else           setPlayer2Ready(true)
    } catch (err) {
      console.error(err)
    }
  }

  // 1) If there was an error fetching match → show error immediately
  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-red-600">Error loading match details: {error}</p>
      </main>
    )
  }

  // 2) Waiting-for-match page: until BOTH loading is false AND 2 seconds have passed
  if (loading || !minDelayPassed) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Waiting for a match…
        </h1>
        <div
          className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin"
          aria-label="Loading spinner"
        />
      </main>
    )
  }

  // 3) Ready-up state (we have a session and the minimum delay is over)
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
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
    </main>
  )
}

export default Landing
