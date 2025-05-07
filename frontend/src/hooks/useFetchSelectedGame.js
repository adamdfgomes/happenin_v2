// src/hooks/useFetchSelectedGame.js
import { useState, useEffect } from 'react';
import { getSessionData } from '../utils/api';
import supabase from '../utils/supabasePublicClient';
import { useGameSession } from '../context/GameSessionContext';

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
  } = useGameSession();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    // 1) Handler for any realtime UPDATEs
    const handleUpdate = async ({ new: payload }) => {
      const {
        selected_game,
        player_1,
        player_2,
        start_time,
        player1_ready,
        player2_ready,
      } = payload;

      if (selected_game) setSelectedGame(selected_game);
      if (start_time)     setStartTime(start_time);
      if (player_1)       setPlayer1Id(player_1);
      if (player_2)       setPlayer2Id(player_2);
      if (player1_ready !== undefined) setPlayer1Ready(player1_ready);
      if (player2_ready !== undefined) setPlayer2Ready(player2_ready);

      // Fetch team names if they just appeared
      if (player_1) {
        const { data: t1 } = await supabase
          .from('teams')
          .select('team_name')
          .eq('team_id', player_1)
          .single();
        setPlayer1TeamName(t1.team_name);
      }
      if (player_2) {
        const { data: t2 } = await supabase
          .from('teams')
          .select('team_name')
          .eq('team_id', player_2)
          .single();
        setPlayer2TeamName(t2.team_name);
      }
    };

    // 2) Subscribe first
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
        handleUpdate
      )
      .subscribe();

    // 3) Then do the initial fetch
    getSessionData(sessionId)
      .then(async session => {
        // populate state from the existing row
        await handleUpdate({ new: session });
      })
      .catch(err => {
        setError(err.message || 'Fetch failed');
      })
      .finally(() => {
        setLoading(false);
      });

    // Cleanup subscription on unmount / sessionId change
    return () => {
      supabase.removeChannel(channel);
    };
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
  ]);

  return { loading, error };
}