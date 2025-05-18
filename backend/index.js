// index.js (backend)
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './utils/supabaseClient.js';

// Polyfill for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// --- Team endpoints ---

// GET /api/teams?pub_name=…&table_number=…
app.get('/api/teams', async (req, res) => {
  const { pub_name, table_number } = req.query;
  if (!pub_name || !table_number) {
    return res
      .status(400)
      .json({ error: 'Missing query params: pub_name and table_number are required' });
  }
  try {
    const { data, error, status } = await supabase
      .from('teams')
      .select()
      .eq('pub_name', pub_name)
      .eq('table_number', table_number);

    if (error) {
      console.error('[GET /api/teams] Supabase error:', { status, error });
      return res.status(status || 500).json({ error: error.message });
    }
    return res.json(data);
  } catch (err) {
    console.error('[GET /api/teams] unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new team record
app.post('/api/teams', async (req, res) => {
  const { table_number, pub_name } = req.body;
  if (!table_number || !pub_name) {
    return res
      .status(400)
      .json({ error: 'Missing required fields: table_number, pub_name' });
  }

  try {
    const { data, error, status } = await supabase
      .from('teams')
      .insert([{ table_number, pub_name }]);

    console.log('Supabase response:', { status, error, data });
    if (error) {
      console.error('Supabase insert error:', { status, error });
      return res.status(status || 500).json({ error: error.message });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/teams/:teamId
app.get('/api/teams/:teamId', async (req, res) => {
  const { teamId } = req.params;
  try {
    const { data, error, status } = await supabase
      .from('teams')
      .select()
      .eq('team_id', teamId);

    if (error) {
      console.error('[GET /api/teams/:teamId] Supabase error:', { status, error });
      return res.status(status || 500).json({ error: error.message });
    }
    return res.json(data);
  } catch (err) {
    console.error('[GET /api/teams/:teamId] unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/teams/:teamId
app.patch('/api/teams/:teamId', async (req, res) => {
  const { teamId } = req.params;
  // now also accept `matched` (and session_id if needed)
  const { team_name, group_type, matched, session_id } = req.body;

  // Build a dynamic update object
  const updateData = {};
  if (team_name     !== undefined) updateData.team_name    = team_name;
  if (group_type    !== undefined) updateData.group_type   = group_type;
  if (matched       !== undefined) updateData.matched      = matched;
  if (session_id    !== undefined) updateData.session_id   = session_id;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' });
  }

  try {
    const { data, error, status } = await supabase
      .from('teams')
      .update(updateData)
      .eq('team_id', teamId)
      .select();

    if (error) {
      console.error('[PATCH /api/teams] Supabase error:', { status, error });
      return res.status(status || 500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[PATCH /api/teams] unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Session endpoints ---

// GET /api/sessions/:sessionId
app.get('/api/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const { data, error, status } = await supabase
      .from('sessions')
      .select('session_id, selected_game, player1_ready, player2_ready, start_time')
      .eq('session_id', sessionId)
      .single();

    if (error) {
      console.error('[GET /api/sessions/:sessionId] Supabase error:', { status, error });
      return res.status(status || 500).json({ error: error.message });
    }
    return res.json(data);
  } catch (err) {
    console.error('[GET /api/sessions/:sessionId] unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/sessions/:sessionId
app.patch('/api/sessions/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { selected_game, player1_ready, player2_ready } = req.body;

  const updateData = {};
  if (selected_game  !== undefined) updateData.selected_game  = selected_game;
  if (player1_ready !== undefined) updateData.player1_ready = player1_ready;
  if (player2_ready !== undefined) updateData.player2_ready = player2_ready;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' });
  }

  try {
    const { data, error, status } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('session_id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('[PATCH /api/sessions/:sessionId] Supabase error:', { status, error });
      return res.status(status || 500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[PATCH /api/sessions/:sessionId] unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files and fallback...
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.use('/api/*', (_req, res) => res.status(404).json({ error: 'API endpoint not found' }));
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, '../frontend/dist/index.html')));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
