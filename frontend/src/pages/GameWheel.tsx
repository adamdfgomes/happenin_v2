// src/pages/GameWheel.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Wheel from '../components/Wheel'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSessionID from '../hooks/useFetchSessionID'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import Background from '../components/Background';

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
    <Background>
      <Header title="Selecting your game" subtitle="Game time!" />

      <Wheel options={options} onSpinComplete={handleSpinComplete} />
    </Background>
  )
}

export default GameWheel
