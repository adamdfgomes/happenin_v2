// src/hooks/useFetchSelectedGame.js
import { useState, useEffect, useRef } from 'react'
import { getSessionData } from '../utils/api'
import { useGameSession } from '../context/GameSessionContext'

export default function useFetchSelectedGame() {
  const {
    sessionId,
    setSelectedGame,
    setPlayer1TeamName,
    setPlayer2TeamName,
    setStartTime,
    setPlayer1Id,
    setPlayer2Id,
    setPlayer1Ready,
    setPlayer2Ready,
  } = useGameSession()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const applyUpdate = async (session) => {
      const {
        selected_game,
        start_time,
        player1_ready,
        player2_ready,
        player_1,
        player_2,
      } = session

      if (selected_game) setSelectedGame(selected_game)
      if (start_time) setStartTime(start_time)
      if (player1_ready !== undefined) setPlayer1Ready(player1_ready)
      if (player2_ready !== undefined) setPlayer2Ready(player2_ready)

      // Fetch Team 1 by its slot ID
      const res1 = await fetch(`/api/teams/${player_1}`)
      if (!res1.ok) throw new Error(`Team1 fetch error: ${await res1.text()}`)
      const team1 = (await res1.json())[0]
      setPlayer1Id(team1.team_id)
      setPlayer1TeamName(team1.team_name)

      // Fetch Team 2 by its slot ID
      const res2 = await fetch(`/api/teams/${player_2}`)
      if (!res2.ok) throw new Error(`Team2 fetch error: ${await res2.text()}`)
      const team2 = (await res2.json())[0]
      setPlayer2Id(team2.team_id)
      setPlayer2TeamName(team2.team_name)
    }

    const debouncedHandler = ({ new: payload }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => applyUpdate(payload), 50)
    }

    // 1) Subscribe to realtime updates on this session row
    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `session_id=eq.${sessionId}`,
        },
        debouncedHandler
      )
      .subscribe()

    // 2) Initial load
    getSessionData(sessionId)
      .then((session) => applyUpdate(session))
      .catch((err) => setError(err.message || 'Fetch failed'))
      .finally(() => setLoading(false))

    return () => {
      supabase.removeChannel(channel)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    sessionId,
    setSelectedGame,
    setPlayer1TeamName,
    setPlayer2TeamName,
    setStartTime,
    setPlayer1Id,
    setPlayer2Id,
    setPlayer1Ready,
    setPlayer2Ready,
  ])

  return { loading, error }
}
