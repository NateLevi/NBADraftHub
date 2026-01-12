import { useState, useEffect } from 'react';
import { getPlayerData } from '../data/players/api';
import { mergeDraftData } from '../utils/mergeDraftData';
// Import markdown as raw string using Vite's ?raw suffix
import tankathonMarkdown from '../data/fireCrawl/tankathon.md?raw';

/**
 * Custom hook to fetch and merge draft data from Tankathon and Barttorvik
 * @returns {{ players: Array, loading: boolean, error: string|null, matchStats: object, refetch: function }}
 */
export function useDraftData() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchStats, setMatchStats] = useState({
    total: 0,
    matched: 0,
    unmatched: 0,
    international: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Barttorvik data from API
      const barttorvikData = await getPlayerData();
      
      // Console log one player response from the API
      console.log('API Response - First Player:', barttorvikData[0]);

      // Merge with Tankathon data
      const { players: mergedPlayers, matchStats: stats } = mergeDraftData(
        tankathonMarkdown,
        barttorvikData
      );

      // Log match results for debugging
      console.log('Draft Data Merge Results:', {
        totalPlayers: stats.total,
        matchedWithBarttorvik: stats.matched,
        unmatchedCollege: stats.unmatched,
        internationalPlayers: stats.international,
      });

      // Log any unmatched college players (not international)
      const unmatchedCollege = mergedPlayers.filter(
        p => !p.hasBarttorvikData && !p.isInternational
      );
      if (unmatchedCollege.length > 0) {
        console.log('Unmatched college players:', unmatchedCollege.map(p => ({
          name: p.name,
          school: p.currentTeam,
        })));
      }

      setPlayers(mergedPlayers);
      setMatchStats(stats);
    } catch (err) {
      console.error('Error fetching draft data:', err);
      setError(err.message || 'Failed to load draft data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    players,
    loading,
    error,
    matchStats,
    refetch: fetchData,
  };
}
