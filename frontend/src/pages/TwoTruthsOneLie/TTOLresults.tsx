import React from 'react'
import Header from '../../components/Header'
import Background from '../../components/Background'
import { useTTOLResults } from '../../hooks/useTTOLResults'

const TTOLresults: React.FC = () => {
  const { showResult, result, drumRef } = useTTOLResults()

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="The moment of truth..." />

      <div className="mt-8 text-center">
        {!showResult ? (
          <div
            ref={drumRef}
            className="text-4xl animate-bounce"
            style={{ animationDuration: '0.1s', animationTimingFunction: 'linear' }}
          >
            🥁 Drumroll please... 🥁
          </div>
        ) : (
          <div className="text-4xl font-bold">
            {result === 'correct' ? (
              <span className="text-green-400">Correct – you’re a perfect match! 💫</span>
            ) : (
              <span className="text-red-400">Wrong – better luck next time! 🤦‍♂️</span>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default TTOLresults
