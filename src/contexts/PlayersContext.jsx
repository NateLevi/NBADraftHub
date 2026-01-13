import { useState } from 'react';
import { PlayersContext } from './playersContextDef';
import { useDraftData } from '../hooks/useDraftData';

// Provider component
export function PlayersProvider({ children }) {
  // Use the new dynamic draft data hook
  const { players, loading, error, matchStats, refetch } = useDraftData();

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  return (
    <PlayersContext.Provider value={{
      players,
      loading,
      error,
      matchStats,
      refetch,
      selectedPlayer,
      setSelectedPlayer,
    }}>
      {children}
    </PlayersContext.Provider>
  );
} 