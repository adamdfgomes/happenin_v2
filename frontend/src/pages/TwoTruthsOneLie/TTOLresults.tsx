import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import supabase from '../../utils/supabasePublicClient'
import Header from '../../components/Header'
import { useGameSession } from '../../context/GameSessionContext'
import { updateTTOLReady } from '../../utils/api'

interface LocationState {
  isCorrect: boolean
}

const TTOLresults: React.FC = () => {
  const { sessionId, teamId, player1Id } = useGameSession()
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<'correct'|'wrong'|null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const audioRef = useRef<AudioContext|null>(null)
  const drumRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { isCorrect } = (useLocation().state as LocationState) || { isCorrect: false }

  // Drumroll audio
  const playDrumroll = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext||(window as any).webkitAudioContext)()
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

  // 2) Subscribe to “both ready” once result is shown
  useEffect(() => {
    if (!showResult || !sessionId) return
    const chan = supabase
      .channel(`ttol_ready_${sessionId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'two-truths-one-lie',          // ← correct table name
        filter: `session_id=eq.${sessionId}`,
      }, ({ new: row }) => {
        if (row.player1_ready && row.player2_ready) {
          // leave a 2s buffer so both see the outcome
          setTimeout(() => {
            navigate(`/message/${sessionId}`)
          }, 2000)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(chan)
    }
  }, [showResult, sessionId, navigate])

  // 3) Handler flips your own ready flag
  const handleFeedback = async () => {
    if (!sessionId || !teamId) return
    setFeedbackSent(true)
    const slot = teamId === player1Id ? 1 : 2
    try {
      await updateTTOLReady(sessionId, slot, true)
    } catch (err) {
      console.error('Failed to set ready:', err)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="The moment of truth..." />

      <div className="mt-8 text-center">
        { !showResult ? (
          <div
            ref={drumRef}
            className="text-4xl animate-bounce"
            style={{ animationDuration:'0.1s', animationTimingFunction:'linear' }}
          >
            🥁 Drumroll please... 🥁
          </div>
        ) : (
          <>
            <div className="text-4xl font-bold">
              {result === 'correct'
                ? <span className="text-green-400">Correct – you’re a perfect match! 💫</span>
                : <span className="text-red-400">Wrong – better luck next time! 🤦‍♂️</span>
              }
            </div>
            <button
              onClick={handleFeedback}
              disabled={feedbackSent}
              className={`mt-6 px-6 py-3 rounded-lg text-white transition ${
                feedbackSent
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {feedbackSent ? 'Waiting for other team…' : 'Let’s give some feedback'}
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default TTOLresults
