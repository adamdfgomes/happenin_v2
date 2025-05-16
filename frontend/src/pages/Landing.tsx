// src/pages/Landing.tsx
import React, { FC, useEffect } from 'react'
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

  // NAVIGATE as soon as both are ready
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
      // optimistic UI update
      if (slot === 1) setPlayer1Ready(true)
      else           setPlayer2Ready(true)
    } catch (err) {
      console.error(err)
    }
  }

  // 1) Loading state → spinner  
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          We've matched you up!
        </h1>
        <div
          className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin"
          aria-label="Loading spinner"
        />
      </main>
    )
  }

  // 2) Error state  
  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <p className="text-red-600">Error loading match details: {error}</p>
      </main>
    )
  }

  // 3) Ready-up state
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
