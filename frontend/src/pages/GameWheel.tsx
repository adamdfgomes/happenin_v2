import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Wheel from '../components/Wheel';
import useGameSession from '../hooks/useGameSession';

const GameWheel: React.FC = () => {
  const { setSelectedGame } = useGameSession();
  const nav = useNavigate();
  const options = ['trivia', 'two-truths-one-lie', 'drawing'];

  const handleSelect = (game: string) => {
    setSelectedGame(game);
    nav(`/${game}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="Spin the Wheel" subtitle="Choose your mini-game!" />
      <Wheel options={options} onSelect={handleSelect} />
    </main>
  );
};

export default GameWheel;
