/**
 * NBA Team utilities for displaying team logos and names
 */

export const NBA_TEAMS = {
  'ATL': 'Atlanta Hawks',
  'BOS': 'Boston Celtics',
  'BKN': 'Brooklyn Nets',
  'CHA': 'Charlotte Hornets',
  'CHI': 'Chicago Bulls',
  'CLE': 'Cleveland Cavaliers',
  'DAL': 'Dallas Mavericks',
  'DEN': 'Denver Nuggets',
  'DET': 'Detroit Pistons',
  'GS': 'Golden State Warriors',
  'HOU': 'Houston Rockets',
  'IND': 'Indiana Pacers',
  'LAC': 'LA Clippers',
  'LAL': 'Los Angeles Lakers',
  'MEM': 'Memphis Grizzlies',
  'MIA': 'Miami Heat',
  'MIL': 'Milwaukee Bucks',
  'MIN': 'Minnesota Timberwolves',
  'NO': 'New Orleans Pelicans',
  'NY': 'New York Knicks',
  'OKC': 'Oklahoma City Thunder',
  'ORL': 'Orlando Magic',
  'PHI': 'Philadelphia 76ers',
  'PHX': 'Phoenix Suns',
  'POR': 'Portland Trail Blazers',
  'SA': 'San Antonio Spurs',
  'SAC': 'Sacramento Kings',
  'TOR': 'Toronto Raptors',
  'UTA': 'Utah Jazz',
  'WAS': 'Washington Wizards'
};

/**
 * Get full NBA team name from team code
 * @param {string} code - Team code (e.g., "ATL", "BOS")
 * @returns {string} - Full team name or "Unknown Team"
 */
export function getNBATeamName(code) {
  return NBA_TEAMS[code] || 'Unknown Team';
}

/**
 * Get URL for NBA team logo
 * @param {string} code - Team code (e.g., "ATL", "BOS")
 * @returns {string} - Path to team logo SVG
 */
export function getNBATeamLogoUrl(code) {
  if (!code) return '/nbalogo.png'; // Fallback to generic NBA logo
  return `/nbateams/${code.toLowerCase()}.svg`;
}
