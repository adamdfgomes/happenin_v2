// assignSessionListener_india.js

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

// Supabase for real-time, PG for running the CTE
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Your existing match logic
async function handleTeamChange(payload) {
  const { team_id, matched, team_name } = payload.new;

  // 1) match teams as before
  if (team_name && !matched) {
    await matchTeams();
  }
}

// Your existing matchTeams (unchanged)
async function matchTeams() {
  const { data: unmatchedTeams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('matched', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching unmatched teams:', error);
    return;
  }
  if ((unmatchedTeams || []).length < 2) {
    console.log('Not enough unmatched teams to pair.');
    return;
  }

  for (let i = 0; i < unmatchedTeams.length; i++) {
    const team1 = unmatchedTeams[i];
    if (!team1.team_name || team1.matched) continue;

    for (let j = i + 1; j < unmatchedTeams.length; j++) {
      const team2 = unmatchedTeams[j];
      if (!team2.team_name || team2.matched) continue;

      if (team1.pub_name === team2.pub_name) {
        try {
          // mark both as matched (no session_id yet)
          await supabase
            .from('teams')
            .update({ matched: true, matched_id: team2.team_id })
            .eq('team_id', team1.team_id);

          await supabase
            .from('teams')
            .update({ matched: true, matched_id: team1.team_id })
            .eq('team_id', team2.team_id);

          console.log(`Matched teams: ${team1.team_name} ↔ ${team2.team_name}`);
          return; // stop after one pairing
        } catch (err) {
          console.error('Error updating matched teams:', err);
        }
      }
    }
  }
}

// Start the combined listener
async function startRealtimeListener() {
  console.log('▶️  Background worker listening for team changes…');

  supabase
    .from('teams')
    .on('INSERT', payload => handleTeamChange(payload))
    .on('UPDATE', payload => handleTeamChange(payload))  // Fixed the syntax here
    .subscribe((status, err) => {  // Corrected this block
      if (err) console.error('Realtime subscription error:', err);
      else console.log('Realtime status:', status);
    });
}

export { startRealtimeListener };
