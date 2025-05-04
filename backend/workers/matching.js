import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Start listening for real-time INSERT and UPDATE events
async function startRealtimeListener() {
  const { data, error } = await supabase
    .from('teams')
    .on('INSERT', payload => handleTeamChange(payload))
    .on('UPDATE', payload => handleTeamChange(payload))
    .subscribe();

  if (error) {
    console.error('Error with real-time subscription:', error);
  }
}

// Handle changes to the team data
async function handleTeamChange(payload) {
  const teamId = payload.new.team_id;
  const matched = payload.new.matched;

  if (!matched) {
    await matchTeams();
  }
}

// Match teams that are unmatched
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

  if (unmatchedTeams.length < 2) {
    console.log('Not enough unmatched teams to pair.');
    return;
  }

  const team1 = unmatchedTeams[0];
  const team2 = unmatchedTeams[1];

  try {
    await supabase
      .from('teams')
      .update({ matched: true, matched_id: team2.team_id })
      .eq('team_id', team1.team_id);

    await supabase
      .from('teams')
      .update({ matched: true, matched_id: team1.team_id })
      .eq('team_id', team2.team_id);

    console.log(`Matched teams: ${team1.team_name} with ${team2.team_name}`);
  } catch (err) {
    console.error('Error updating matched teams:', err);
  }
}

export { startRealtimeListener };
