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

// PATCH: whitelist only session fields (selected_game, player1_ready, player2_ready)
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
+ * POST a chat message for a session/team.
+ */
 app.post('/api/messages', async (req, res) => {
   const { session_id, team_id, text } = req.body
   if (!session_id || !team_id || typeof text !== 'string') {
     return res.status(400).json({ error: 'session_id, team_id and text are required' })
   }
   try {
     const { data, error, status } = await supabase
       .from('messages')
       .insert([{ session_id, team_id, text }])
       .select()
       .single()
     if (error) {
       return res.status(status || 500).json({ error: error.message })
     }
     return res.status(201).json(data)
   } catch (err) {
     console.error('Message insert error', err)
     return res.status(500).json({ error: 'Internal server error' })
   }
 })

// PATCH: set a TTOL row’s ready flags
app.patch('/api/twolies/:sessionId/ready', async (req, res) => {
  const { sessionId } = req.params
  const updates = {}
  if (req.body.player1_ready === true) updates.player1_ready = true
  if (req.body.player2_ready === true) updates.player2_ready = true

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .json({ error: 'Must send { player1_ready: true } or { player2_ready: true }' })
  }

  try {
    const { data, error, status } = await supabase
      .from('two-truths-one-lie')
      .update(updates)
      .eq('session_id', sessionId)
      .select()
      .single()

    if (error) {
      return res.status(status || 500).json({ error: error.message })
    }
    return res.json(data)
  } catch (err) {
    console.error('TTOL ready update error', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
})


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
