// backend/index.js

import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabaseClient.js';

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

// Update one or more fields on a team
app.patch('/api/teams/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const { team_name, group_type } = req.body;

  // Build a dynamic update object
  const updateData = {};
  if (team_name !== undefined) updateData.team_name = team_name;
  if (group_type !== undefined) updateData.group_type = group_type;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' });
  }

  try {
    const { data, error, status } = await supabase
      .from('teams')
      .update(updateData)
      .eq('team_id', teamId)
      .select(); // return the updated row

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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle API 404s
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Fallback: serve index.html for any other route (client-side routing)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
