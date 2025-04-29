import { useState, useEffect } from 'react';
import supabase from '../utils/supabasePublicClient';

/**
 * Given pubName + tableNumber (from context), look up your team's UUID
 * and subscribe to any UPDATEs on that row.
 */
export default function useGetID(pubName, tableNumber) {
  const [teamId, setTeamId] = useState('');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!pubName || !tableNumber) {
      setLoading(false);
      return;
    }
    const fetchId = async () => {
      try {
        const { data, error } = await supabase
          .from('teams')
          .select('team_id')
          .eq('pub_name', pubName)
          .eq('table_number', tableNumber)
          .limit(1);
        if (error) throw error;
        if (data.length) setTeamId(data[0].team_id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchId();
  }, [pubName, tableNumber]);

  useEffect(() => {
    if (!teamId) return;
    const subscription = supabase
      .from(`teams:team_id=eq.${teamId}`)
      .on('UPDATE', payload => {
        console.log('Realtime teams UPDATE', payload);
        // if you wanted to re-fetch or push payload.new into some state...
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [teamId]);

  return { teamId, loading, error };
}
