import dotenv from 'dotenv';
import express from 'express';
import { supabase } from './utils/supabaseClient.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// --- Teams Endpoints ---

// GET a single team by ID
app.get('/api/teams/:teamId', async (req, res) => {
  const { teamId } = req.params;
  try {
    const { data, error, status } = await supabase
      .from('teams')
      .select()
      .eq('team_id', teamId);

    if (error) return res.status(status || 500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET teams by query (e.g. pub_name & table_number)
app.get('/api/teams', async (req, res) => {
  const { pub_name, table_number } = req.query;
  try {
    let query = supabase.from('teams').select();
    if (pub_name) query = query.eq('pub_name', pub_name);
    if (table_number) query = query.eq('table_number', Number(table_number));

    const { data, error, status } = await query;
    if (error) return res.status(status || 500).json({ error: error.message });
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: create a new team (whitelist pub_name, table_number)
app.post('/api/teams', async (req, res) => {
  const { pub_name, table_number } = req.body;
  if (typeof pub_name !== 'string')
    return res.status(400).json({ error: 'pub_name is required as a string' });

  let tableNum;
  if (typeof table_number === 'number') {
    tableNum = table_number;
  } else if (typeof table_number === 'string') {
    tableNum = Number(table_number);
    if (Number.isNaN(tableNum)) {
      return res.status(400).json({ error: 'table_number must be a number or numeric string' });
    }
  } else {
    return res.status(400).json({ error: 'table_number is required as a number' });
  }

  try {
    const { data, error, status } = await supabase
      .from('teams')
      .insert([{ pub_name, table_number: tableNum }])
      .select();

    if (error) return res.status(status || 500).json({ error: error.message });
    return res.status(201).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH: whitelist only team_name, group_type, matched
app.patch('/api/teams/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const payload = req.body || {};
  const updateData = {};

  if (payload.hasOwnProperty('team_name')) {
    if (typeof payload.team_name !== 'string')
      return res.status(400).json({ error: 'team_name must be a string' });
    updateData.team_name = payload.team_name;
  }
  if (payload.hasOwnProperty('group_type')) {
    if (typeof payload.group_type !== 'string')
      return res.status(400).json({ error: 'group_type must be a string' });
    updateData.group_type = payload.group_type;
  }
  if (payload.hasOwnProperty('matched')) {
    if (typeof payload.matched !== 'boolean')
      return res.status(400).json({ error: 'matched must be a boolean' });
    updateData.matched = payload.matched;
  }
  if (payload.hasOwnProperty('player1_score')) {
    if (typeof payload.player1_score !== 'number') {
      return res.status(400).json({ error: 'player1_score must be a number' })
    }
    updateData.player1_score = payload.player1_score
  }
  if (payload.hasOwnProperty('player2_score')) {
    if (typeof payload.player2_score !== 'number') {
      return res.status(400).json({ error: 'player2_score must be a number' })
    }
    updateData.player2_score = payload.player2_score
  }
   // new flags for TTOL round end
  if (payload.hasOwnProperty('p1_gameover')) {
    if (typeof payload.p1_gameover !== 'boolean') {
      return res.status(400).json({ error: 'p1_gameover must be boolean' })
    }
    updateData.p1_gameover = payload.p1_gameover
  }
  if (payload.hasOwnProperty('p2_gameover')) {
    if (typeof payload.p2_gameover !== 'boolean') {
      return res.status(400).json({ error: 'p2_gameover must be boolean' })
    }
    updateData.p2_gameover = payload.p2_gameover
  }

  if (Object.keys(updateData).length === 0)
    return res.status(400).json({ error: 'No valid fields provided to update' });

  try {
    const { data, error, status } = await supabase
      .from('teams')
      .update(updateData)
      .eq('team_id', teamId);

    if (error) return res.status(status || 500).json({ error: error.message });
    return res.json({ team: data[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Sessions Endpoints ---

// GET a single session by ID
app.get('/api/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const { data, error, status } = await supabase
      .from('sessions')
      .select()
      .eq('session_id', sessionId);

    if (error) return res.status(status || 500).json({ error: error.message });
    if (!data || data.length === 0)
      return res.status(404).json({ error: 'Session not found' });
    return res.json(data[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH: whitelist session fields (selected_game, player1_ready, player2_ready, in_session)
app.patch('/api/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const payload = req.body || {};
  const updateData = {};

  if (payload.hasOwnProperty('selected_game')) {
    if (typeof payload.selected_game !== 'string')
      return res.status(400).json({ error: 'selected_game must be a string' });
    updateData.selected_game = payload.selected_game;
  }
  if (payload.hasOwnProperty('player1_ready')) {
    if (typeof payload.player1_ready !== 'boolean')
      return res.status(400).json({ error: 'player1_ready must be a boolean' });
    updateData.player1_ready = payload.player1_ready;
  }
  if (payload.hasOwnProperty('player2_ready')) {
    if (typeof payload.player2_ready !== 'boolean')
      return res.status(400).json({ error: 'player2_ready must be a boolean' });
    updateData.player2_ready = payload.player2_ready;
  }
  if (payload.hasOwnProperty('in_session')) {
    if (typeof payload.in_session !== 'boolean') {
      return res.status(400).json({ error: 'in_session must be a boolean' });
    }
    updateData.in_session = payload.in_session;
  }
    // now also allow your TTOL‐end flags
  if (payload.hasOwnProperty('p1_gameover')) {
    if (typeof payload.p1_gameover !== 'boolean') {
      return res.status(400).json({ error: 'p1_gameover must be boolean' })
    }
    updateData.p1_gameover = payload.p1_gameover
  }
  if (payload.hasOwnProperty('p2_gameover')) {
    if (typeof payload.p2_gameover !== 'boolean') {
      return res.status(400).json({ error: 'p2_gameover must be boolean' })
    }
    updateData.p2_gameover = payload.p2_gameover
  }

  if (Object.keys(updateData).length === 0)
    return res.status(400).json({ error: 'No valid fields provided to update' });

  try {
    const { data, error, status } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('session_id', sessionId);

    if (error) return res.status(status || 500).json({ error: error.message });
    return res.json({ session: data[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST TTOL answers
app.post('/api/twolies', async (req, res) => {
  const {
    session_id,
    p1_truth1,
    p1_truth2,
    p1_lie,
    p2_truth1,
    p2_truth2,
    p2_lie,
  } = req.body;

  // session_id is required; everything else is optional
  if (!session_id) {
    return res.status(400).json({ error: 'session_id is required' });
  }

  // Build only the fields the client sent
  const payload = { session_id };
  if (typeof p1_truth1 === 'string') payload.p1_truth1 = p1_truth1;
  if (typeof p1_truth2 === 'string') payload.p1_truth2 = p1_truth2;
  if (typeof p1_lie    === 'string') payload.p1_lie    = p1_lie;
  if (typeof p2_truth1 === 'string') payload.p2_truth1 = p2_truth1;
  if (typeof p2_truth2 === 'string') payload.p2_truth2 = p2_truth2;
  if (typeof p2_lie    === 'string') payload.p2_lie    = p2_lie;

  try {
    const { data, error, status } = await supabase
      .from('two-truths-one-lie')               // make sure your table name uses underscores
      .upsert([payload], { onConflict: ['session_id'] })
      .select()
      .single();

    if (error) {
      return res.status(status || 500).json({ error: error.message });
    }
    // 200 OK whether it was an insert or an update
    return res.json(data);
  } catch (err) {
    console.error('TTOL upsert error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST a chat message for a session/team.
 */
app.post('/api/messages', async (req, res) => {
  const { session_id, team_id, text } = req.body

  // Log it so we can verify what's coming in
  console.log('POST /api/messages', { session_id, team_id, text })

  if (!session_id || !team_id || typeof text !== 'string') {
    return res
      .status(400)
      .json({ error: 'session_id, team_id and text (string) are required' })
  }

  try {
    const { data, error, status } = await supabase
      .from('messages')
      .insert([{ session_id, team_id, text }])
      .select('id, session_id, team_id, text, created_at')
      .single()

    if (error) {
      return res.status(status || 500).json({ error: error.message })
    }
    return res.status(201).json(data)
  } catch (err) {
    console.error('Message insert error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
});

/**
 * POST a chatroom message for a session/team.
 */
app.post('/api/chatroom', async (req, res) => {
  const { session_id, team_id, text } = req.body

  // Log it so we can verify what's coming in
  console.log('POST /api/chatroom', { session_id, team_id, text })

  if (!session_id || !team_id || typeof text !== 'string') {
    return res
      .status(400)
      .json({ error: 'session_id, team_id and text (string) are required' })
  }

  try {
    const { data, error, status } = await supabase
      .from('chatroom')
      .insert([{ session_id, team_id, text }])
      .select('id, session_id, team_id, text, created_at')
      .single()

    if (error) {
      return res.status(status || 500).json({ error: error.message })
    }
    return res.status(201).json(data)
  } catch (err) {
    console.error('Message insert error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
});


// POST /api/sessions/:sessionId/score
app.post('/api/sessions/:sessionId/score', async (req, res) => {
  const { sessionId } = req.params;
  const { playerSlot } = req.body;
  if (![1, 2].includes(playerSlot)) {
    return res.status(400).json({ error: 'playerSlot must be 1 or 2' });
  }

  const col = playerSlot === 1 ? 'player1_score' : 'player2_score';
  try {
    // 1️⃣ read the existing score
    const { data: existing, error: fetchErr } = await supabase
      .from('sessions')
      .select(col)
      .eq('session_id', sessionId)
      .single();
    if (fetchErr) throw fetchErr;

    const newScore = (existing[col] || 0) + 1;

    // 2️⃣ write it back
    const { data, error: updateErr, status } = await supabase
      .from('sessions')
      .update({ [col]: newScore })
      .eq('session_id', sessionId)
      .select()
      .single();
    if (updateErr) throw updateErr;

    return res.json({ session: data });
  } catch (err) {
    console.error('Score increment error', err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/sessions/:sessionId/games-played
app.post('/api/sessions/:sessionId/games-played', async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Step 1: Fetch current count
    const { data: existing, error: fetchErr } = await supabase
      .from('sessions')
      .select('games_played')
      .eq('session_id', sessionId)
      .single();

    if (fetchErr) throw fetchErr;

    const newValue = (existing.games_played || 0) + 1;

    // Step 2: Update value
    const { data, error: updateErr } = await supabase
      .from('sessions')
      .update({ games_played: newValue })
      .eq('session_id', sessionId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.status(200).json({ session: data });
  } catch (err) {
    console.error('Failed to increment games_played:', err);
    return res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
})