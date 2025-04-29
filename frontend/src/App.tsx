import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameSessionProvider } from './context/GameSessionContext';
import Lobby from './pages/Lobby';
import TeamSetup from './pages/GroupType';
import TeamNameCreator from './pages/TeamNameCreator';
import GameWheel from './pages/GameWheel';
import TriviaGame from './pages/TriviaGame';
import TwoTruthsOneLie from './pages/TwoTruthsOneLie';
import DrawingGame from './pages/DrawingGame';
import WaitingRoom from './pages/WaitingRoom';

const App: React.FC = () => (
  <GameSessionProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/team" element={<TeamSetup />} />
        <Route path="/name" element={<TeamNameCreator />} />
        <Route path="/waiting" element={<WaitingRoom />} />
        <Route path="/wheel" element={<GameWheel />} />
        <Route path="/trivia" element={<TriviaGame />} />
        <Route path="/two-truths-one-lie" element={<TwoTruthsOneLie />} />
        <Route path="/drawing" element={<DrawingGame />} />

      </Routes>
    </BrowserRouter>
  </GameSessionProvider>
);

export default App;
