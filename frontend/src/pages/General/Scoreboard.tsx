// src/pages/Scoreboard.tsx
import React, { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import useLandingLogic from '../../hooks/useLandingLogic'
import useFetchSelectedGame from '../../hooks/useFetchSelectedGame'
import { useGameSession } from '../../context/GameSessionContext'
import Button from '../../components/Button'
import Background from '../../components/Background'

interface LocationState {
  next?: string
}

const Scoreboard: React.FC = () => {
  // 1️⃣ Pull sessionId from URL
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>()

  // 2️⃣ Sync into context
  const { sessionId, setSessionId } = useGameSession()
  useEffect(() => {
    if (paramSessionId && paramSessionId !== sessionId) {
      setSessionId(paramSessionId)
    }
  }, [paramSessionId, sessionId, setSessionId])

  // 3️⃣ Optional “next” param
  const { state } = useLocation()
  const { next: routeBase } = (state as LocationState) || {}

  // 4️⃣ Ready-up logic (no countdown)
  const {
    loading: landingLoading,
    meReady,
    handleReady,
  } = useLandingLogic(routeBase ?? 'wheel', { noCountdown: true })

  // 5️⃣ Fetch live session row (scores & end-flags)
  const {
    loading: fetchLoading,
    error,
    me: meSession,
    them: themSession,
  } = useFetchSelectedGame()

  // 6️⃣ While loading _or_ waiting for both players’ gameOver flags:
  const stillLoading =
    landingLoading ||
    fetchLoading ||
    !meSession ||
    !themSession ||
    !meSession.gameOver ||
    !themSession.gameOver

  if (stillLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-semibold mb-4">Waiting for opponent…</h1>
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

  // 7️⃣ Render the final scoreboard + Ready Up button
  return (
    <Background>
      <h1 className="text-3xl font-bold mb-4">Scoreboard</h1>

      <p className="text-2xl mb-6 flex items-center justify-center space-x-8">
        <span>
          {meSession.name}{' '}
          <span className="font-bold text-green-300">({meSession.score})</span>
        </span>
        <span className="text-xl">vs.</span>
        <span>
          {themSession.name}{' '}
          <span className="font-bold text-green-300">({themSession.score})</span>
        </span>
      </p>

      <Button onClick={handleReady} disabled={meReady}>
        {meReady ? 'Waiting for opponent…' : 'Ready Up'}
      </Button>
    </Background>
  )
}

export default Scoreboard
