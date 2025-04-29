import React from 'react';
import Header from '../components/Header';
import useGameSession from '../hooks/useGameSession';

const TriviaGame: React.FC = () => {
  const { teamNames } = useGameSession();
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 text-white p-4 flex flex-col items-center">
      <Header title="Trivia Quiz" subtitle={`Teams: ${teamNames.join(' vs ')}`} />
      <p className="mt-6">[Placeholder for Trivia Game]</p>
    </main>
  );
};

export default TriviaGame;
