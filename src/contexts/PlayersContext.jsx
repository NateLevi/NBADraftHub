import { useState } from 'react';
import { PlayersContext } from './playersContextDef';
import { useDraftData } from '../hooks/useDraftData';

// Provider component
export function PlayersProvider({ children }) {
  // Use the new dynamic draft data hook
  const { players, loading, error, matchStats, refetch } = useDraftData();

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [scoutingReports, setScoutingReports] = useState([]);

  const addScoutingReport = (newReport) => {
    setScoutingReports(prev => [...prev, newReport]);
  };

  return (
    <PlayersContext.Provider value={{
      players,
      loading,
      error,
      matchStats,
      refetch,
      selectedPlayer,
      setSelectedPlayer,
      scoutingReports,
      addScoutingReport
    }}>
      {children}
    </PlayersContext.Provider>
  );
} 