import React, { createContext, useContext, useState, ReactNode, FC } from 'react'

// Define the shape of our context
export interface GameSessionContextType {
  teamId: string | null
  setTeamId: (id: string) => void
  pubId: string | null
  pubName: string | null
  setPub: (id: string, name: string) => void
  tableNumber: number | null
  setTableNumber: (num: number) => void

  selectedGame: string | null
  setSelectedGame: (game: string) => void
  startTime: string | null
  setStartTime: (time: string) => void
  groupType: string | null
  setGroupType: (type: string) => void

  teamName: string | null
  setTeamName: (name: string) => void
  players: string[]
  setPlayers: (players: string[]) => void

  sessionId: string | null
  setSessionId: (id: string) => void

  player1Id: string | null
  setPlayer1Id: (id: string) => void
  player2Id: string | null
  setPlayer2Id: (id: string) => void
  player1Ready: boolean
  setPlayer1Ready: (ready: boolean) => void
  player2Ready: boolean
  setPlayer2Ready: (ready: boolean) => void

  resetSession: () => void
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined)

type ProviderProps = { children: ReactNode }
export const GameSessionProvider: FC<ProviderProps> = ({ children }) => {
  const [teamId, setTeamId] = useState<string | null>(null)
  const [pubId, setPubId] = useState<string | null>(null)
  const [pubName, setPubName] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [groupType, setGroupType] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string | null>(null)
  const [players, setPlayers] = useState<string[]>([])

  const [sessionId, setSessionId] = useState<string | null>(null)

  const [player1Id, setPlayer1Id] = useState<string | null>(null)
  const [player2Id, setPlayer2Id] = useState<string | null>(null)
  const [player1Ready, setPlayer1Ready] = useState<boolean>(false)
  const [player2Ready, setPlayer2Ready] = useState<boolean>(false)

  // Clears only session-specific bits so we can re-queue
  const resetSession = () => {
    setSessionId(null)
    // leave startTime intact so waiting room still has the pub kickoff
    setPlayer1Ready(false)
    setPlayer2Ready(false)
  }

  const setPub = (id: string, name: string) => {
    setPubId(id)
    setPubName(name)
  }

  return (
    <GameSessionContext.Provider
      value={{
        teamId,
        setTeamId,
        pubId,
        pubName,
        setPub,
        tableNumber,
        setTableNumber,
        selectedGame,
        setSelectedGame,
        startTime,
        setStartTime,
        groupType,
        setGroupType,
        teamName,
        setTeamName,
        players,
        setPlayers,
        sessionId,
        setSessionId,
        player1Id,
        setPlayer1Id,
        player2Id,
        setPlayer2Id,
        player1Ready,
        setPlayer1Ready,
        player2Ready,
        setPlayer2Ready,
        resetSession,
      }}
    >
      {children}
    </GameSessionContext.Provider>
  )
}

export const useGameSession = (): GameSessionContextType => {
  const context = useContext(GameSessionContext)
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider')
  }
  return context
}