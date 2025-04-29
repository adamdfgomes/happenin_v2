  // src/utils/api.ts

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/**
 * Create a new team record in the backend.
 * @param selectedPub  ID of the pub.
 * @param tableNumber  Table number at the pub.
 */
export const postTeamData = async (
  selectedPub: string,
  tableNumber: string
): Promise<{
  team_id: string;
  pub_name: string;
  table_number: string;
  created_at: string;
}> => {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      pub_name: selectedPub,
      table_number: tableNumber,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API error (${res.status}): ${errorBody}`);
  }

  // backend returns an array of inserted rows; take the first
  const data = await res.json();
  return data[0];
 };

/**
* Patch a team’s group_type
*/
export const updateTeamGroupType = async (
  teamId: string,
  groupType: string
): Promise<void> => {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ group_type: groupType }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update group type: ${err}`);
  }
};

export const updateTeamName = async (
  teamId: string,
  teamName: string
): Promise<void> => {
  const res = await fetch(`/api/teams/${teamId}`, {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ team_name: teamName }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to update team name: ${err}`);
  }
};


/**
 * (Optional) Retrieve list of pubs for dropdowns, etc.
 */
export const getPubs = async (): Promise<{ id: string; name: string }[]> => {
  const res = await fetch('/api/pubs');
  if (!res.ok) throw new Error('Failed to fetch pubs');
  return res.json();
};
