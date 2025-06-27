// src/hooks/useLandingLogic.js
import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateSessionReady } from '../utils/api'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from './useFetchSelectedGame'
import useGoToWaiting from './useGoToWaiting'

export default function useLandingLogic(
  routeBase = 'Wheel',
  { noCountdown = false } = {}
) {
  const navigate = useNavigate()
  const goToWaiting = useGoToWaiting()

  const {
    teamId,
    sessionId,
    player1Id,
    setPlayer1Ready,
    setPlayer2Ready,
    setSelectedGame,
  } = useGameSession()

  // 1️⃣ fetch hook
  const { loading, error, me, them } = useFetchSelectedGame()

  // 2️⃣ always wait at least 1s before doing any bounce logic
  const [minDelayPassed, setMinDelayPassed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // 3️⃣ only redirect _back_ to Waiting **after**:
  //   • that 1s has passed
  //   • we once had real players (so we don’t bounce on the initial miss)
  //   • AND the session truly disappeared or errored
  const hasPlayers = Boolean(me?.id) && Boolean(them?.id)
  useEffect(() => {
    if (
      minDelayPassed &&
      !loading &&
      hasPlayers &&
      (error?.includes('Session not found') ||
        error?.includes('JSON object requested'))
    ) {
      goToWaiting()
    }
  }, [minDelayPassed, loading, hasPlayers, error, goToWaiting])

  // 4️⃣ only start the 30s ready-timer _once_ we have both players
  const [readyTimer, setReadyTimer] = useState(null)
  useEffect(() => {
    if (
      !noCountdown &&
      !loading &&
      minDelayPassed &&
      sessionId &&
      readyTimer === null &&
      hasPlayers
    ) {
      setReadyTimer(30)
    }
  }, [
    noCountdown,
    loading,
    minDelayPassed,
    sessionId,
    readyTimer,
    hasPlayers,
  ])

  // 4️⃣a countdown tick
  useEffect(() => {
    if (noCountdown) return
    if (readyTimer === null || readyTimer <= 0) return

    const t = setTimeout(() => {
      setReadyTimer((p) => (p !== null ? p - 1 : null))
    }, 1000)
    return () => clearTimeout(t)
  }, [readyTimer, noCountdown])

  // 5️⃣ once both readied up → set in_session=true then navigate
  const didNavigate = useRef(false)
  useEffect(() => {
    if (loading) return
    if (!didNavigate.current && me?.ready && them?.ready && sessionId) {
      didNavigate.current = true
      if (!noCountdown) {
        ;(async () => {
          try {
            await fetch(`/api/sessions/${sessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ in_session: true }),
            })
            // small cushion
            await new Promise((r) => setTimeout(r, 500))
          } catch (err) {
            console.error('[useLandingLogic] set in_session:', err)
          } finally {
            navigate(`/${routeBase}/${sessionId}`)
          }
        })()
      } else {
        navigate(`/${routeBase}/${sessionId}`)
      }
    }
  }, [loading, me?.ready, them?.ready, sessionId, navigate, routeBase, noCountdown])

  // 6️⃣ opponent too slow → splash + back to waiting
  const [showOpponentSlow, setShowOpponentSlow] = useState(false)
  useEffect(() => {
    if (
      !noCountdown &&
      readyTimer === 0 &&
      me?.ready &&
      !them?.ready
    ) {
      setShowOpponentSlow(true)
      setTimeout(goToWaiting, 3000)
    }
  }, [readyTimer, me?.ready, them?.ready, noCountdown, goToWaiting])

  // 7️⃣ missed UI
  const [showMissed, setShowMissed] = useState(false)
  useEffect(() => {
    if (!noCountdown && readyTimer === 0 && !me?.ready) {
      setShowMissed(true)
    }
  }, [readyTimer, me?.ready, noCountdown])

  // 8️⃣ handleReady
  const handleReady = useCallback(async () => {
    if (!sessionId) return
    const slot = me?.id === player1Id ? 1 : 2
    try {
      await updateSessionReady(sessionId, slot, true)
      slot === 1 ? setPlayer1Ready(true) : setPlayer2Ready(true)
    } catch (err) {
      console.error('[useLandingLogic] ready error:', err)
    }
  }, [sessionId, me?.id, player1Id, setPlayer1Ready, setPlayer2Ready])

  // 9️⃣ rematch
  const handleRematch = useCallback(async () => {
    if (!teamId) return
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matched: false, session_id: null }),
      })
    } catch (err) {
      console.error('[useLandingLogic] rematch error:', err)
    }
    setSelectedGame(null)
    setPlayer1Ready(false)
    setPlayer2Ready(false)
    goToWaiting()
  }, [teamId, setSelectedGame, setPlayer1Ready, setPlayer2Ready, goToWaiting])

  return {
    loading,
    error,
    minDelayPassed,
    readyTimer: noCountdown ? null : readyTimer,
    meName: me?.name,
    themName: them?.name,
    meReady: me?.ready,
    showOpponentSlow,
    showMissed,
    handleReady,
    handleRematch,
  }
}