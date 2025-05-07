import React from 'react';
import Header from '../components/Header';

const TriviaGame: React.FC = () => (
  <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex items-center justify-center text-white p-4">
    <Header title="Trivia" />
  </main>
);

export default TriviaGame;