// src/hooks/useScoreboard.js
import { useState, useEffect } from 'react'
import { useGameSession } from '../context/GameSessionContext'
import useLandingLogic from './useLandingLogic'
import useFetchSelectedGame from './useFetchSelectedGame'
import { setGameOverFlag, incrementGamesPlayed } from '../utils/api'

/**
 * Encapsulates all of the Scoreboard page’s state:
 * – ready/up logic
 * – live session fetch (scores & gameOver flags)
 * – “unlock” once both players are done
 * – bump games_played once by player1
 */
export default function useScoreboard(initialRouteBase = 'wheel') {
  const { sessionId, teamId, player1Id } = useGameSession()

  // ready-up with no countdown
  const {
    loading: landingLoading,
    meReady,
    handleReady,
  } = useLandingLogic(initialRouteBase, { noCountdown: true })

  // live session row (scores & flags)
  const {
    loading: fetchLoading,
    me: meSession,
    them: themSession,
  } = useFetchSelectedGame()

  // once both gameOver flags true, “unlock” the scoreboard
  const [unlocked, setUnlocked] = useState(false)
  const bothDone =
    meSession?.gameOver === true &&
    themSession?.gameOver === true

  useEffect(() => {
    if (bothDone) setUnlocked(true)
  }, [bothDone])

  // wrapper for Ready Up button:
  // 1) normal ready logic
  // 2) reset *your* gameOver flag so you re-wait next round
  const onReady = async () => {
    await handleReady()
    const slot = teamId === player1Id ? 1 : 2
    try {
      await setGameOverFlag(sessionId, slot, false)
    } catch (err) {
      console.error('Reset gameOver flag failed', err)
    }
  }

  // ✅ bump games_played only once if player1
  const [hasIncremented, setHasIncremented] = useState(false)
  useEffect(() => {
    if (
      !hasIncremented &&
      sessionId &&
      teamId &&
      player1Id &&
      teamId === player1Id
    ) {
      incrementGamesPlayed(sessionId)
        .then(() => setHasIncremented(true))
        .catch(err => console.error('Failed to increment games_played:', err))
    }
  }, [sessionId, teamId, player1Id, hasIncremented])

  return {
    landingLoading,
    fetchLoading,
    stillWaiting: !unlocked,
    meSession,
    themSession,
    meReady,
    onReady,
  }
}
