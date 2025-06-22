// src/hooks/useTTOLResults.js
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import { incrementSessionScore, setGameEndFlag } from '../utils/api'

export function useTTOLResults() {
  const { sessionId, teamId, player1Id } = useGameSession()
  const { state } = useLocation()
  const { isCorrect = false } = state || {}

  // control whether we show the result animation
  const [showResult, setShowResult] = useState(false)
  // "correct" or "wrong" once revealed
  const [result, setResult] = useState(null)

  // refs for drumroll animation
  const drumRef = useRef(null)
  const audioRef = useRef(null)
  const navigate = useNavigate()

  // Play a short drumroll using the Web Audio API
  const playDrumroll = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new (window.AudioContext || window.webkitAudioContext)()
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
      console.error('Drumroll failed', e)
    }
  }

  // 1️⃣ Drumroll listener + reveal after 2s
  useEffect(() => {
    const el = drumRef.current
    if (el) el.addEventListener('animationiteration', playDrumroll)
    const timer = setTimeout(() => {
      setResult(isCorrect ? 'correct' : 'wrong')
      setShowResult(true)
    }, 2000)
    return () => {
      if (el) el.removeEventListener('animationiteration', playDrumroll)
      clearTimeout(timer)
      audioRef.current?.close()
    }
  }, [isCorrect])

  // 2️⃣ Once revealed, always set the TTOL-end flag, then optionally bump the score, then navigate
  useEffect(() => {
    if (!showResult || !sessionId) return
    const timer = setTimeout(async () => {
      const slot = teamId === player1Id ? 1 : 2
      try {
        // mark this round ended for me (regardless of correct/wrong)
        await setGameEndFlag(sessionId, slot)
        // only increment score when they guessed correctly
        if (isCorrect) {
          await incrementSessionScore(sessionId, slot)
        }
      } catch (err) {
        console.error('Post-TTOL update failed', err)
      } finally {
        navigate(`/score/${sessionId}`, { state: { next: 'chat' } })
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [showResult, isCorrect, sessionId, teamId, player1Id, navigate])

  return { showResult, result, drumRef }
}
