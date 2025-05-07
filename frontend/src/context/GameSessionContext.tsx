// src/context/GameSessionContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react'

export type GameSessionContextType = {
  teamId: string | null
  setTeamId: (id: string) => void

  pubId: string | null
  pubName: string | null
  setPub: (id: string, name: string) => void

  tableNumber: number | null
  setTableNumber: (num: number) => void

  startTime: string | null
  setStartTime: (time: string) => void

  groupType: string | null
  setGroupType: (type: string) => void

  teamName: string | null
  setTeamName: (name: string) => void

  selectedGame: string | null
  setSelectedGame: (game: string) => void

  sessionId: string | null
  setSessionId: (id: string) => void

  player1TeamName: string | null
  setPlayer1TeamName: (name: string) => void

  player2TeamName: string | null
  setPlayer2TeamName: (name: string) => void

  player1Id: string | null
  setPlayer1Id: (id: string) => void

  player2Id: string | null
  setPlayer2Id: (id: string) => void

  player1Ready: boolean
  setPlayer1Ready: (ready: boolean) => void

  player2Ready: boolean
  setPlayer2Ready: (ready: boolean) => void
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined)

type ProviderProps = { children: ReactNode }
export const GameSessionProvider: React.FC<ProviderProps> = ({ children }) => {
  const [teamId, setTeamId] = useState<string | null>(null)
  const [pubId, setPubId] = useState<string | null>(null)
  const [pubName, setPubName] = useState<string | null>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [groupType, setGroupType] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const [player1TeamName, setPlayer1TeamName] = useState<string | null>(null)
  const [player2TeamName, setPlayer2TeamName] = useState<string | null>(null)

  const [player1Id, setPlayer1Id] = useState<string | null>(null)
  const [player2Id, setPlayer2Id] = useState<string | null>(null)

  // New ready flags
  const [player1Ready, setPlayer1Ready] = useState<boolean>(false)
  const [player2Ready, setPlayer2Ready] = useState<boolean>(false)

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
        startTime,
        setStartTime,
        groupType,
        setGroupType,
        teamName,
        setTeamName,
        selectedGame,
        setSelectedGame,
        sessionId,
        setSessionId,
        player1TeamName,
        setPlayer1TeamName,
        player2TeamName,
        setPlayer2TeamName,
        player1Id,
        setPlayer1Id,
        player2Id,
        setPlayer2Id,
        player1Ready,
        setPlayer1Ready,
        player2Ready,
        setPlayer2Ready,
      }}
    >
      {children}
    </GameSessionContext.Provider>
  )
}

export function useGameSession(): GameSessionContextType {
  const context = useContext(GameSessionContext)
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider')
  }
  return context
}
