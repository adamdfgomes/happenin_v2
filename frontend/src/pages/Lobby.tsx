import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import Select from '../components/Select';
import NumberInput from '../components/NumberInput';
import usePubs from '../hooks/usePubs';
import { postTeamData } from '../utils/api';
import useGameSession from '../hooks/useGameSession';

const Lobby: React.FC = () => {
  const nav = useNavigate();
  const [selectedPub, setSelectedPub] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const { pubs, loading, error } = usePubs();
  const { setTeamId } = useGameSession();

  if (loading) {
    return (
      <main className="min-h-screen …">
        <Header title="Welcome to Matching Game" subtitle="Loading pubs…" />
        <p>Loading pubs…</p>
      </main>
    );
  }
  if (error) {
    return (
      <main className="min-h-screen …">
        <Header title="Welcome to Matching Game" subtitle="Error" />
        <p className="error">{error}</p>
      </main>
    );
  }
  const pubOptions = pubs.map((pub: { id: string; name: string }) => ({
    value: pub.name,
    label: pub.name
  }));

  const handleStartGame = async () => {
  // 1. Validate both fields before doing anything
  if (!selectedPub) {
    alert('Please select a pub before starting');
    return;
  }
  if (!tableNumber.trim()) {
    alert('Please enter a table number before starting');
    return;
  }

  // 2. Attempt to post, then navigate on success
  try {
    const created = await postTeamData(selectedPub, tableNumber);
    setTeamId(created.team_id);
    setSelectedPub(created.pub_name);
    setTableNumber(created.table_number);
    nav('/team');

  } catch (error) {
    console.error('Error posting team data:', error);
    alert('Failed to start game. Please try again.');
  }
};
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <img 
        src="/images/logov1.png" 
        alt="Happenin Logo" 
        className="w-64 h-auto mb-2"
      />
      <Header title="Welcome to Mingle" subtitle="Get started by setting up your teams" />
      
      <div className="w-full max-w-md space-y-4 mb-6">
        <Select
          options={pubOptions}
          value={selectedPub}
          onChange={setSelectedPub}
          placeholder="Select pub"
          className="w-full"
        />
        <NumberInput
          value={tableNumber}
          onChange={setTableNumber}
          placeholder="Enter table number"
          className="w-full"
          min={1}
          max={100}
        />
      </div>

      <Button 
        onClick={handleStartGame}
        disabled={!selectedPub || !tableNumber}
      >
        Start Game
      </Button>
    </main>
  );
};

export default Lobby;