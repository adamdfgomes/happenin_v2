// src/pages/TwoTruthsOneLie/TTOLresults.tsx
import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../../components/Header'
import Background from '../../components/Background'
import { useGameSession } from '../../context/GameSessionContext'

interface LocationState {
  isCorrect: boolean
}

const TTOLresults: React.FC = () => {
  const { sessionId } = useGameSession()
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const drumRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { isCorrect } = (useLocation().state as LocationState) || { isCorrect: false }

  // Drumroll audio
  const playDrumroll = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const now = audioRef.current.currentTime
      const osc = audioRef.current.createOscillator()
      const gain = audioRef.current.createGain()
      osc.connect(gain)
      gain.connect(audioRef.current.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05)
      osc.start(now)
      osc.stop(now + 0.05)
    } catch (e) {
      console.error(e)
    }
  }

  // 1) Drumroll + reveal result after 2s
  useEffect(() => {
    const el = drumRef.current
    if (el) el.addEventListener('animationiteration', playDrumroll)

    const reveal = setTimeout(() => {
      setResult(isCorrect ? 'correct' : 'wrong')
      setShowResult(true)
    }, 2000)

    return () => {
      if (el) el.removeEventListener('animationiteration', playDrumroll)
      clearTimeout(reveal)
      if (audioRef.current) audioRef.current.close()
    }
  }, [isCorrect])

  // 2) Once result is shown, wait 2s then navigate to ReadyUp with next: 'message'
  useEffect(() => {
    if (!showResult || !sessionId) return

    const timer = setTimeout(() => {
      navigate(`/readyup/${sessionId}`, { state: { next: 'message' } })
    }, 2000)

    return () => clearTimeout(timer)
  }, [showResult, sessionId, navigate])

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
