import { useState, useEffect } from 'react';
import { fetchDraftDataFromKV } from '../utils/workersKV';

// Fallback imports for development mode
import { getPlayerData } from '../data/players/api';
import { mergeDraftData } from '../utils/mergeDraftData';
import tankathonMarkdown from '../data/fireCrawl/DraftmdFiles/tankathon.md?raw';
import nbaDraftNetMarkdown from '../data/fireCrawl/DraftmdFiles/nbadraft-net.md?raw';
import espnMarkdown from '../data/fireCrawl/DraftmdFiles/espn.md?raw';

// Always use Workers KV for fast loading (data is pre-merged)
// Set VITE_USE_WORKERS_KV=false to use live APIs for testing
const USE_WORKERS_KV = import.meta.env.VITE_USE_WORKERS_KV !== 'false';

/**
 * Custom hook to fetch and merge draft data from multiple sources
 *
 * Production: Fetches pre-merged data from Workers KV (fast)
 * Development: Fetches from live APIs and merges client-side
 *
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
    sourceCounts: {
      tankathon: 0,
      nbaDraftNet: 0,
      espn: 0,
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let mergedPlayers;
      let stats;

      if (USE_WORKERS_KV) {
        // Production: Fetch pre-merged data from Workers KV
        console.log('Fetching from Workers KV (production mode)...');

        const kvData = await fetchDraftDataFromKV();
        mergedPlayers = kvData.players;
        stats = kvData.matchStats;

        console.log(`Loaded ${mergedPlayers.length} players from Workers KV`);
        console.log(`Data last updated: ${kvData.updatedAt}`);
      } else {
        // Development: Fetch from live APIs and merge
        console.log('Fetching from live APIs (development mode)...');

        // Fetch Barttorvik data from API
        const barttorvikData = await getPlayerData();
        console.log('API Response - First Player:', barttorvikData[0]);

        // Merge all sources (Tankathon + NBADraft.net + ESPN)
        const mergeResult = mergeDraftData({
          tankathonMarkdown,
          nbaDraftNetMarkdown,
          espnMarkdown,
          barttorvikData,
        });

        mergedPlayers = mergeResult.players;
        stats = mergeResult.matchStats;
      }

      // Log match results for debugging
      console.log('Draft Data Results:', {
        totalPlayers: stats.total,
        matchedWithBarttorvik: stats.matched,
        unmatchedCollege: stats.unmatched,
        internationalPlayers: stats.international,
        sourceCounts: stats.sourceCounts,
      });

      // Log any unmatched college players (not international)
      const unmatchedCollege = mergedPlayers.filter(
        p => !p.hasBarttorvikData && !p.isInternational
      );
      if (unmatchedCollege.length > 0) {
        console.log('Unmatched college players:', unmatchedCollege.map(p => ({
          name: p.name,
          school: p.currentTeam,
          consensusRank: p.consensusRank,
        })));
      }

      // Log sample players
      console.log('Sample players with source ranks:', mergedPlayers.slice(0, 5).map(p => ({
        name: p.name,
        consensus: p.consensusRank,
        tankathon: p.tankathonRank,
        nbaDraftNet: p.nbaDraftNetRank,
        espn: p.espnRank,
      })));

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
