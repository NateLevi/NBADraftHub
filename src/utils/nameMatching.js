/**
 * Name matching utilities to match Tankathon players with Barttorvik data
 * Handles variations like "AJ" vs "A.J.", "Jr." vs "Jr", etc.
 */

/**
 * Normalize a player name for comparison
 * @param {string} name - Player name
 * @returns {string} - Normalized name
 */
export function normalizeName(name) {
  if (!name) return '';

  return name
    .toLowerCase()
    .replace(/\./g, '')              // Remove periods (A.J. → AJ)
    .replace(/['']/g, '')            // Remove apostrophes
    .replace(/\s+/g, ' ')            // Normalize whitespace
    .replace(/[^\w\s]/g, '')         // Remove special chars except spaces
    // NOTE: We no longer remove suffixes (jr, sr, ii, iii) because some sources
    // use them inconsistently (e.g., "Tarris Reed Jr." vs "Tarris Reed" for same player)
    // The merge logic handles this with a separate fallback matching step
    .trim();
}

/**
 * Normalize name MORE aggressively (removes suffixes) for fallback matching
 * @param {string} name - Player name
 * @returns {string} - Normalized name without suffixes
 */
export function normalizeNameLoose(name) {
  if (!name) return '';

  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/['']/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\b(jr|sr|ii|iii|iv|v)\b/gi, '') // Remove suffixes for loose matching
    .replace(/\s+/g, ' ')            // Clean up double spaces from removed suffixes
    .trim();
}

/**
 * Normalize school/team name for comparison
 * @param {string} school - School or team name
 * @returns {string} - Normalized name
 */
export function normalizeSchool(school) {
  if (!school) return '';

  const schoolMappings = {
    'north carolina': 'unc',
    'uconn': 'connecticut',
    'university of connecticut': 'connecticut',
    'st. john\'s': 'st johns',
    'saint john\'s': 'st johns',
    'nc state': 'north carolina state',
    'lsu': 'louisiana state',
    'ole miss': 'mississippi',
    'usc': 'southern california',
    'ucla': 'ucla',
    'ucf': 'central florida',
    'smu': 'southern methodist',
    'tcu': 'texas christian',
    'unlv': 'nevada las vegas',
    'vcu': 'virginia commonwealth',
  };

  const normalized = school.toLowerCase().replace(/[^\w\s]/g, '').trim();
  return schoolMappings[normalized] || normalized;
}

/**
 * Calculate similarity between two strings (simple Levenshtein-based)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} - Similarity score (0-1, 1 = exact match)
 */
function calculateSimilarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;

  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.length === 0) return 1;

  // Simple substring check
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  // Check if one name contains the other's last name
  const aWords = a.split(' ');
  const bWords = b.split(' ');
  const aLast = aWords[aWords.length - 1];
  const bLast = bWords[bWords.length - 1];

  if (aLast === bLast) {
    return 0.8; // Same last name
  }

  return 0;
}

/**
 * Known manual overrides for problematic matches
 * Format: { normalizedTankathonName: barttorvikPlayerName }
 */
const MANUAL_OVERRIDES = {
  // Add any known problem matches here
  // 'aj dybantsa': 'A.J. Dybantsa',
};

/**
 * Find the best Barttorvik match for a Tankathon player
 * @param {object} tankathonPlayer - Player object from Tankathon parser
 * @param {Array} barttorvikPlayers - Array of Barttorvik player stats
 * @returns {object|null} - Matching Barttorvik player or null
 */
