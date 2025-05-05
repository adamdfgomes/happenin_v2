// src/pages/Landing.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'

const Landing: React.FC = () => {
  const { player1TeamName, player2TeamName, sessionId } = useGameSession()
  const { loading } = useFetchSelectedGame()
  const navigate = useNavigate()

  // Automatically navigate to the wheel page 5 seconds after data is loaded
  useEffect(() => {
    if (!sessionId || loading) return

    const timer = setTimeout(() => {
      navigate(`/wheel/${sessionId}`)
    }, 5000)

    return () => clearTimeout(timer)
  }, [sessionId, loading, navigate])

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800">We've matched you up!</h1>
      {loading ? (
        <p className="text-xl text-gray-700 mt-4">Loading match details&hellip;</p>
      ) : (
        <p className="text-xl text-gray-700 mt-4">
          {player1TeamName} vs. {player2TeamName}
        </p>
      )}
      {!loading && (
        <p className="text-sm text-gray-500 mt-2">Redirecting to the game wheel in 5 seconds...</p>
      )}
    </main>
  )
}

export default Landing
