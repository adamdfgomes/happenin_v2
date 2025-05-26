// frontend/src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameSessionProvider } from './context/GameSessionContext'

import Lobby               from './pages/Lobby'
import Explanation         from './pages/Explanation'
import TeamNameCreator     from './pages/TeamNameCreator'
import GroupTypeSelection  from './pages/GroupType'
import WaitingRoom         from './pages/WaitingRoom'
import Landing             from './pages/Landing'
import GameWheel           from './pages/GameWheel'
import InterGameMessage    from './pages/InterGameMessage'

import TwoTruthsOneLie     from './pages/TwoTruthsOneLie/TwoTruthsOneLie'
import TTOLwaitingroom     from './pages/TwoTruthsOneLie/TTOLwaitingroom'
import TTOLanswers         from './pages/TwoTruthsOneLie/TTOLanswers'
import TTOLresults         from './pages/TwoTruthsOneLie/TTOLresults'

const App: React.FC = () => (
  <BrowserRouter>
    <GameSessionProvider>
      <Routes>
        <Route path="/"                                       element={<Lobby />} />
        <Route path="/explanation"                            element={<Explanation />} />
        <Route path="/team"                                   element={<TeamNameCreator />} />
        <Route path="/group"                                  element={<GroupTypeSelection />} />
        <Route path="/waiting"                                element={<WaitingRoom />} />
        <Route path="/landing/:sessionId"                     element={<Landing />} />
        <Route path="/wheel/:sessionId"                       element={<GameWheel />} />
        <Route path="/message/:sessionId"                     element={<InterGameMessage />} />

        <Route path="/two-truths-one-lie/:sessionId"          element={<TwoTruthsOneLie />} />
        <Route path="/two-truths-one-lie/:sessionId/waiting"  element={<TTOLwaitingroom />} />
        <Route path="/two-truths-one-lie/:sessionId/answers"  element={<TTOLanswers />} />
        <Route path="/two-truths-one-lie/:sessionId/results"  element={<TTOLresults />} />

      </Routes>
    </GameSessionProvider>
  </BrowserRouter>
)

export default App