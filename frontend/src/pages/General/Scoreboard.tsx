// src/pages/Scoreboard.tsx
import React, { useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import useScoreboard from '../../hooks/useScoreboard'
import Background from '../../components/Background'
import Button from '../../components/Button'

export default function Scoreboard() {
  const { sessionId: paramSessionId } = useParams<{ sessionId: string }>()
  const { state } = useLocation<{ next?: string }>()
  const routeBase = state?.next ?? 'wheel'

  const {
    landingLoading,
    fetchLoading,
    stillWaiting,
    meSession,
    themSession,
    meReady,
    onReady,
  } = useScoreboard(routeBase)

  if (landingLoading || fetchLoading || stillWaiting) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-semibold mb-4">Waiting for opponent…</h1>
        <div className="w-12 h-12 border-4 border-gray-200 border-l-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

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
      <Button onClick={onReady} disabled={meReady}>
        {meReady ? 'Waiting for opponent…' : 'Ready Up'}
      </Button>
    </Background>
  )
}
