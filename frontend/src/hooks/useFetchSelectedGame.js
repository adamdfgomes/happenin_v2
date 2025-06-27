// src/hooks/useFetchSelectedGame.js
import { useState, useEffect, useRef } from 'react'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

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

  // ── RESET STALE CONTEXT ────────────────────────────────────────────────────────
  // Whenever sessionId changes, blow away the old IDs/ready flags/gameSel
  useEffect(() => {
    setPlayer1Id(null)
    setPlayer2Id(null)
    setPlayer1Ready(false)
    setPlayer2Ready(false)
    setSelectedGame(null)
  }, [
    sessionId,
    setPlayer1Id,
    setPlayer2Id,
    setPlayer1Ready,
    setPlayer2Ready,
    setSelectedGame,
  ])

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // local session‐state
  const [p1Score, setP1Score] = useState(0)
  const [p2Score, setP2Score] = useState(0)
  const [p1End,   setP1End]   = useState(false)
  const [p2End,   setP2End]   = useState(false)

  const [p1Name, setP1Name] = useState(null)
  const [p2Name, setP2Name] = useState(null)
  const debounceRef         = useRef(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    async function applyUpdate(sessionRecord) {
      // clear any prior error
      setError(null)

      const {
        selected_game,
        selectedGame: selectedGameCamel,
        player1_ready, player2_ready,
        player_1,      player_2,
        player1_score, player2_score,
        p1_gameover,   p2_gameover,
      } = sessionRecord

      // 1️⃣ game selection
      const gameVal = selected_game ?? selectedGameCamel
      if (gameVal !== undefined) setSelectedGame(gameVal)

      // 2️⃣ ready flags
      if (player1_ready !== undefined) setPlayer1Ready(player1_ready)
      if (player2_ready !== undefined) setPlayer2Ready(player2_ready)

      // 3️⃣ team names & IDs
      const { data: teams, error: teamsErr } = await supabase
        .from('teams')
        .select('team_id,team_name')
        .in('team_id', [player_1, player_2])
      if (!teamsErr && teams) {
        const m = Object.fromEntries(teams.map(t => [t.team_id, t.team_name]))
        setPlayer1Id(player_1); setP1Name(m[player_1] ?? null)
        setPlayer2Id(player_2); setP2Name(m[player_2] ?? null)
      }

      // 4️⃣ scores & end flags
      if (typeof player1_score === 'number') setP1Score(player1_score)
      if (typeof player2_score === 'number') setP2Score(player2_score)
      if (typeof p1_gameover   === 'boolean') setP1End(p1_gameover)
      if (typeof p2_gameover   === 'boolean') setP2End(p2_gameover)
    }

    // realtime subscription
    const handler = ({ new: rec }) => {
      clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => applyUpdate(rec), 50)
    }
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
        handler
      )
      .subscribe()

    // initial GET
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
      clearTimeout(debounceRef.current)
    }
  }, [
    sessionId,
    setSelectedGame,
    setPlayer1Id,
    setPlayer2Id,
    setPlayer1Ready,
    setPlayer2Ready,
  ])

  // derive “me” vs “them”
  const amI1 = teamId === player1Id
  const me = {
    id:       amI1 ? player1Id    : player2Id,
    name:     amI1 ? p1Name        : p2Name,
    ready:    amI1 ? player1Ready : player2Ready,
    score:    amI1 ? p1Score      : p2Score,
    gameOver: amI1 ? p1End        : p2End,
  }
  const them = {
    id:       amI1 ? player2Id    : player1Id,
    name:     amI1 ? p2Name        : p1Name,
    ready:    amI1 ? player2Ready : player1Ready,
    score:    amI1 ? p2Score      : p1Score,
    gameOver: amI1 ? p2End        : p1End,
  }

  return { loading, error, me, them }
}
