/**
 * Parse NBADraft.net markdown to extract player draft rankings and info
 * Format: | # | Team (with images) | [Player](url) | H | W | P | School | C |
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
 * Convert height from "6-5" format to "6'5\"" format
 * @param {string} heightStr - e.g., "6-5"
 * @returns {string} - e.g., "6'5"
 */
function formatHeight(heightStr) {
  if (!heightStr) return '';
  return heightStr.replace('-', "'") + '"';
}

/**
 * Normalize class year to match Tankathon format
 * @param {string} classStr - e.g., "Fr.", "So.", "Jr.", "Sr.", "Intl."
 * @returns {string}
 */
function normalizeClass(classStr) {
  if (!classStr) return 'Unknown';
  const normalized = classStr.replace('.', '').trim().toLowerCase();
  const classMap = {
    'fr': 'Freshman',
    'so': 'Sophomore',
    'jr': 'Junior',
    'sr': 'Senior',
    'intl': 'International',
  };
  return classMap[normalized] || classStr;
}

/**
 * Parse the full NBADraft.net markdown file
 * Uses regex to handle complex table rows with images and markdown formatting
 * @param {string} markdown - Raw markdown content
 * @returns {Array} - Array of player objects sorted by draft rank
 */
export function parseNBADraftNetMarkdown(markdown) {
  const players = [];
  const seenRanks = new Set();

  // Split into lines
  const lines = markdown.split('\n');

  for (const line of lines) {
    // Skip non-table rows
    if (!line.includes('|')) continue;

    // Match rows that start with a pick number
    // Pattern: | # | ... (where # is 1-60)
    const pickMatch = line.match(/^\|\s*(\d+)\s*\|/);
    if (!pickMatch) continue;

    const pickNum = parseInt(pickMatch[1]);

    // Only process picks 1-60, and skip duplicates
    if (pickNum < 1 || pickNum > 60) continue;
    if (seenRanks.has(pickNum)) continue;

    // Extract player name and slug from [PlayerName](url) pattern
    const playerMatch = line.match(/\[([^\]]+)\]\(https?:\/\/(?:www\.)?nbadraft\.net\/players\/([a-z0-9-]+)/i);
    if (!playerMatch) continue;

    const name = playerMatch[1].trim();
    const slug = playerMatch[2];

    // Extract height (X-X format, e.g., "6-5")
    const heightMatch = line.match(/\|\s*(\d+-\d+)\s*\|/);
    const height = heightMatch ? heightMatch[1] : '';

    // Extract weight (3-digit number between pipes, before position)
    // Look for pattern: | height | weight | position |
    const weightMatch = line.match(/\|\s*\d+-\d+\s*\|\s*(\d+)\s*\|/);
    const weight = weightMatch ? parseInt(weightMatch[1]) : null;

    // Extract position (letters only, like PG, SG, SF, PF, C, or combos like PG/SG)
    const positionMatch = line.match(/\|\s*(\d+)\s*\|\s*([PGSFCA][FGCA]?(?:\/[PGSFCA][FGCA]?)?)\s*\|/);
    const position = positionMatch ? positionMatch[2] : '';

    // Extract school (text before class abbreviation)
    const schoolMatch = line.match(/\|\s*([^|]+?)\s*\|\s*(Fr\.|So\.|Jr\.|Sr\.|Intl\.)\s*\|/i);
    const school = schoolMatch ? schoolMatch[1].trim() : '';

    // Extract class
    const classMatch = line.match(/(Fr\.|So\.|Jr\.|Sr\.|Intl\.)/i);
    const year = classMatch ? normalizeClass(classMatch[1]) : 'Unknown';

    seenRanks.add(pickNum);

    players.push({
      nbaDraftNetRank: pickNum,
      name,
      position,
      school,
      slug,
      height: formatHeight(height),
      heightInches: parseHeightToInches(height),
      weight,
      year,
      age: null, // NBADraft.net doesn't provide age in the table
    });
  }

  // Sort by rank
  return players.sort((a, b) => a.nbaDraftNetRank - b.nbaDraftNetRank);
}
