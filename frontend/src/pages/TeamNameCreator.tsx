import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import { useGameSession } from '../context/GameSessionContext';
import { updateTeamName } from '../utils/api';

const TeamNameSetup: React.FC = () => {
  const { setTeamName, teamId } = useGameSession();
  const [choice, setChoice] = useState<string>('');

  const nav = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choice.trim() || !teamId) return;
    try {
      // write the user’s choice into your teams table
      await updateTeamName(teamId, choice.trim());
      setTeamName(choice.trim());
      nav('/waiting');
    } catch (err) {
      console.error('Failed to update team_name:', err);
      alert('Could not save your selection. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="What's Your Team Name?" />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <label className="flex flex-col p-4 rounded-lg bg-white/10">
          <span className="font-semibold mb-2">Enter Your Team Name</span>
          <input
            type="text"
            name="teamName"
            placeholder="e.g., shaggers"
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="px-3 py-2 rounded text-black"
          />
        </label>

        <Button type="submit" disabled={!choice.trim()}>
          Next
        </Button>
      </form>
    </main>
  );
};

export default TeamNameSetup;
