/**
 * Merge multiple draft ranking sources with Barttorvik player stats
 * Creates a unified data structure with consensus rankings for the BoardTable
 * 
 * Also integrates pre-scraped international player stats from Tankathon
 */

import { parseTankathonMarkdown } from './parseTankathon';
import { parseNBADraftNetMarkdown } from './parseNBADraftNet';
import { findBarttorvikMatch, findPlayerByName, normalizeName, normalizeNameLoose } from './nameMatching';
import { getPlayerImageUrl } from './imageHelpers';

// Import pre-scraped international player stats
// Using Vite's JSON import - will be empty object if file is missing
import internationalStatsJson from '../data/fireCrawl/DraftmdFiles/international-stats.json';
const internationalStatsData = internationalStatsJson || null;

/**
 * Map Tankathon slugs to image filenames where they differ
 * Image files are stored locally at /public/players/{slug}.jpg
 */
const SLUG_TO_IMAGE_MAP = {
  'patrick-ngongba-ii': 'patrick-ngongba',
  'darius-acuff': 'darius-acuff-jr',
  'sergio-de-larrea': 'sergio-de-larrea-asenjo',
  'jojo-tugler': 'joseph-tugler',
  'johann-grunloh': 'johann-gruenloh',
};

/**
 * Get the image filename for a player slug
 * @param {string} slug - Player slug
 * @returns {string} - Image filename (without extension)
 */
function getImageSlug(slug) {
  return SLUG_TO_IMAGE_MAP[slug] || slug;
}

/**
 * Get local path for player image
 * @param {string} slug - Player slug
 * @returns {string} - Local path for player image
 */
function getPlayerPhotoUrl(slug) {
  return getPlayerImageUrl(getImageSlug(slug));
}

/**
 * Get international player stats from pre-scraped data
 * @param {string} slug - Player slug
 * @returns {object|null} - Stats object or null if not found
 */
function getInternationalStats(slug) {
  if (!internationalStatsData?.players) return null;
  const playerData = internationalStatsData.players[slug];
  return playerData?.stats || null;
}

/**
 * Map international player stats from Tankathon to our display format
 * @param {object} stats - Stats from Tankathon player page
 * @returns {object} - Mapped stats for display
 */
function mapInternationalStats(stats) {
  if (!stats) return null;

  // Stats from Tankathon are already in a compatible format
  // Just ensure all expected keys exist
  return {
    GP: stats.GP,
    MP: stats.MP,
    PTS: stats.PTS,
    FGM: stats.FGM,
    FGA: stats.FGA,
    'FG%': stats['FG%'],
    '2PM': null, // Not typically available from Tankathon
    '2PA': null,
    '2P%': null,
    '3PM': stats['3PM'],
    '3PA': stats['3PA'],
    '3P%': stats['3P%'],
    FTM: stats.FTM,
    FTA: stats.FTA,
    'FT%': stats['FT%'],
    ORB: stats.ORB,
    DRB: stats.DRB,
    TRB: stats.TRB,
    AST: stats.AST,
    STL: stats.STL,
    BLK: stats.BLK,
    'eFG%': stats['eFG%'],
    'TS%': stats['TS%'],
    USG: stats.USG,
    ORtg: stats.ORtg,
    DRtg: stats.DRtg,
    BPM: stats.BPM,
    OBPM: stats.OBPM,
    DBPM: stats.DBPM,
    team: stats.team,
    conf: null, // International players don't have conference
    source: 'tankathon', // Mark the data source
  };
}

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
    GP: bt.GP,
    MP: round(bt.Min_per),
    PTS: round(bt.pts),
    FGM: perGame(fgm),
    FGA: perGame(fga),
    'FG%': round(fgPct),
    '2PM': perGame(bt.twoPM),
    '2PA': perGame(bt.twoPA),
    '2P%': toPct(bt.twoP_per),
    '3PM': perGame(bt.TPM),
    '3PA': perGame(bt.TPA),
    '3P%': toPct(bt.TP_per),
    FTM: perGame(bt.FTM),
    FTA: perGame(bt.FTA),
    'FT%': toPct(bt.FT_per),
    ORB: round(bt.oreb),
    DRB: round(bt.dreb),
    TRB: round(bt.treb),
    AST: round(bt.ast),
    STL: round(bt.stl),
    BLK: round(bt.blk),
    'eFG%': round(bt.eFG),
    'TS%': round(bt.TS_per),
    USG: round(bt.usg),
    ORtg: round(bt.ORtg, 0),
    DRtg: round(bt.drtg, 0),
    BPM: round(bt.bpm),
    OBPM: round(bt.obpm),
    DBPM: round(bt.dbpm),
    team: bt.team,
    conf: bt.conf,
  };
}

