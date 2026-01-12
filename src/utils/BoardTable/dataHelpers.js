import { formatHeight } from '../formatHelpers';

/**
 * Helper to get stat value for display
 * @param {object} stats - Player stats object
 * @param {string} key - Stat key
 * @returns {string|number} - Stat value or 'N/A'
 */
const getStatValue = (stats, key) => {
  if (!stats || stats[key] === null || stats[key] === undefined) {
    return null;
  }
  return stats[key];
};

// Row data for the DataGrid (updated for Tankathon + Barttorvik data)
export const generateTableRows = (players) => {
  return players.map((player) => {
    const stats = player.stats || {};

    return {
      // Base info
      id: player.id || player.playerId,
      name: player.name,
      rank: player.tankathonRank,
      age: player.age,
      height: player.heightDisplay || formatHeight(player.height),
      photoUrl: player.photoUrl || null,
      school: player.currentTeam,
      leagueType: player.leagueType,
      nationality: player.nationality || 'USA',
      position: player.position,
      year: player.year,

      // Data availability flags
      hasBarttorvikData: player.hasBarttorvikData,
      isInternational: player.isInternational,

      // Stats from Barttorvik (per-game)
      GP: getStatValue(stats, 'GP'),
      MP: getStatValue(stats, 'MP'),
      PTS: getStatValue(stats, 'PTS'),
      AST: getStatValue(stats, 'AST'),
      TRB: getStatValue(stats, 'TRB'),
      ORB: getStatValue(stats, 'ORB'),
      DRB: getStatValue(stats, 'DRB'),
      STL: getStatValue(stats, 'STL'),
      BLK: getStatValue(stats, 'BLK'),
      FGPct: getStatValue(stats, 'FG%'),
      ThreePct: getStatValue(stats, '3P%'),
      FTPct: getStatValue(stats, 'FT%'),
      eFGPct: getStatValue(stats, 'eFG%'),
      TSPct: getStatValue(stats, 'TS%'),
    };
  });
};

//  Config options
export const getDataGridConfig = (isMobile, isTablet) => ({
  pageSize: isMobile ? 15 : 25,
  rowsPerPageOptions: isMobile ? [15, 30] : [25, 50, 100],
  autoHeight: isMobile || isTablet,
  disableColumnMenu: isMobile,
  disableColumnSelector: isMobile,
  disableDensitySelector: isMobile,
  hideFooterSelectedRowCount: true,
  rowHeight: isMobile ? 44 : isTablet ? 60 : 74,
  columnHeaderHeight: isMobile ? 44 : isTablet ? 48 : 64,
  disableColumnSeparator: isMobile,
  sortingOrder: ['asc', 'desc'],
  initialState: {
    sorting: {
      sortModel: [{ field: 'rank', sort: 'asc' }],
    },
  },
}); 