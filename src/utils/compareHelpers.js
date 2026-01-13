import { formatHeight } from './formatHelpers';

// Get player stats from new data structure (Barttorvik)
export const getPlayerStats = (player) => {
  return player?.stats || null;
};

// Format stat value for display
export const formatStatValue = (value, statType) => {
  if (value === null || value === undefined) return 'N/A';
  if (statType === 'Height') return value; // Already formatted as string like "6'6"
  if (statType === 'Weight' && typeof value === 'number') return `${value} lbs`;
  if (statType === 'Age' && typeof value === 'number') return `${value.toFixed(1)} yrs`;
  if (statType.includes('%') && typeof value === 'number') return `${value.toFixed(1)}%`;
  if (typeof value === 'number') return value.toFixed(1);
  return value;
};

// Get comparison cell color based on which value is better
export const getComparisonCellColor = (valueA, valueB, higherIsBetter = true) => {
  if (!valueA || !valueB || valueA === valueB) return '#F7FAFC';

  const aIsBetter = higherIsBetter ? valueA > valueB : valueA < valueB;
  return aIsBetter ? '#DCFCE7' : '#FEE2E2';
};

// Create stats comparison data for new data structure
export const createStatsComparisonData = (playerA, playerB, playerAStats, playerBStats) => {
  return [
    // Physical - use direct fields from new data structure
    {
      category: 'Physical',
      stat: 'Age',
      keyA: playerA?.age,
      keyB: playerB?.age,
      higherIsBetter: false
    },
    {
      category: 'Physical',
      stat: 'Height',
      keyA: playerA?.heightDisplay || formatHeight(playerA?.height),
      keyB: playerB?.heightDisplay || formatHeight(playerB?.height),
      higherIsBetter: true
    },
    {
      category: 'Physical',
      stat: 'Weight',
      keyA: playerA?.weight,
      keyB: playerB?.weight,
      higherIsBetter: true
    },

    // Scoring - from Barttorvik stats
    {
      category: 'Scoring',
      stat: 'Points',
      keyA: playerAStats?.PTS,
      keyB: playerBStats?.PTS,
      higherIsBetter: true
    },
    {
      category: 'Scoring',
      stat: 'FG%',
      keyA: playerAStats?.['FG%'],
      keyB: playerBStats?.['FG%'],
      higherIsBetter: true
    },
    {
      category: 'Scoring',
      stat: '3P%',
      keyA: playerAStats?.['3P%'],
      keyB: playerBStats?.['3P%'],
      higherIsBetter: true
    },
    {
      category: 'Scoring',
      stat: 'FT%',
      keyA: playerAStats?.['FT%'],
      keyB: playerBStats?.['FT%'],
      higherIsBetter: true
    },

    // Rebounding
    {
      category: 'Rebounding',
      stat: 'Rebounds',
      keyA: playerAStats?.TRB,
      keyB: playerBStats?.TRB,
      higherIsBetter: true
    },
    {
      category: 'Rebounding',
      stat: 'Off. Reb',
      keyA: playerAStats?.ORB,
      keyB: playerBStats?.ORB,
      higherIsBetter: true
    },
    {
      category: 'Rebounding',
      stat: 'Def. Reb',
      keyA: playerAStats?.DRB,
      keyB: playerBStats?.DRB,
      higherIsBetter: true
    },

    // Playmaking
    {
      category: 'Playmaking',
      stat: 'Assists',
      keyA: playerAStats?.AST,
      keyB: playerBStats?.AST,
      higherIsBetter: true
    },

    // Defense
    {
      category: 'Defense',
      stat: 'Steals',
      keyA: playerAStats?.STL,
      keyB: playerBStats?.STL,
      higherIsBetter: true
    },
    {
      category: 'Defense',
      stat: 'Blocks',
      keyA: playerAStats?.BLK,
      keyB: playerBStats?.BLK,
      higherIsBetter: true
    },
  ];
};
