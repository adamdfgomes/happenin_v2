// frontend/src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameSessionProvider } from './context/GameSessionContext'

import Lobby               from './pages/Lobby'
import TeamNameCreator     from './pages/TeamNameCreator'
import GroupTypeSelection  from './pages/GroupType'
import WaitingRoom         from './pages/WaitingRoom'
import Landing             from './pages/Landing'
import GameWheel           from './pages/GameWheel'
import TriviaGame          from './pages/TriviaGame'
import TwoTruthsOneLie     from './pages/TwoTruthsOneLie'
import DrawingGame         from './pages/DrawingGame'

const App: React.FC = () => (
  <BrowserRouter>
    <GameSessionProvider>
      <Routes>
        <Route path="/"                               element={<Lobby />} />
        <Route path="/team"                           element={<TeamNameCreator />} />
        <Route path="/group"                          element={<GroupTypeSelection />} />
        <Route path="/waiting"                        element={<WaitingRoom />} />
        <Route path="/landing/:sessionId"             element={<Landing />} />
        <Route path="/wheel/:sessionId"               element={<GameWheel />} />
        <Route path="/trivia/:sessionId"              element={<TriviaGame />} />
        <Route path="/two-truths-one-lie/:sessionId"  element={<TwoTruthsOneLie />} />
        <Route path="/drawing/:sessionId"             element={<DrawingGame />} />
      </Routes>
    </GameSessionProvider>
  </BrowserRouter>
)

export default App