// src/pages/Landing.tsx
import React, { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import Button from '../components/Button'
import { updateSessionReady } from '../utils/api'

const Landing: FC = () => {
  const {
    teamId,
    player1Id,
    player2Id,
    player1TeamName,
    player2TeamName,
    sessionId,
    player1Ready,
    player2Ready,
  } = useGameSession()

  const { loading, error } = useFetchSelectedGame()
  const navigate = useNavigate()

  const [minimumElapsed, setMinimumElapsed] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumElapsed(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const [ready, setReady] = useState(false)
  const isReadyUpSectionVisible =
    !loading &&
    Boolean(player1TeamName) &&
    Boolean(player2TeamName) &&
    minimumElapsed

  const amIPlayer1 = teamId === player1Id
  const playerSlot = amIPlayer1 ? 1 : 2

  const handleReady = async () => {
    if (!sessionId) return
    try {
      await updateSessionReady(sessionId, playerSlot, true)
      setReady(true)
    } catch (e) {
      console.error(e)
    }
  }

  // NAVIGATE as soon as both players are ready
  useEffect(() => {
    if (player1Ready && player2Ready && sessionId) {
      navigate(`/Wheel/${sessionId}`)
    }
  }, [player1Ready, player2Ready, sessionId, navigate])

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        {isReadyUpSectionVisible ? 'Game on!' : "We've matched you up!"}
      </h1>

      {error && (
        <p className="text-red-600 mt-2">Error loading match details: {error}</p>
      )}

      {!isReadyUpSectionVisible && !error && (
        <p className="text-xl text-gray-700 mb-4">Loading match details…</p>
      )}

      {isReadyUpSectionVisible && (
        <>
          <p className="text-2xl text-gray-900 mb-4">
            {player1TeamName} vs. {player2TeamName}
          </p>

          <p className="text-sm text-gray-500 mb-2">Ready up to get going!</p>

          <Button
            onClick={handleReady}
            disabled={ready}
            className={ready ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {ready ? 'Ready!' : 'Ready Up'}
          </Button>
        </>
      )}
    </main>
  )
}

export default Landing
