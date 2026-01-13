/**
 * Parse Tankathon player page markdown to extract per-game statistics
 * Used for international players who don't have Barttorvik stats
 */

/**
 * Parse a float value from a string, handling edge cases
 * @param {string} value - String value to parse
 * @returns {number|null}
 */
function parseFloat(value) {
  if (!value || value === '' || value === 'N/A') return null;
  const parsed = Number.parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse an integer value from a string
 * @param {string} value - String value to parse
 * @returns {number|null}
 */
function parseInt(value) {
  if (!value || value === '' || value === 'N/A') return null;
  const parsed = Number.parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Parse percentage value (e.g., ".478" or "47.8")
 * @param {string} value - String value to parse
 * @returns {number|null} - Percentage as a number (0-100)
 */
function parsePercentage(value) {
  if (!value || value === '' || value === 'N/A') return null;
  const parsed = Number.parseFloat(value);
  if (isNaN(parsed)) return null;
  // If value is a decimal (e.g., .478), convert to percentage
  if (parsed <= 1 && parsed >= 0) {
    return Math.round(parsed * 1000) / 10; // Convert to percentage with 1 decimal
  }
  return parsed;
}

/**
 * Parse the per-game averages section from Tankathon player page markdown
 * @param {string} markdown - Raw markdown content from Tankathon player page
 * @returns {object|null} - Stats object mapped to Barttorvik format, or null if not found
 */
export function parseTankathonPlayerStats(markdown) {
  if (!markdown) return null;

  const lines = markdown.split('\n');
  
  // Find the "PER GAME AVERAGES" section
  let perGameIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('PER GAME AVERAGES')) {
      perGameIndex = i;
      break;
    }
  }

  if (perGameIndex === -1) {
    console.log('Could not find PER GAME AVERAGES section');
    return null;
  }

  // Stats appear after the header, in a structured format
  // Example:
  // G
  // 9
  // MP
  // 21.9
  // FGM-FGA
  // 3.7-7.7
  // FG%
  // .478
  // ...

  const stats = {};
  let currentKey = null;
  
  // Scan from the PER GAME AVERAGES section to find stats
  for (let i = perGameIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Stop when we hit another section
    if (line.includes('PER 36 MINUTES') || 
        line.includes('ADVANCED STATS') ||
        line.includes('TOP 2026')) {
      break;
    }
    
    // Skip empty lines and navigation/header text
    if (!line || line.startsWith('[') || line.startsWith('!')) {
      continue;
    }

    // Stat labels and values alternate
    const upperLine = line.toUpperCase();
    
    // Match known stat labels
    if (upperLine === 'G') {
      currentKey = 'G';
    } else if (upperLine === 'MP') {
      currentKey = 'MP';
    } else if (upperLine === 'FGM-FGA') {
      currentKey = 'FGM-FGA';
    } else if (upperLine === 'FG%') {
      currentKey = 'FG%';
    } else if (upperLine === '3PM-3PA') {
      currentKey = '3PM-3PA';
    } else if (upperLine === '3P%') {
      currentKey = '3P%';
    } else if (upperLine === 'FTM-FTA') {
      currentKey = 'FTM-FTA';
    } else if (upperLine === 'FT%') {
      currentKey = 'FT%';
    } else if (upperLine === 'REB') {
      currentKey = 'REB';
    } else if (upperLine === 'AST') {
      currentKey = 'AST';
    } else if (upperLine === 'BLK') {
      currentKey = 'BLK';
    } else if (upperLine === 'STL') {
      currentKey = 'STL';
    } else if (upperLine === 'TO') {
      currentKey = 'TO';
    } else if (upperLine === 'PF') {
      currentKey = 'PF';
    } else if (upperLine === 'PTS') {
      currentKey = 'PTS';
    } else if (currentKey) {
      // This line contains the value for the current key
      stats[currentKey] = line;
      currentKey = null;
    }
  }

  // Also try to extract advanced stats (TS%, EFG%, USG%)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.includes('True Shooting') || line === 'TS%' || line.includes('TS%TS%')) {
      // Look for value in next lines
      for (let j = i + 1; j < i + 3 && j < lines.length; j++) {
        const val = lines[j].trim();
        if (val.match(/^\.?\d+\.?\d*$/)) {
          stats['TS%'] = val;
          break;
        }
      }
    }
    
    if (line.includes('Effective FG') || line === 'EFG%' || line.includes('EFG%EFG%')) {
      for (let j = i + 1; j < i + 3 && j < lines.length; j++) {
        const val = lines[j].trim();
        if (val.match(/^\.?\d+\.?\d*$/)) {
          stats['EFG%'] = val;
          break;
        }
      }
    }
    
    if (line === 'USG%' || line.includes('USG%USG%')) {
      for (let j = i + 1; j < i + 3 && j < lines.length; j++) {
        const val = lines[j].trim();
        if (val.match(/^\d+\.?\d*$/)) {
          stats['USG%'] = val;
          break;
        }
      }
    }
  }

  // Parse FGM-FGA format (e.g., "3.7-7.7")
  let FGM = null, FGA = null;
  if (stats['FGM-FGA']) {
    const parts = stats['FGM-FGA'].split('-');
    if (parts.length === 2) {
      FGM = parseFloat(parts[0]);
      FGA = parseFloat(parts[1]);
    }
  }

  // Parse 3PM-3PA
  let TPM = null, TPA = null;
  if (stats['3PM-3PA']) {
    const parts = stats['3PM-3PA'].split('-');
    if (parts.length === 2) {
      TPM = parseFloat(parts[0]);
      TPA = parseFloat(parts[1]);
    }
  }

  // Parse FTM-FTA
  let FTM = null, FTA = null;
  if (stats['FTM-FTA']) {
    const parts = stats['FTM-FTA'].split('-');
    if (parts.length === 2) {
      FTM = parseFloat(parts[0]);
      FTA = parseFloat(parts[1]);
    }
  }

  // Map to Barttorvik-compatible format
  const result = {
    GP: parseInt(stats['G']),
    MP: parseFloat(stats['MP']),
    PTS: parseFloat(stats['PTS']),
    TRB: parseFloat(stats['REB']),
    AST: parseFloat(stats['AST']),
    STL: parseFloat(stats['STL']),
    BLK: parseFloat(stats['BLK']),
    FGM: FGM,
    FGA: FGA,
    'FG%': parsePercentage(stats['FG%']),
    '3PM': TPM,
    '3PA': TPA,
    '3P%': parsePercentage(stats['3P%']),
    FTM: FTM,
    FTA: FTA,
    'FT%': parsePercentage(stats['FT%']),
    'TS%': parsePercentage(stats['TS%']),
    'eFG%': parsePercentage(stats['EFG%']),
    USG: parseFloat(stats['USG%']),
    // These aren't typically available for international players
    ORB: null,
    DRB: null,
    ORtg: null,
    DRtg: null,
    BPM: null,
    OBPM: null,
    DBPM: null,
    // Mark data source
    source: 'tankathon',
  };

  // Verify we got at least some core stats
  if (result.GP === null && result.PTS === null) {
    console.log('Could not parse core stats from markdown');
    return null;
  }

  return result;
}

/**
 * Extract player team/school from Tankathon player page markdown
 * @param {string} markdown - Raw markdown content
 * @returns {string|null}
 */
export function parsePlayerTeam(markdown) {
  if (!markdown) return null;
  
  const lines = markdown.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === 'Team') {
      // Next line should be the team name
      if (i + 1 < lines.length) {
        return lines[i + 1].trim();
      }
    }
  }
  
  return null;
}
