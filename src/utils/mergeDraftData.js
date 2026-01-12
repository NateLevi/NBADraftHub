/**
 * Merge Tankathon draft rankings with Barttorvik player stats
 * Creates a unified data structure for the BoardTable
 */

import { parseTankathonMarkdown } from './parseTankathon';
import { findBarttorvikMatch } from './nameMatching';

/**
 * Map Barttorvik stats to our display format
 * Note: pts, ast, treb, stl, blk are already per-game averages
 * But FTM, FTA, twoPM, twoPA, TPM, TPA are totals (need to divide by GP)
 * @param {object} bt - Barttorvik player stats
 * @returns {object} - Mapped stats for display
 */
function mapBarttorvikStats(bt) {
  if (!bt) return null;

  const gp = bt.GP || 1;

  // Helper to safely round numbers
  const round = (val, decimals = 1) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };

  // Helper to convert decimal to percentage
  const toPct = (val) => {
    if (val === null || val === undefined || isNaN(val)) return null;
    // If value is already > 1, it's probably already a percentage
    if (val > 1) return round(val);
    return round(val * 100);
  };

  // Calculate per-game for counting stats that are totals
  const perGame = (total) => {
    if (total === null || total === undefined || isNaN(total)) return null;
    return round(total / gp);
  };

  // Calculate FG totals (2P + 3P)
  const fgm = (bt.twoPM || 0) + (bt.TPM || 0);
  const fga = (bt.twoPA || 0) + (bt.TPA || 0);
  const fgPct = fga > 0 ? (fgm / fga) * 100 : null;

  return {
    // Game info
    GP: bt.GP,
    MP: round(bt.Min_per), // Min_per is already per-game

    // Scoring - pts is already per-game
    PTS: round(bt.pts),

    // Field Goals - these are totals, convert to per-game
    FGM: perGame(fgm),
    FGA: perGame(fga),
    'FG%': round(fgPct),

    // 2-pointers - totals, convert to per-game
    '2PM': perGame(bt.twoPM),
    '2PA': perGame(bt.twoPA),
    '2P%': toPct(bt.twoP_per),

    // 3-pointers - totals, convert to per-game
    '3PM': perGame(bt.TPM),
    '3PA': perGame(bt.TPA),
    '3P%': toPct(bt.TP_per),

    // Free throws - totals, convert to per-game
    FTM: perGame(bt.FTM),
    FTA: perGame(bt.FTA),
    'FT%': toPct(bt.FT_per),

    // Rebounds - already per-game
    ORB: round(bt.oreb),
    DRB: round(bt.dreb),
    TRB: round(bt.treb),

    // Other stats - already per-game
    AST: round(bt.ast),
    STL: round(bt.stl),
    BLK: round(bt.blk),

    // Advanced stats
    'eFG%': round(bt.eFG), // Already a percentage
    'TS%': round(bt.TS_per), // Already a percentage
    USG: round(bt.usg),
    ORtg: round(bt.ORtg, 0),
    DRtg: round(bt.drtg, 0),
    BPM: round(bt.bpm),
    OBPM: round(bt.obpm),
    DBPM: round(bt.dbpm),

    // Team info
    team: bt.team,
    conf: bt.conf,
  };
}

/**
 * Generate a unique player ID from tankathon data
 * @param {object} tankathonPlayer - Tankathon player object
 * @returns {string} - Unique ID
 */
function generatePlayerId(tankathonPlayer) {
  return `tank_${tankathonPlayer.slug}`;
}

/**
 * Merge Tankathon and Barttorvik data into unified player objects
 * @param {string} tankathonMarkdown - Raw markdown content from tankathon.md
 * @param {Array} barttorvikData - Array of Barttorvik player stats from API
 * @returns {{ players: Array, matchStats: object }}
 */
export function mergeDraftData(tankathonMarkdown, barttorvikData) {
  // Parse Tankathon markdown
  const tankathonPlayers = parseTankathonMarkdown(tankathonMarkdown);

  console.log('Parsed Tankathon players:', tankathonPlayers.length);
  console.log('First 3 players:', tankathonPlayers.slice(0, 3));

  let matched = 0;
  let unmatched = 0;
  let international = 0;

  const players = tankathonPlayers.map(tp => {
    const isInternational = tp.year === 'International';
    const barttorvikMatch = findBarttorvikMatch(tp, barttorvikData);

    // Track stats
    if (barttorvikMatch) {
      matched++;
    } else if (isInternational) {
      international++;
    } else {
      unmatched++;
    }

    // Map Barttorvik stats
    const stats = barttorvikMatch ? mapBarttorvikStats(barttorvikMatch) : null;

    return {
      // Identity
      id: generatePlayerId(tp),
      playerId: generatePlayerId(tp),
      name: tp.name,

      // Draft info (from Tankathon)
      tankathonRank: tp.tankathonRank,
      position: tp.position,
      currentTeam: tp.school,
      leagueType: isInternational ? 'International' : 'NCAA',

      // Bio (from Tankathon)
      height: tp.heightInches,
      heightDisplay: tp.height,
      weight: tp.weight,
      age: tp.age,
      year: tp.year,

      // Match info
      hasBarttorvikData: !!barttorvikMatch,
      isInternational,

      // Stats (from Barttorvik)
      stats,

      // Keep raw references for debugging
      _tankathon: tp,
      _barttorvik: barttorvikMatch,
    };
  });

  return {
    players,
    matchStats: {
      total: tankathonPlayers.length,
      matched,
      unmatched,
      international,
    }
  };
}

/**
 * Get a display-friendly version of stats
 * Returns "N/A" for missing values
 * @param {object} player - Merged player object
 * @param {string} statKey - Stat key like 'PTS', 'AST', etc.
 * @returns {string|number}
 */
export function getStatDisplay(player, statKey) {
  if (!player.stats) return 'N/A';
  const value = player.stats[statKey];
  if (value === null || value === undefined) return 'N/A';
  return value;
}
