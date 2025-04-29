// frontend/src/pages/WaitingRoom.tsx

import React from 'react';
import Header from '../components/Header';

const WaitingRoom: React.FC = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex flex-col items-center justify-center text-white p-4">
      <Header title="Hold Tight!" />

      <div className="flex flex-col items-center gap-6 mt-10">
        <div className="text-5xl font-mono tracking-widest">
          01:00:00
        </div>
        <div className="text-xl font-semibold text-center">
          Waiting for the games to begin
        </div>
      </div>
    </main>
  );
};

export default WaitingRoom;
