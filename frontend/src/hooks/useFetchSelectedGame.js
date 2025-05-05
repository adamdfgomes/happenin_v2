// src/hooks/useFetchSelectedGame.js
import { useState, useEffect } from 'react'
import { getSessionData } from '../utils/api'
import supabase from '../utils/supabasePublicClient'
import { useGameSession } from '../context/GameSessionContext'

/**
 * Fetch session details (selected_game, player_1, player_2, start_time) once sessionId is set,
 * then fetch corresponding team names from teams table,
 * subscribe to realtime updates on that session row,
 * writing values into context via setSelectedGame, setPlayer1TeamName, setPlayer2TeamName, setStartTime.
 */
export default function useFetchSelectedGame() {
  const {
    sessionId,
    setSelectedGame,
    setPlayer1TeamName,
    setPlayer2TeamName,
    setStartTime
  } = useGameSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Subscribe first to catch any updates during fetch
    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `session_id=eq.${sessionId}` },
        async payload => {
          const { selected_game, player_1, player_2, start_time } = payload.new
          // update selected game
          if (selected_game) setSelectedGame(selected_game)
          // update start time
          if (start_time) setStartTime(start_time)
          // update team names if players changed
          if (player_1) {
            try {
              const { data: t1 } = await supabase.from('teams').select('team_name').eq('team_id', player_1).single()
              setPlayer1TeamName(t1.team_name)
            } catch (e) {
              console.error('Error updating player1 team name:', e)
            }
          }
          if (player_2) {
            try {
              const { data: t2 } = await supabase.from('teams').select('team_name').eq('team_id', player_2).single()
              setPlayer2TeamName(t2.team_name)
            } catch (e) {
              console.error('Error updating player2 team name:', e)
            }
          }
        }
      )
      .subscribe()

    // Initial fetch
    getSessionData(sessionId)
      .then(async session => {
        const { selected_game, player_1, player_2, start_time } = session
        if (selected_game) setSelectedGame(selected_game)
        if (start_time) setStartTime(start_time)
        try {
          if (player_1) {
            const { data: team1 } = await supabase.from('teams').select('team_name').eq('team_id', player_1).single()
            setPlayer1TeamName(team1.team_name)
          }
          if (player_2) {
            const { data: team2 } = await supabase.from('teams').select('team_name').eq('team_id', player_2).single()
            setPlayer2TeamName(team2.team_name)
          }
        } catch (teamErr) {
          console.error('Error fetching team names:', teamErr)
        }
      })
      .catch(err => setError(err.message || 'Fetch failed'))
      .finally(() => setLoading(false))

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId, setSelectedGame, setPlayer1TeamName, setPlayer2TeamName, setStartTime])

  return { loading, error }
}
