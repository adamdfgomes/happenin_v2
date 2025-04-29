import React from 'react';
import Header from '../components/Header';
import useGameSession from '../hooks/useGameSession';

const DrawingGame: React.FC = () => {
  const { teamNames } = useGameSession();
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 text-white p-4 flex flex-col items-center">
      <Header title="Drawing Challenge" subtitle={`Teams: ${teamNames.join(' vs ')}`} />
      <p className="mt-6">[Placeholder for Drawing Game]</p>
    </main>
  );
};

export default DrawingGame;
