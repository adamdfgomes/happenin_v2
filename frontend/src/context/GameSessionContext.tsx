import React, { createContext, useState, ReactNode } from 'react';

interface GameSessionContextType {
  teamName: string[];
  setTeamName: (names: string[]) => void;
  teamId: string;
  setTeamId: (id: string) => void;
  groupType: string;
  setGroupType: (type: string) => void;
  pubName: string;
  setPubName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (num: string) => void;
  selectedGame: string;
  setSelectedGame: (game: string) => void;
}

export const GameSessionContext = createContext<GameSessionContextType | undefined>(undefined);

export const GameSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teamName, setTeamName] = useState<string[]>([]);
  const [teamId, setTeamId] = useState<string>('');
  const [groupType, setGroupType] = useState<string>('');
  const [pubName, setPubName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('');

  return (
    <GameSessionContext.Provider
      value={{
        teamName, setTeamName,
        teamId,   setTeamId,
        groupType, setGroupType,
        pubName, setPubName,
        tableNumber, setTableNumber,
        selectedGame, setSelectedGame
      }}
    >
      {children}
    </GameSessionContext.Provider>
  );
};
