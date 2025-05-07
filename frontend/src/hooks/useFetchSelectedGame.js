// src/hooks/useFetchSelectedGame.js
import { useState, useEffect, useRef } from 'react';
import { getSessionData } from '../utils/api';
import supabase from '../utils/supabasePublicClient';
import { useGameSession } from '../context/GameSessionContext';

/**
 * Fetch session details (game selection, start time, ready flags),
 * then lookup the two teams for this session and subscribe to realtime updates.
 */
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
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    // If there's no session yet, clear loading and bail
    if (!sessionId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Apply updates: session fields + lookup teams by session_id
    const applyUpdate = async (payload) => {
      const { selected_game, start_time, player1_ready, player2_ready } = payload;

      if (selected_game) setSelectedGame(selected_game);
      if (start_time) setStartTime(start_time);
      if (player1_ready !== undefined) setPlayer1Ready(player1_ready);
      if (player2_ready !== undefined) setPlayer2Ready(player2_ready);

      // Fetch the two teams for this session
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('team_id, team_name')
        .eq('session_id', sessionId);
      if (teamsError) throw teamsError;

      // Assuming exactly two teams per session
      if (teams?.length >= 2) {
        const [t1, t2] = teams;
        setPlayer1Id(t1.team_id);
        setPlayer1TeamName(t1.team_name);
        setPlayer2Id(t2.team_id);
        setPlayer2TeamName(t2.team_name);
      }
    };

    // Debounced handler for realtime updates
    const debouncedHandler = ({ new: payload }) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => applyUpdate(payload), 50);
    };

    // 1) Subscribe to realtime session updates
    const channel = supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `session_id=eq.${sessionId}` },
        debouncedHandler
      )
      .subscribe();

    // 2) Initial fetch
    getSessionData(sessionId)
      .then((session) => applyUpdate(session))
      .catch((err) => setError(err.message || 'Fetch failed'))
      .finally(() => setLoading(false));

    // Cleanup on unmount or session change
    return () => {
      supabase.removeChannel(channel);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sessionId, setSelectedGame, setPlayer1TeamName, setPlayer2TeamName, setStartTime, setPlayer1Id, setPlayer2Id, setPlayer1Ready, setPlayer2Ready]);

  return { loading, error };
}
