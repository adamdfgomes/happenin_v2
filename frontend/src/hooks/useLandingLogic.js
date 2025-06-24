// src/hooks/useLandingLogic.js
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateSessionReady } from '../utils/api'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from './useFetchSelectedGame'
import useGoToWaiting from './useGoToWaiting'

/**
 * useLandingLogic(routeBase, options)
 *
 * This hook only ever watches/updates the `player1_ready` and `player2_ready`
 * columns in the **sessions** table. It does not touch the TTOL table.
 *
 * Additionally, if both players become ready _and_ noCountdown is false,
 * it will set `in_session = true` on the sessions row before navigating away.
 *
 * @param routeBase        The path segment to navigate to once both players are ready.
 *                         e.g. "Wheel" → navigate("/Wheel/:sessionId")
 *                              "Message" → navigate("/Message/:sessionId")
 * @param options.noCountdown  If true, skip the 30s timer, “too slow/missed” logic,
 *                             and skip writing `in_session = true` when both are ready.
 */
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

  // `me` and `them` come from GET /api/sessions/:sessionId
  const { loading, error, me, them } = useFetchSelectedGame()

  // 0️⃣ If the session record disappears or returns “not found,” send back to /waiting
  useEffect(() => {
    if (
      error?.includes('Session not found') ||
      error?.includes('JSON object requested')
    ) {
      goToWaiting()
    }
  }, [error, goToWaiting])

  // 1️⃣ Always keep a 1 s “splash” delay before starting any timer (even if noCountdown)
  const [minDelayPassed, setMinDelayPassed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 1000)
    return () => clearTimeout(t)
  }, [])

  // 2️⃣ If noCountdown=false, start a 30 s countdown once “loading” & “splash” have both finished.
  const [readyTimer, setReadyTimer] = useState(null)
  useEffect(() => {
    if (
      !noCountdown &&
      !loading &&
      minDelayPassed &&
      sessionId &&
      readyTimer === null
    ) {
      setReadyTimer(30)
    }
  }, [loading, minDelayPassed, sessionId, readyTimer, noCountdown])

  // 2️⃣a. Countdown tick (skip if noCountdown)
  useEffect(() => {
    if (noCountdown) return
    if (readyTimer === null || readyTimer <= 0) return

    const t = setTimeout(() => {
      setReadyTimer((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => clearTimeout(t)
  }, [readyTimer, noCountdown])

  // 3️⃣ As soon as both `me.ready` and `them.ready` are true →
  //    if noCountdown === false, first write `in_session = true`, then navigate
  useEffect(() => {
    // 1) don’t do anything until the initial fetch/subscription is finished
    if (loading) return
    if (me?.ready && them?.ready && sessionId) {
      if (!noCountdown) {
        // Write in_session = true before navigation
        ;(async () => {
          try {
            await fetch(`/api/sessions/${sessionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ in_session: true }),
            })
            // ← give Supabase a small cushion before we unmount
            await new Promise((r) => setTimeout(r, 500))
          } catch (err) {
            console.error(
              '[useLandingLogic] failed to set in_session=true:',
              err
            )
          } finally {
            navigate(`/${routeBase}/${sessionId}`)
          }
        })()
      } else {
        // In noCountdown mode, skip setting in_session
        navigate(`/${routeBase}/${sessionId}`)
      }
    }
  }, [loading,me?.ready, them?.ready, sessionId, navigate, routeBase, noCountdown])

  // 4️⃣ If “I clicked Ready” but time hits zero and opponent did NOT click →
  //    show “too slow” + requeue (skip if noCountdown)
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
  }, [readyTimer, me?.ready, them?.ready, goToWaiting, noCountdown])

  // 5️⃣ If time hits zero and I never clicked “Ready” → show “You missed it” UI
  const [showMissed, setShowMissed] = useState(false)
  useEffect(() => {
    if (!noCountdown && readyTimer === 0 && !me?.ready) {
      setShowMissed(true)
    }
  }, [readyTimer, me?.ready, noCountdown])

  // 6️⃣ Handler: I click “Ready Up” → flip my column in the *sessions* table
  const handleReady = useCallback(async () => {
    if (!sessionId) return
    const slot = me?.id === player1Id ? 1 : 2
    try {
      await updateSessionReady(sessionId, slot, true)
      if (slot === 1) setPlayer1Ready(true)
      else setPlayer2Ready(true)
    } catch (err) {
      console.error('[useLandingLogic] ready error:', err)
    }
  }, [sessionId, me?.id, player1Id, setPlayer1Ready, setPlayer2Ready])

  // 7️⃣ “Find another match” → flip my matched/session_id on the *teams* table, reset context, re-queue
  const handleRematch = useCallback(async () => {
    if (!teamId) return
    try {
      await fetch(`/api/teams/${teamId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matched: false, session_id: null }),
      })
    } catch (err) {
      console.error('[useLandingLogic] rematch API error:', err)
    }
    setSelectedGame(null)
    setPlayer1Ready(false)
    setPlayer2Ready(false)
    goToWaiting()
  }, [teamId, setSelectedGame, setPlayer1Ready, setPlayer2Ready, goToWaiting])

  // 8️⃣ Clean-up on unmount: flip both ready flags back to false in **sessions**.
  useEffect(() => {
    if (!sessionId) return
    return () => {
      setTimeout(async () => {
        try {
          await updateSessionReady(sessionId, 1, false)
          await updateSessionReady(sessionId, 2, false)
        } catch (err) {
          console.error('[useLandingLogic] cleanup reset failed:', err)
        }
      }, 500)
    }
  }, [sessionId])

  return {
    loading,
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