export function findBarttorvikMatch(tankathonPlayer, barttorvikPlayers) {
  if (!barttorvikPlayers || barttorvikPlayers.length === 0) {
    return null;
  }

  const normalizedTankathon = normalizeName(tankathonPlayer.name);
  const tankathonSchool = normalizeSchool(tankathonPlayer.school);

  // Check manual overrides first
  if (MANUAL_OVERRIDES[normalizedTankathon]) {
    const overrideName = MANUAL_OVERRIDES[normalizedTankathon];
    const match = barttorvikPlayers.find(bp => bp.player_name === overrideName);
    if (match) return match;
  }

  // Try exact normalized name match
  let match = barttorvikPlayers.find(
    bp => normalizeName(bp.player_name) === normalizedTankathon
  );
  if (match) return match;

  // Try matching with school as secondary filter (helps with common names)
  const schoolMatches = barttorvikPlayers.filter(bp => {
    const bpSchool = normalizeSchool(bp.team);
    return bpSchool === tankathonSchool ||
           bpSchool.includes(tankathonSchool) ||
           tankathonSchool.includes(bpSchool);
  });

  if (schoolMatches.length > 0) {
    // Look for best name match within school matches
    match = schoolMatches.find(
      bp => normalizeName(bp.player_name) === normalizedTankathon
    );
    if (match) return match;

    // Try partial name match within school
    match = schoolMatches.find(bp => {
      const normalizedBP = normalizeName(bp.player_name);
      return normalizedBP.includes(normalizedTankathon) ||
             normalizedTankathon.includes(normalizedBP);
    });
    if (match) return match;
  }

  // Try fuzzy matching on last name + school
  const tankathonWords = normalizedTankathon.split(' ');
  const tankathonLastName = tankathonWords[tankathonWords.length - 1];

  const lastNameMatches = barttorvikPlayers.filter(bp => {
    const normalizedBP = normalizeName(bp.player_name);
    const bpWords = normalizedBP.split(' ');
    const bpLastName = bpWords[bpWords.length - 1];
    return bpLastName === tankathonLastName;
  });

  if (lastNameMatches.length === 1) {
    return lastNameMatches[0];
  }

  // If multiple last name matches, filter by school
  if (lastNameMatches.length > 1) {
    const schoolFiltered = lastNameMatches.filter(bp => {
      const bpSchool = normalizeSchool(bp.team);
      return bpSchool === tankathonSchool ||
             bpSchool.includes(tankathonSchool) ||
             tankathonSchool.includes(bpSchool);
    });
    if (schoolFiltered.length === 1) {
      return schoolFiltered[0];
    }
  }

  // No match found (likely international player)
  return null;
}

/**
 * Find a player by name in an array of player objects
 * Uses normalized name matching for consistency across sources
 * @param {string} targetName - Name to search for
 * @param {Array} players - Array of player objects with 'name' property
 * @returns {object|null} - Matching player or null
 */
export function findPlayerByName(targetName, players) {
  if (!targetName || !players || players.length === 0) {
    return null;
  }

  const normalizedTarget = normalizeName(targetName);

  // Try exact normalized match first
  const exactMatch = players.find(
    p => normalizeName(p.name) === normalizedTarget
  );
  if (exactMatch) return exactMatch;

  // Try partial match (handles cases like "Mikel Brown" vs "Mikel Brown Jr.")
  const partialMatch = players.find(p => {
    const normalizedPlayer = normalizeName(p.name);
    return normalizedPlayer.includes(normalizedTarget) ||
           normalizedTarget.includes(normalizedPlayer);
  });
  if (partialMatch) return partialMatch;

  // Try last name match only (as fallback)
  const targetWords = normalizedTarget.split(' ');
  const targetLastName = targetWords[targetWords.length - 1];

  if (targetLastName.length > 3) { // Only if last name is substantial
    const lastNameMatches = players.filter(p => {
      const normalizedPlayer = normalizeName(p.name);
      const playerWords = normalizedPlayer.split(' ');
      const playerLastName = playerWords[playerWords.length - 1];
      return playerLastName === targetLastName;
    });

    // If exactly one match by last name, use it
    if (lastNameMatches.length === 1) {
      return lastNameMatches[0];
    }
  }

  return null;
}

/**
 * Match all Tankathon players to Barttorvik data
 * Returns match results with statistics
 * @param {Array} tankathonPlayers - Array of Tankathon player objects
 * @param {Array} barttorvikPlayers - Array of Barttorvik player stats
 * @returns {{ matches: Map, stats: { total, matched, unmatched, international } }}
 */
export function matchAllPlayers(tankathonPlayers, barttorvikPlayers) {
  const matches = new Map();
  let matched = 0;
  let unmatched = 0;
  let international = 0;

  for (const tp of tankathonPlayers) {
    const isInternational = tp.year === 'International';
    const barttorvikMatch = findBarttorvikMatch(tp, barttorvikPlayers);

    matches.set(tp.slug, {
      tankathon: tp,
      barttorvik: barttorvikMatch,
      isInternational,
    });

    if (barttorvikMatch) {
      matched++;
    } else if (isInternational) {
      international++;
    } else {
      unmatched++;
    }
  }

  return {
    matches,
    stats: {
      total: tankathonPlayers.length,
      matched,
      unmatched,
      international,
    }
  };
}
