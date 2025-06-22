// src/pages/ReadyUp.tsx
import React, { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import useLandingLogic from '../../hooks/useLandingLogic'
import { useGameSession } from '../../context/GameSessionContext'
import Button from '../../components/Button'
import Background from '../../components/Background'

interface LocationState {
  next?: string // e.g. "message" or "chat"
}

const ReadyUp: React.FC = () => {
  // 1️⃣ Pull `:sessionId` from URL
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>()

  // 2️⃣ Write it into context immediately
  const { sessionId, setSessionId } = useGameSession()
  useEffect(() => {
    if (paramSessionId && paramSessionId !== sessionId) {
      setSessionId(paramSessionId)
    }
  }, [paramSessionId, sessionId, setSessionId])

  // 3️⃣ pull optional “next” from location.state (default to "message")
  const { state } = useLocation()
  const { next: routeBase } = (state as LocationState) || {}

  // 4️⃣ Now that context.sessionId is guaranteed, call the hook with noCountdown
  const {
    loading,
    meName,
    themName,
    meReady,
    handleReady,
  } = useLandingLogic(routeBase ?? 'message', { noCountdown: true })

  // 5️⃣ If still fetching “me/them,” show a spinner
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

  // 6️⃣ Once loaded, show “Ready Up” button
  return (
    <Background>
      <h1 className="text-3xl font-bold mb-4">Let's go!</h1>
      <p className="text-2xl mb-6">
        {meName} vs. {themName}
      </p>
      <Button onClick={handleReady} disabled={meReady}>
        {meReady ? 'Waiting for opponent…' : 'Ready Up'}
      </Button>
    </Background>
  )
}

export default ReadyUp