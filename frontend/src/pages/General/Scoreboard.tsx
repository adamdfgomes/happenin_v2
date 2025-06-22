// src/pages/Scoreboard.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import useLandingLogic from '../../hooks/useLandingLogic'
import useFetchSelectedGame from '../../hooks/useFetchSelectedGame'
import { useGameSession } from '../../context/GameSessionContext'
import Button from '../../components/Button'
import Background from '../../components/Background'
import { setGameOverFlag } from '../../utils/api'

interface LocationState {
  next?: string
}

const Scoreboard: React.FC = () => {
  // 1️⃣ Pull sessionId from URL
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>()
  // 2️⃣ Sync into context
  const { sessionId, setSessionId, teamId, player1Id } = useGameSession()
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
    me: meSession,
    them: themSession,
  } = useFetchSelectedGame()

  // local “unlocked” once we first see both gameOver flags
  const [unlocked, setUnlocked] = useState(false)

  // 6️⃣ detect first time both flags are true
  const bothDone =
    !!meSession &&
    !!themSession &&
    meSession.gameOver &&
    themSession.gameOver

  useEffect(() => {
    if (bothDone) setUnlocked(true)
  }, [bothDone])

  // 7️⃣ if not yet unlocked, show “Waiting…” spinner
  if (!unlocked) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-semibold mb-4">Waiting for opponent…</h1>
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

  // 8️⃣ Once unlocked, show the scoreboard (and never go back)
  return (
    <Background>
      <h1 className="text-3xl font-bold mb-4">Scoreboard</h1>

      <p className="text-2xl mb-6 flex items-center justify-center space-x-8">
        <span>
          {meSession!.name}{' '}
          <span className="font-bold text-green-300">({meSession!.score})</span>
        </span>
        <span className="text-xl">vs.</span>
        <span>
          {themSession!.name}{' '}
          <span className="font-bold text-green-300">({themSession!.score})</span>
        </span>
      </p>

      <Button
        onClick={async () => {
          // normal ready-up
          await handleReady()
          // then reset just your gameOver flag back to false
          try {
            const slot = teamId === player1Id ? 1 : 2
            await setGameOverFlag(sessionId!, slot, false)
          } catch (err) {
            console.error('Failed to reset gameOver flag:', err)
          }
        }}
        disabled={meReady}
      >
        {meReady ? 'Waiting for opponent…' : 'Ready Up'}
      </Button>
    </Background>
  )
}

export default Scoreboard
