import React, { FC, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameSession } from '../context/GameSessionContext'
import useFetchSelectedGame from '../hooks/useFetchSelectedGame'
import useGoToWaiting from '../hooks/useGoToWaiting'
import supabase from '../utils/supabasePublicClient'
import Button from '../components/Button'
import { updateSessionReady } from '../utils/api'
import Background from '../components/Background'

const Landing: FC = () => {
  
  const navigate = useNavigate()

  const {
    teamId,
    sessionId,
    player1Id,
    setPlayer1Ready,
    setPlayer2Ready,
    setSelectedGame,
  } = useGameSession()

  const { loading, error, me, them } = useFetchSelectedGame()
  const goToWaiting = useGoToWaiting()

  // 0️⃣ expired or missing session → re-queue
  useEffect(() => {
    if (error?.includes('Session not found') || error?.includes('JSON object requested')) {
      console.log('[Landing] session expired, re-queuing')
      goToWaiting()
    }
  }, [error, goToWaiting])

  // 1️⃣ 2s delay for splash
  const [minDelayPassed, setMinDelayPassed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setMinDelayPassed(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // 2️⃣ 30s ready-up timer
  const [readyTimer, setReadyTimer] = useState<number | null>(null)
  useEffect(() => {
    if (!loading && minDelayPassed && sessionId && readyTimer === null) {
      setReadyTimer(30)
    }
  }, [loading, minDelayPassed, sessionId, readyTimer])

  useEffect(() => {
    if (readyTimer === null || readyTimer <= 0) return
    const t = setTimeout(() => setReadyTimer(r => (r as number) - 1), 1000)
    return () => clearTimeout(t)
  }, [readyTimer])

  // 3️⃣ both ready → Wheel
  useEffect(() => {
    if (me.ready && them.ready && sessionId) {
      console.log('[Landing] both ready, to wheel', sessionId)
      navigate(`/Wheel/${sessionId}`)
    }
  }, [me.ready, them.ready, sessionId, navigate])

  // 4️⃣ I ready & opponent not → slow opponent splash + auto requeue
  const [showOpponentSlow, setShowOpponentSlow] = useState(false)
  useEffect(() => {
    if (readyTimer === 0 && me.ready && !them.ready) {
      console.log('[Landing] opponent slow, re-queueing')
      setShowOpponentSlow(true)
      setTimeout(goToWaiting, 3000)
    }
  }, [readyTimer, me.ready, them.ready, goToWaiting])

  // 5️⃣ I missed ready → show rematch UI
  const [showMissed, setShowMissed] = useState(false)
  useEffect(() => {
    if (readyTimer === 0 && !me.ready) {
      console.log('[Landing] missed ready-up')
      setShowMissed(true)
    }
  }, [readyTimer, me.ready])

  // Handlers
  const handleReady = useCallback(async () => {
    if (!sessionId) return
    const slot = me.id === player1Id ? 1 : 2
    try {
      await updateSessionReady(sessionId, slot, true)
      console.log('[Landing] ready clicked slot', slot)
      slot === 1 ? setPlayer1Ready(true) : setPlayer2Ready(true)
    } catch (err) {
      console.error('[Landing] ready error', err)
    }
  }, [sessionId, me.id, player1Id, setPlayer1Ready, setPlayer2Ready])

  const handleRematch = useCallback(async () => {
    console.log('[Landing] handleRematch fired, teamId=', teamId)
    try {
      await supabase
        .from('teams')
        .update({ matched: false, session_id: null })
        .eq('team_id', teamId)
    } catch (err) {
      console.error('[Landing] rematch error', err)
    }
    // UI resets
    setSelectedGame(null)
    setPlayer1Ready(false)
    setPlayer2Ready(false)
    // navigate back to waiting
    goToWaiting()
  }, [teamId, setSelectedGame, setPlayer1Ready, setPlayer2Ready, goToWaiting])

  // RENDER
  if (showOpponentSlow) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Opponent was too slow</h1>
          <p>Re-queueing you now…</p>
        </div>
      </main>
    )
  }

  if (showMissed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-2">Too slow!</h1>
        <p>You missed the ready-up window.</p>
        <Button onClick={handleRematch} className="mt-4">
          Find another match
        </Button>
      </main>
    )
  }

  if (loading || readyTimer === null) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <Background>
      <div className="absolute top-4 right-4 text-lg font-medium">{readyTimer}s</div>
      <h1 className="text-3xl font-bold mb-4">Game on!</h1>
      <p className="text-2xl mb-2">{me.name} vs. {them.name}</p>
      <Button onClick={handleReady} disabled={me.ready}>
        {me.ready ? 'Waiting for opponent…' : 'Ready Up'}
      </Button>
    </Background>
  )
}

export default Landing
