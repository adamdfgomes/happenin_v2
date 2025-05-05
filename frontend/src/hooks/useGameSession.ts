// src/hooks/useGameSession.js
import { useContext } from 'react'
import { GameSessionContext } from '../context/GameSessionContext'  

export default function useGameSession() {
  const ctx = useContext(GameSessionContext)
  if (!ctx) throw new Error('useGameSession must be used within GameSessionProvider')
  return ctx
}
