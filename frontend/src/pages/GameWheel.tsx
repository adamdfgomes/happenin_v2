// src/pages/GameWheel.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Wheel from '../components/Wheel'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSessionID from '../hooks/useFetchSessionID'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'

const GameWheel: React.FC = () => {
  useFetchSessionID()
  useFetchSelectedGame()

  const { sessionId, selectedGame } = useGameSession()
  const nav = useNavigate()

  const options = ['trivia', 'two-truths-one-lie', 'drawing']

  // Only navigate _after_ the wheel tells us it’s done
  const handleSpinComplete = React.useCallback(() => {
    if (selectedGame && sessionId) {
      // Wait 2s, then navigate
      setTimeout(() => {
        nav(`/${selectedGame}/${sessionId}`)
      }, 3000)
    }
  }, [nav, selectedGame, sessionId])

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="Selecting your game" subtitle="Game time!" />

      <Wheel options={options} onSpinComplete={handleSpinComplete} />
    </main>
  )
}

export default GameWheel