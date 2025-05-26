const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Fetch a single team (including session_id) by its UUID.
 */
export async function getTeamData(
  teamId: string
): Promise<{
  team_id: string
  pub_name: string
  table_number: string
  created_at: string
  group_type?: string
  team_name?: string
  session_id?: string
}> {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: 'GET',
    headers: JSON_HEADERS,
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`API error (${res.status}): ${errorBody}`)
  }

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`Team ${teamId} not found`)
  }

  return data[0]
}

/**
 * Fetch a team by pub name and table number.
 */
export async function getTeamByPubAndTable(
  pubName: string,
  tableNumber: number
): Promise<{
  team_id: string
  pub_name: string
  table_number: string
  created_at: string
}> {
  const query = new URLSearchParams({
    pub_name: pubName,
    table_number: String(tableNumber),
  })
  const res = await fetch(`/api/teams?${query.toString()}`, {
    method: 'GET',
    headers: JSON_HEADERS,
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`API error (${res.status}): ${errorBody}`)
  }

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(
      `No team found for pub ${pubName} at table ${tableNumber}`
    )
  }

  return data[0]
}

/**
 * Create a new team record in the backend.
 */
export async function postTeamData(
  selectedPub: string,
  tableNumber: number
): Promise<{
  team_id: string
  pub_name: string
  table_number: string
  created_at: string
}> {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ pub_name: selectedPub, table_number: tableNumber }),
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`API error (${res.status}): ${errorBody}`)
  }

  const data = await res.json()
  return data[0]
}

/**
 * Patch a team's group_type.
 */
export async function updateTeamGroupType(
  teamId: string,
  groupType: string
): Promise<void> {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ group_type: groupType }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update group type: ${err}`)
  }
}

/**
 * Patch a team's team_name.
 */
export async function updateTeamName(
  teamId: string,
  teamName: string
): Promise<void> {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ team_name: teamName }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update team name: ${err}`)
  }
}

/**
 * Flip a team's matched flag back to false so
 * it re-enters the matchmaking queue.
 */
export async function rematchTeam(
  teamId: string
): Promise<void> {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ matched: false }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to rematch team: ${err}`)
  }
}

/**
 * Fetch a session’s details via the single-object route.
 */
export async function getSessionData(
  sessionId: string
): Promise<{
  session_id: string
  selected_game?: string
  player1_ready?: boolean
  player2_ready?: boolean
  start_time?: string
}> {
  const res = await fetch(`/api/sessions/${sessionId}`, {
    method: 'GET',
    headers: JSON_HEADERS,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to fetch session: ${err}`)
  }

  // This endpoint returns a single JSON object
  return res.json()
}

/**
 * Persist the selected game for a session.
 */
export async function updateSessionGame(
  sessionId: string,
  selected_game: string
): Promise<void> {
  const res = await fetch(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ selected_game }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update session game: ${err}`)
  }
}

/**
 * Persist a player's ready flag for a session.
 */
export async function updateSessionReady(
  sessionId: string,
  playerSlot: 1 | 2,
  ready: boolean
): Promise<void> {
  const field = playerSlot === 1 ? 'player1_ready' : 'player2_ready'
  const res = await fetch(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ [field]: ready }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Failed to update ready status: ${err}`)
  }
}

/**
 * Persist a player's truths and lies.
 */
export async function postTTOLAnswers(
  sessionId: string,
  answers: {
    p1_truth1?: string
    p1_truth2?: string
    p1_lie?:    string
    p2_truth1?: string
    p2_truth2?: string
    p2_lie?:    string
  }
): Promise<{ session_id: string }> {
  const res = await fetch('/api/twolies', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ session_id: sessionId, ...answers }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error saving TTOL answers: ${err}`)
  }
  return res.json()
}
