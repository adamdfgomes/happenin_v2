// src/pages/GameWheel.tsx
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Wheel from '../components/Wheel'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSessionID from '../hooks/useFetchSessionID'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import Background from '../components/Background'

const GameWheel: React.FC = () => {
  const navigate = useNavigate()

  // Hooks always in same order
  const { sessionId, loading: loadingSessionId } = useFetchSessionID()
  const { loading: loadingGame, error, me, them } = useFetchSelectedGame()
  const { selectedGame } = useGameSession()

  // Handler hook moved above conditional
  const handleSpinComplete = useCallback(() => {
    // give user time to see final highlight/pulse
    setTimeout(() => {
      navigate(`/${selectedGame}/${sessionId}`)
    }, 2000)
  }, [navigate, selectedGame, sessionId])

  // Loading guard
  if (loadingSessionId || loadingGame || !sessionId || !selectedGame) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <Background>
      <Header title="Selecting your game" subtitle="Game time!" />
      <Wheel options={['trivia', 'two-truths-one-lie', 'drawing']} onSpinComplete={handleSpinComplete} />
    </Background>
  )
}

export default GameWheel
