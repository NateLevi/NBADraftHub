/**
 * Image URL helpers for local images
 * Player images and team logos are served from /public folder
 */

// Default fallback images (local paths)
export const DEFAULT_PLAYER_IMAGE = '/players/fallback.svg';
export const DEFAULT_TEAM_LOGO = '/teams/nba.svg';

/**
 * Team logos with PNG extension (all others are SVG)
 */
const PNG_TEAM_LOGOS = new Set([
  'arizona',
  'arkansas',
  'connecticut',
  'joventut',
  'michigan',
  'valencia',
  'st-johns',
]);

/**
 * Player images with PNG extension (all others are JPG)
 */
const PNG_PLAYER_IMAGES = new Set([]);

/**
 * Team name aliases to map player data team names to logo file names
 * Keys are lowercase team names from player data, values are the kebab-case file name portion
 */
const TEAM_NAME_ALIASES = {
  'san diego state': 'san-diego-st',
  'uconn': 'connecticut',
  'virginia tech': 'virginia-tech',
  'nc state': 'nc-state',
  'iowa state': 'iowa-state',
  'north carolina': 'north-carolina',
  'texas tech': 'texas-tech',
  'wake forest': 'wake-forest',
  "st. john's": 'st-johns',
};

/**
 * Convert a string to kebab-case (lowercase with hyphens)
 * @param {string} str - The string to convert
 * @returns {string} - kebab-case string
 */
function toKebabCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
    .replace(/-+/g, '-');       // Replace multiple hyphens with single hyphen
}

/**
 * Get the local URL for a player image
 * @param {string} slug - Player slug (e.g., "aday-mara", "cooper-flagg")
 * @returns {string} - Local path for the player image
 */
export function getPlayerImageUrl(slug) {
  if (!slug) return DEFAULT_PLAYER_IMAGE;
  const extension = PNG_PLAYER_IMAGES.has(slug) ? 'png' : 'jpg';
  return `/players/${slug}.${extension}`;
}

/**
 * Get the local URL for a team logo
 * @param {string} teamName - Team name (e.g., "Duke", "North Carolina", "San Diego St")
 * @returns {string} - Local path for the team logo
 */
export function getTeamLogoUrl(teamName) {
  if (!teamName) return DEFAULT_TEAM_LOGO;
  
  // Check for alias first (using lowercase team name)
  const lowerName = teamName.toLowerCase();
  const aliasName = TEAM_NAME_ALIASES[lowerName];
  const kebabName = aliasName || toKebabCase(teamName);
  
  const extension = PNG_TEAM_LOGOS.has(kebabName) ? 'png' : 'svg';
  return `/teams/teams_logos_${kebabName}.${extension}`;
}
