// src/context/GameSessionContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react';

export type GameSessionContextType = {
  teamId: string | null;
  setTeamId: (id: string) => void;

  pubId: string | null;
  pubName: string | null;
  setPub: (id: string, name: string) => void;

  tableNumber: number | null;
  setTableNumber: (num: number) => void;

  startTime: string | null;
  setStartTime: (time: string) => void;

  groupType: string | null;
  setGroupType: (type: string) => void;

  teamName: string | null;
  setTeamName: (name: string) => void;

  selectedGame: string | null;
  setSelectedGame: (game: string) => void;

  sessionId: string | null;
  setSessionId: (id: string) => void;

  // NEW: player team names
  player1TeamName: string | null;
  setPlayer1TeamName: (name: string) => void;

  player2TeamName: string | null;
  setPlayer2TeamName: (name: string) => void;
};

const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

type ProviderProps = { children: ReactNode };
export const GameSessionProvider: React.FC<ProviderProps> = ({ children }) => {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [pubId, setPubId] = useState<string | null>(null);
  const [pubName, setPubName] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [groupType, setGroupType] = useState<string | null>(null);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // NEW state for player team names
  const [player1TeamName, setPlayer1TeamName] = useState<string | null>(null);
  const [player2TeamName, setPlayer2TeamName] = useState<string | null>(null);

  const setPub = (id: string, name: string) => {
    setPubId(id);
    setPubName(name);
  };

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
        player1TeamName,        // NEW
        setPlayer1TeamName,     // NEW
        player2TeamName,        // NEW
        setPlayer2TeamName,     // NEW
      }}
    >
      {children}
    </GameSessionContext.Provider>
  );
};

export function useGameSession(): GameSessionContextType {
  const context = useContext(GameSessionContext);
  if (!context) {
    throw new Error('useGameSession must be used within a GameSessionProvider');
  }
  return context;
}
