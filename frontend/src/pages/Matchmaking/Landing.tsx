import React from 'react'
import { useParams, useLocation } from 'react-router-dom'
import useLandingLogic from '../../hooks/useLandingLogic'
import Button from '../../components/Button'
import Background from '../../components/Background'

interface LocationState {
  next?: string // e.g. "wheel" or "chat"
}

const Landing: React.FC = () => {
  // ① pull sessionId from URL (we don’t actually use it in the hook,
  //    because `useFetchSelectedGame` reads it from context)
  const { sessionId } = useParams<{ sessionId: string }>()

  // ② pull location.state.next (defaults to "wheel")
  const { state } = useLocation()
  const { next: routeBase } = (state as LocationState) || {}

  // ③ call useLandingLogic; if routeBase is missing, default to "wheel"
  const {
    loading,
    readyTimer,
    meName,
    themName,
    meReady,
    showOpponentSlow,
    showMissed,
    handleReady,
    handleRematch,
  } = useLandingLogic(routeBase ?? 'wheel')

  // 1️⃣ Opponent was too slow → show a brief splash then re‐queue
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

  // 2️⃣ Missed the ready‐up window → show “Find another match”
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

  // 3️⃣ Still loading or timer not initialized → spinner
  if (loading || readyTimer === null) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

  // 4️⃣ Normal “Game on!” ready‐up screen
  return (
    <Background>
      <div className="absolute top-4 right-4 text-lg font-medium">
        {readyTimer}s
      </div>
      <h1 className="text-3xl font-bold mb-4">Game on!</h1>
      <p className="text-2xl mb-2">
        {meName} vs. {themName}
      </p>
      <Button onClick={handleReady} disabled={meReady}>
        {meReady ? 'Waiting for opponent…' : 'Ready Up'}
      </Button>
    </Background>
  )
}

export default Landing
