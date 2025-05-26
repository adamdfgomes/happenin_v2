import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../../components/Header'
import Button from '../../components/Button'
import { useGameSession } from '../../context/GameSessionContext'

// Define the expected location state
interface LocationState {
  isCorrect: boolean
}

const TTOLresults: React.FC = () => {
  const { sessionId } = useGameSession()
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showFeedbackButton, setShowFeedbackButton] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const drumrollRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Read correctness from navigation state
  const { isCorrect } = (location.state as LocationState) || { isCorrect: false }

  const playDrumroll = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const now = audioContextRef.current.currentTime
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(200, now)
      oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05)

      gainNode.gain.setValueAtTime(0.2, now)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05)

      oscillator.start(now)
      oscillator.stop(now + 0.05)
    } catch (error) {
      console.error('Error playing sound:', error)
    }
  }

  useEffect(() => {
    const drumrollElement = drumrollRef.current
    if (drumrollElement) {
      drumrollElement.addEventListener('animationiteration', playDrumroll)
    }

    // After 2 seconds, reveal the result based on isCorrect
    const revealTimer = setTimeout(() => {
      setResult(isCorrect ? 'correct' : 'wrong')
      setShowResult(true)
      // After 1 more second, show the feedback button
      setTimeout(() => {
        setShowFeedbackButton(true)
      }, 1000)
    }, 2000)

    return () => {
      if (drumrollElement) {
        drumrollElement.removeEventListener('animationiteration', playDrumroll)
      }
      clearTimeout(revealTimer)
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [isCorrect])

  const handleFeedbackClick = () => {
    navigate(`/message/${sessionId}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="The moment of truth..." />
      <div className="mt-8 text-center">
        {!showResult ? (
          <div
            ref={drumrollRef}
            className="text-4xl animate-bounce"
            style={{ animationDuration: '0.1s', animationTimingFunction: 'linear' }}
          >
            🥁 Drumroll please... 🥁
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className={`text-4xl font-bold transition-opacity duration-500 ${showResult ? 'opacity-100' : 'opacity-0'}`}>  
              {result === 'correct' ? (
                <div className="text-green-400">
                  Correct - you lot are destined for each other! 💫
                </div>
              ) : (
                <div className="text-red-400">
                  Wrong - you stiff idiot! 🤦‍♂️
                </div>
              )}
            </div>
            {showFeedbackButton && (
              <Button onClick={handleFeedbackClick} className="mt-4">
                Give them some feedback
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default TTOLresults
