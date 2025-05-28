import { useState, useEffect, useRef } from 'react'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

/**
 * Fetch session details (including selectedGame) and subscribe for updates
 * then derive `me` vs `them` including names.
 */
export default function useFetchSelectedGame() {
  const {
    teamId,
    sessionId,
    player1Id,
    player2Id,
    player1Ready,
    player2Ready,
    setSelectedGame,
    setPlayer1Id,
    setPlayer2Id,
    setPlayer1Ready,
    setPlayer2Ready,
  } = useGameSession()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [p1Name, setP1Name] = useState(null)
  const [p2Name, setP2Name] = useState(null)
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
        selectedGame: selectedGameCamel,
        player1_ready,
        player2_ready,
        player_1,
        player_2,
      } = sessionRecord

      // 1️⃣ selectedGame (supports both snake_case and camelCase)
      const gameVal = selected_game ?? selectedGameCamel
      if (gameVal !== undefined) setSelectedGame(gameVal)

      // 2️⃣ ready flags
      if (player1_ready !== undefined) setPlayer1Ready(player1_ready)
      if (player2_ready !== undefined) setPlayer2Ready(player2_ready)

      // 3️⃣ fetch team names
      const { data: teams, error: teamsErr } = await supabase
        .from('teams')
        .select('team_id, team_name')
        .in('team_id', [player_1, player_2])
      if (!teamsErr) {
        const p1 = teams.find(t => t.team_id === player_1)
        const p2 = teams.find(t => t.team_id === player_2)
        if (p1) {
          setPlayer1Id(p1.team_id)
          setP1Name(p1.team_name)
        }
        if (p2) {
          setPlayer2Id(p2.team_id)
          setP2Name(p2.team_name)
        }
      }
    }

    // realtime updates
    const debouncedHandler = ({ new: newRec }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => applyUpdate(newRec), 50)
    }
    const channel = supabase
      .channel(`session_${sessionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `session_id=eq.${sessionId}` }, debouncedHandler)
      .subscribe()

    // initial load
    ;(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`)
        if (!res.ok) throw new Error(await res.text())
        const rec = await res.json()
        await applyUpdate(rec)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()

    return () => {
      supabase.removeChannel(channel)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [sessionId])

  // derive me/them
  const amI1 = teamId === player1Id
  const me = { id: amI1 ? player1Id : player2Id, name: amI1 ? p1Name : p2Name, ready: amI1 ? player1Ready : player2Ready }
  const them = { id: amI1 ? player2Id : player1Id, name: amI1 ? p2Name : p1Name, ready: amI1 ? player2Ready : player1Ready }

  return { loading, error, me, them }
}
