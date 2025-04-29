import React from 'react';
import Header from '../components/Header';
import useGameSession from '../hooks/useGameSession';

const TwoTruthsOneLie: React.FC = () => {
  const { teamNames } = useGameSession();
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 text-white p-4 flex flex-col items-center">
      <Header title="Two Truths & One Lie" subtitle={`Teams: ${teamNames.join(' vs ')}`} />
      <p className="mt-6">[Placeholder for Two Truths & One Lie]</p>
    </main>
  );
};

export default TwoTruthsOneLie;