/**
 * Generate a unique player ID from slug
 * @param {string} slug - Player slug
 * @returns {string} - Unique ID
 */
function generatePlayerId(slug) {
  return `player_${slug}`;
}

/**
 * Calculate consensus rank from available rankings (Tankathon + NBADraft.net only)
 * @param {number|null} tankathonRank
 * @param {number|null} nbaDraftNetRank
 * @returns {number} - Average of available ranks, or 999 if none
 */
function calculateConsensusRank(tankathonRank, nbaDraftNetRank) {
  const ranks = [tankathonRank, nbaDraftNetRank].filter(
    r => r !== null && r !== undefined && r > 0
  );

  if (ranks.length === 0) return 999;

  const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length;
  return Math.round(avg * 10) / 10; // Round to 1 decimal
}

/**
 * Create a slug from player name
 * @param {string} name - Player name
 * @returns {string} - URL-friendly slug
 */
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/['']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Merge draft ranking sources with Barttorvik stats
 * Uses only Tankathon and NBADraft.net for consensus rankings
 * @param {object} params
 * @param {string} params.tankathonMarkdown - Tankathon markdown content
 * @param {string} params.nbaDraftNetMarkdown - NBADraft.net markdown content
 * @param {Array} params.barttorvikData - Barttorvik player stats from API
 * @returns {{ players: Array, matchStats: object }}
 */
