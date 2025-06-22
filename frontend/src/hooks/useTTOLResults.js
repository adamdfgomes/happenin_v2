import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'

/**
 * useTTOLResults()
 * Manages the reveal animation, drumroll, and navigation for the TTOL results page.
 */
export function useTTOLResults() {
  const { sessionId } = useGameSession()
  const { state } = useLocation()
  const { isCorrect = false } = state || {}
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState(null)
  const drumRef = useRef(null)
  const audioRef = useRef(null)
  const navigate = useNavigate()

  // Play a short drumroll using Web Audio API
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

  // 1️⃣ Drumroll + reveal after 2s
  useEffect(() => {
    const el = drumRef.current
    if (el) el.addEventListener('animationiteration', playDrumroll)
    const revealTimeout = setTimeout(() => {
      setResult(isCorrect ? 'correct' : 'wrong')
      setShowResult(true)
    }, 2000)
    return () => {
      if (el) el.removeEventListener('animationiteration', playDrumroll)
      clearTimeout(revealTimeout)
      if (audioRef.current) audioRef.current.close()
    }
  }, [isCorrect])

  // 2️⃣ Navigate to ReadyUp after another 2s
  useEffect(() => {
    if (!showResult || !sessionId) return
    const navTimeout = setTimeout(() => {
      navigate(`/readyup/${sessionId}`, { state: { next: 'message' } })
    }, 2000)
    return () => clearTimeout(navTimeout)
  }, [showResult, sessionId, navigate])

  return { showResult, result, drumRef }
}
