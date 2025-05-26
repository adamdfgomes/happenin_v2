// src/hooks/useFetchSelectedGame.js
import { useState, useEffect, useRef } from 'react'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

/**
 * Fetch session details and subscribe to realtime updates,
 * then derive `me` vs `them` so Landing can just render those.
 */
export default function useFetchSelectedGame() {
  const {
    teamId,
    sessionId,
    player1Id,
    player2Id,
    player1TeamName,
    player2TeamName,
    player1Ready,
    player2Ready,
    setSelectedGame,
    setPlayer1Id,
    setPlayer2Id,
    setPlayer1TeamName,
    setPlayer2TeamName,
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

    const applyUpdate = async (sessionRecord) => {
      const {
        selected_game,
        player1_ready,
        player2_ready,
        player_1,
        player_2,
      } = sessionRecord

      // 1) Update session fields
      if (selected_game !== undefined) setSelectedGame(selected_game)
      if (player1_ready  !== undefined) setPlayer1Ready(player1_ready)
      if (player2_ready  !== undefined) setPlayer2Ready(player2_ready)

      // 2) Fetch both team names in one go
      //    you can keep using supabase here if you like,
      //    or swap to your API /api/teams/:teamId if you prefer
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('team_id, team_name')
        .in('team_id', [player_1, player_2])

      if (teamsError) {
        console.error('Error fetching team names:', teamsError)
        return
      }

      // 3) Map to slots
      const p1 = teams.find((t) => t.team_id === player_1)
      const p2 = teams.find((t) => t.team_id === player_2)

      if (p1) {
        setPlayer1Id(p1.team_id)
        setPlayer1TeamName(p1.team_name)
      }
      if (p2) {
        setPlayer2Id(p2.team_id)
        setPlayer2TeamName(p2.team_name)
      }
    }

    // Debounced handler for realtime updates
    const debouncedHandler = ({ new: payload }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => applyUpdate(payload), 50)
    }

    // Subscribe to session updates
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

    // **Initial fetch via your Express API instead of REST**  
    const loadInitial = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text)
        }
        const session = await res.json()
        applyUpdate(session)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    loadInitial()

    return () => {
      supabase.removeChannel(channel)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    teamId,
    sessionId,
    setSelectedGame,
    setPlayer1Id,
    setPlayer2Id,
    setPlayer1TeamName,
    setPlayer2TeamName,
    setPlayer1Ready,
    setPlayer2Ready,
  ])

  // Derive “me” vs “them”
  const amIPlayer1 = teamId === player1Id
  const me = {
    id:    amIPlayer1 ? player1Id     : player2Id,
    name:  amIPlayer1 ? player1TeamName : player2TeamName,
    ready: amIPlayer1 ? player1Ready   : player2Ready,
  }
  const them = {
    id:    amIPlayer1 ? player2Id     : player1Id,
    name:  amIPlayer1 ? player2TeamName : player1TeamName,
    ready: amIPlayer1 ? player2Ready   : player1Ready,
  }

  return { loading, error, me, them }
}