export function mergeDraftData({
  tankathonMarkdown,
  nbaDraftNetMarkdown,
  barttorvikData
}) {
  // Parse both sources
  const tankathonPlayers = tankathonMarkdown ? parseTankathonMarkdown(tankathonMarkdown) : [];
  const nbaDraftNetPlayers = nbaDraftNetMarkdown ? parseNBADraftNetMarkdown(nbaDraftNetMarkdown) : [];

  console.log('Parsed players - Tankathon:', tankathonPlayers.length,
    ', NBADraft.net:', nbaDraftNetPlayers.length);

  // Create a map of all unique players by normalized name
  const playerMap = new Map();

  // Add Tankathon players first (primary source)
  for (const tp of tankathonPlayers) {
    const normalizedName = normalizeName(tp.name);
    playerMap.set(normalizedName, {
      name: tp.name,
      slug: tp.slug,
      tankathonRank: tp.tankathonRank,
      nbaDraftNetRank: null,
      // Bio from Tankathon
      position: tp.position,
      school: tp.school,
      height: tp.height,
      heightInches: tp.heightInches,
      weight: tp.weight,
      year: tp.year,
      age: tp.age,
    });
  }

  // Create a loose name index for fallback matching (handles "Jr." vs no suffix cases)
  const looseNameIndex = new Map();
  for (const [strictName, player] of playerMap.entries()) {
    const looseName = normalizeNameLoose(player.name);
    if (!looseNameIndex.has(looseName)) {
      looseNameIndex.set(looseName, strictName);
    }
  }

  // Add NBADraft.net rankings (merge with existing or add new)
  for (const ndp of nbaDraftNetPlayers) {
    const normalizedName = normalizeName(ndp.name);
    let existing = playerMap.get(normalizedName);

    // Fallback: try loose matching if strict match fails
    if (!existing) {
      const looseName = normalizeNameLoose(ndp.name);
      const strictKey = looseNameIndex.get(looseName);
      if (strictKey) {
        existing = playerMap.get(strictKey);
      }
    }

    if (existing) {
      // Update existing player with NBADraft.net rank
      existing.nbaDraftNetRank = ndp.nbaDraftNetRank;
    } else {
      // New player only in NBADraft.net
      playerMap.set(normalizedName, {
        name: ndp.name,
        slug: ndp.slug || createSlug(ndp.name),
        tankathonRank: null,
        nbaDraftNetRank: ndp.nbaDraftNetRank,
        position: ndp.position,
        school: ndp.school,
        height: ndp.height,
        heightInches: ndp.heightInches,
        weight: ndp.weight,
        year: ndp.year,
        age: null,
      });
      // Add to loose index
      const looseName = normalizeNameLoose(ndp.name);
      if (!looseNameIndex.has(looseName)) {
        looseNameIndex.set(looseName, normalizedName);
      }
    }
  }

  // Convert map to array and calculate consensus ranks
  // Include all Tankathon players; use consensus when NBADraft.net also has the player
  let matched = 0;
  let unmatched = 0;
  let international = 0;
  let internationalWithStats = 0;
  let withBothSources = 0;
  let tankathonOnly = 0;

  const allPlayers = Array.from(playerMap.values());
  
  // Filter to only players who are in Tankathon (our primary source for the 60-player board)
  const tankathonBasedPlayers = allPlayers.filter(p => p.tankathonRank !== null);

  // Count stats
  tankathonBasedPlayers.forEach(p => {
    if (p.nbaDraftNetRank !== null) {
      withBothSources++;
    } else {
      tankathonOnly++;
    }
  });

  console.log(`Players: ${tankathonBasedPlayers.length} from Tankathon (${withBothSources} with both sources, ${tankathonOnly} Tankathon only)`);

  const players = tankathonBasedPlayers.map(p => {
    // Use consensus if both sources available, otherwise fall back to Tankathon rank
    const consensusRank = calculateConsensusRank(
      p.tankathonRank,
      p.nbaDraftNetRank
    );

    const isInternational = p.year === 'International';
    const barttorvikMatch = findBarttorvikMatch(p, barttorvikData);
    
    // For international players, try to get stats from pre-scraped Tankathon data
    const internationalStats = isInternational ? getInternationalStats(p.slug) : null;

    // Track stats
    let stats = null;
    let hasTankathonStats = false;
    
    if (barttorvikMatch) {
      matched++;
      stats = mapBarttorvikStats(barttorvikMatch);
    } else if (isInternational && internationalStats) {
      // International player with scraped stats
      international++;
      internationalWithStats++;
      stats = mapInternationalStats(internationalStats);
      hasTankathonStats = true;
    } else if (isInternational) {
      // International player without stats
      international++;
    } else {
      unmatched++;
    }

    return {
      // Identity
      id: generatePlayerId(p.slug),
      playerId: generatePlayerId(p.slug),
      name: p.name,
      slug: p.slug,

      // Photo URL (local path)
      photoUrl: getPlayerPhotoUrl(p.slug),

      // Rankings from each source
      tankathonRank: p.tankathonRank,
      nbaDraftNetRank: p.nbaDraftNetRank,

      // Consensus ranking (average of available ranks)
      consensusRank,

      // Bio info
      position: p.position || '',
      currentTeam: p.school || '',
      leagueType: isInternational ? 'International' : 'NCAA',
      height: p.heightInches,
      heightDisplay: p.height || '',
      weight: p.weight,
      age: p.age,
      year: p.year || 'Unknown',

      // Match info
      hasBarttorvikData: !!barttorvikMatch,
      hasTankathonStats,
      hasStats: !!stats,
      isInternational,

      // Stats (from Barttorvik for college players, Tankathon for international)
      stats,
    };
  });

  // Sort by consensus rank
  players.sort((a, b) => a.consensusRank - b.consensusRank);

  // Log some debug info
  console.log('Total unique players:', players.length);
  console.log('Sample player:', players[0]);

  return {
    players,
    matchStats: {
      total: players.length,
      matched,
      unmatched,
      international,
      internationalWithStats,
      withBothSources,
      tankathonOnly,
      sourceCounts: {
        tankathon: tankathonPlayers.length,
        nbaDraftNet: nbaDraftNetPlayers.length,
      }
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
