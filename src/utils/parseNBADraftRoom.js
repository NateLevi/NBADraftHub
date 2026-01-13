/**
 * Parse NBA Draft Room markdown to extract player draft rankings and info
 * The markdown contains a table with pick #, team, player, and combined bio info
 */

/**
 * Parse height string to inches
 * @param {string} heightStr - e.g., "6-5" or "6-10"
 * @returns {number} - height in inches
 */
function parseHeightToInches(heightStr) {
  if (!heightStr) return null;
  const match = heightStr.match(/(\d+)-(\d+)/);
  if (match) {
    return parseInt(match[1]) * 12 + parseInt(match[2]);
  }
  return null;
}

/**
 * Parse weight string to number
 * @param {string} weightStr - e.g., "195" or "205"
 * @returns {number}
 */
function parseWeight(weightStr) {
  if (!weightStr) return null;
  const match = weightStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Normalize class year to match Tankathon format
 * @param {string} classStr - e.g., "Fr", "So", "Jr", "Sr", "Int.06"
 * @returns {string}
 */
function normalizeClass(classStr) {
  if (!classStr) return 'Unknown';
  const normalized = classStr.toLowerCase().trim();
  
  if (normalized.startsWith('fr')) return 'Freshman';
  if (normalized.startsWith('so')) return 'Sophomore';
  if (normalized.startsWith('jr')) return 'Junior';
  if (normalized.startsWith('sr')) return 'Senior';
  if (normalized.startsWith('int')) return 'International';
  
  return classStr;
}

/**
 * Parse the bio cell which contains: Position – School – HT: X – WT: Y – WING: Z – Class
 * @param {string} bioCell - The combined bio information cell
 * @returns {object} - Parsed bio data
 */
function parseBioCell(bioCell) {
  const bio = {
    position: '',
    school: '',
    height: '',
    weight: null,
    year: 'Unknown',
  };

  // Extract position (at the start, before first –)
  const posMatch = bioCell.match(/^\*?\*?\[?([A-Z\/]+)\]?/);
  if (posMatch) {
    bio.position = posMatch[1];
  }

  // Extract school (after position, before HT:)
  const schoolMatch = bioCell.match(/–\s*([^–]+?)\s*–\s*HT:/);
  if (schoolMatch) {
    bio.school = schoolMatch[1].trim();
  }

  // Extract height (HT: X-Y)
  const heightMatch = bioCell.match(/HT:\s*(\d+-\d+)/);
  if (heightMatch) {
    bio.height = heightMatch[1];
  }

  // Extract weight (WT: XXX)
  const weightMatch = bioCell.match(/WT:\s*(\d+)/);
  if (weightMatch) {
    bio.weight = parseWeight(weightMatch[1]);
  }

  // Extract class year (Fr, So, Jr, Sr, Int.XX)
  const classMatch = bioCell.match(/–\s*(Fr|So|Jr|Sr|Int\.\d+)\*?\*?(?:\s*–|$)/);
  if (classMatch) {
    bio.year = normalizeClass(classMatch[1]);
  }

  return bio;
}

/**
 * Parse the full NBA Draft Room markdown file
 * @param {string} markdown - Raw markdown content
 * @returns {Array} - Array of player objects sorted by draft rank
 */
export function parseNBADraftRoomMarkdown(markdown) {
  const players = [];
  const seenRanks = new Set();
  const lines = markdown.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Look for table rows that start with | **N** | where N is a number
    if (!line.startsWith('|')) {
      continue;
    }

    // Skip table header rows and separator rows
    if (line.includes('---') || line.includes('Team') || line.includes('Updated')) {
      continue;
    }

    // Split by pipe - keep empty cells to maintain column alignment
    const rawCells = line.split('|');
    // Remove first and last empty elements (from leading/trailing pipes)
    const cells = rawCells.slice(1, -1).map(cell => cell.trim());

    // Need at least 4 columns for a valid row: pick #, team, player, bio/description
    if (cells.length < 4) {
      continue;
    }

    // First cell should be the pick number (may include ** formatting)
    const pickStr = cells[0].replace(/\*\*/g, '').trim();
    const pickNum = parseInt(pickStr);

    // Validate pick number - NBA Draft Room has extended rankings beyond 60
    // Skip if not a valid number or already seen (duplicates)
    if (isNaN(pickNum) || pickNum < 1) {
      continue;
    }

    if (seenRanks.has(pickNum)) {
      continue;
    }

    // Extract team (second column - may be empty for extended rankings)
    const team = cells[1].replace(/\*\*/g, '').trim();

    // Extract player name from third column (markdown link format)
    const playerCell = cells[2];
    let playerName = playerCell;
    const nameMatch = playerCell.match(/\[([^\]]+)\]/);
    if (nameMatch) {
      playerName = nameMatch[1];
    }
    playerName = playerName.replace(/\*\*/g, '').trim();

    // Skip if no valid player name extracted
    if (!playerName || playerName.length < 2) {
      continue;
    }

    // Extract slug from URL
    let slug = '';
    const urlMatch = playerCell.match(/\/([a-z0-9-]+)\//);
    if (urlMatch) {
      slug = urlMatch[1];
    } else {
      slug = playerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    // Parse bio information (fourth column)
    let bio = { position: '', school: '', height: '', weight: null, year: 'Unknown' };
    if (cells[3]) {
      bio = parseBioCell(cells[3]);
    }

    seenRanks.add(pickNum);

    players.push({
      nbaDraftRoomRank: pickNum,
      name: playerName,
      position: bio.position,
      school: bio.school,
      slug,
      height: bio.height ? bio.height.replace('-', "'") + '"' : '',
      heightInches: parseHeightToInches(bio.height),
      weight: bio.weight,
      year: bio.year,
      age: null, // NBA Draft Room doesn't provide age
    });
  }

  // Sort by rank
  return players.sort((a, b) => a.nbaDraftRoomRank - b.nbaDraftRoomRank);
}
