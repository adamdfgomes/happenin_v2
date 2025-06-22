// frontend/src/App.tsx
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameSessionProvider } from './context/GameSessionContext'

import Lobby               from './pages/SignUp/Lobby'
import Explanation         from './pages/SignUp/Explanation'
import TeamNameCreator     from './pages/SignUp/TeamNameCreator'
import GroupTypeSelection  from './pages/SignUp/GroupType'
import WaitingRoom         from './pages/Matchmaking/WaitingRoom'
import Landing             from './pages/Matchmaking/Landing'
import GameWheel           from './pages/Matchmaking/GameWheel'
import IntroMessage        from './pages/Messages/IntroMessage'
import MessageReceive      from './pages/Messages/MessageReceive'
import Chatroom            from './pages/Messages/Chatroom'
import ReadyUp             from './pages/General/ReadyUp'

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
        <Route path="/message/:sessionId"                     element={<IntroMessage />} />
        <Route path="/messagereceive/:sessionId"              element={<MessageReceive />} />
        <Route path="/chat/:sessionId"                        element={<Chatroom />} />
        <Route path="/readyup/:sessionId"                     element={<ReadyUp />} />

        <Route path="/two-truths-one-lie/:sessionId"          element={<TwoTruthsOneLie />} />
        <Route path="/two-truths-one-lie/:sessionId/waiting"  element={<TTOLwaitingroom />} />
        <Route path="/two-truths-one-lie/:sessionId/answers"  element={<TTOLanswers />} />
        <Route path="/two-truths-one-lie/:sessionId/results"  element={<TTOLresults />} />

      </Routes>
    </GameSessionProvider>
  </BrowserRouter>
)

export default App