import React, { useState } from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { useResponsive } from '../../../hooks/useResponsive';

// Stat categories for toggle buttons
const STATS_CATEGORIES = [
  { value: 'basic', label: 'Basic Stats' },
  { value: 'shooting', label: 'Shooting' },
  { value: 'advanced', label: 'Advanced' },
];

// Define which stats to show in each category
const BASIC_STATS = [
  { key: 'GP', label: 'Games Played', format: 'int' },
  { key: 'MP', label: 'Minutes', format: 'decimal' },
  { key: 'PTS', label: 'Points', format: 'decimal' },
  { key: 'TRB', label: 'Rebounds', format: 'decimal' },
  { key: 'AST', label: 'Assists', format: 'decimal' },
  { key: 'STL', label: 'Steals', format: 'decimal' },
  { key: 'BLK', label: 'Blocks', format: 'decimal' },
];

const SHOOTING_STATS = [
  { key: 'FGM', label: 'FG Made', format: 'decimal' },
  { key: 'FGA', label: 'FG Attempted', format: 'decimal' },
  { key: 'FG%', label: 'FG%', format: 'pct' },
  { key: '2PM', label: '2P Made', format: 'decimal' },
  { key: '2PA', label: '2P Attempted', format: 'decimal' },
  { key: '2P%', label: '2P%', format: 'pct' },
  { key: '3PM', label: '3P Made', format: 'decimal' },
  { key: '3PA', label: '3P Attempted', format: 'decimal' },
  { key: '3P%', label: '3P%', format: 'pct' },
  { key: 'FTM', label: 'FT Made', format: 'decimal' },
  { key: 'FTA', label: 'FT Attempted', format: 'decimal' },
  { key: 'FT%', label: 'FT%', format: 'pct' },
];

const ADVANCED_STATS = [
  { key: 'eFG%', label: 'eFG%', format: 'pct' },
  { key: 'TS%', label: 'True Shooting %', format: 'pct' },
  { key: 'USG', label: 'Usage Rate', format: 'decimal' },
  { key: 'ORtg', label: 'Off. Rating', format: 'int' },
  { key: 'DRtg', label: 'Def. Rating', format: 'int' },
  { key: 'BPM', label: 'Box Plus/Minus', format: 'decimal' },
  { key: 'OBPM', label: 'Off. BPM', format: 'decimal' },
  { key: 'DBPM', label: 'Def. BPM', format: 'decimal' },
];

// Styling constants
const CELL_STYLES = {
  header: (isMobile) => ({
    fontWeight: 'bold',
    fontSize: isMobile ? '0.75rem' : '0.875rem',
    py: isMobile ? 1 : 1.5,
    px: isMobile ? 1 : 2,
    whiteSpace: 'nowrap'
  }),
  body: (isMobile) => ({
    fontSize: isMobile ? '0.75rem' : '0.875rem',
    py: isMobile ? 0.75 : 1,
    px: isMobile ? 1 : 2,
    whiteSpace: 'nowrap'
  })
};

// Format stat value based on type
const formatStatValue = (value, format) => {
  if (value === null || value === undefined) return 'N/A';

  switch (format) {
    case 'int':
      return Math.round(value);
    case 'decimal':
      return value.toFixed(1);
    case 'pct':
      return `${value.toFixed(1)}%`;
    default:
      return value;
  }
};

export default function StatsTable({ player }) {
  const { isMobile } = useResponsive();
  const [statCategory, setStatCategory] = useState('basic');

  // Event handlers
  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      setStatCategory(newCategory);
    }
  };

  // Get stats based on category
  const getCurrentStats = () => {
    switch (statCategory) {
      case 'shooting':
        return SHOOTING_STATS;
      case 'advanced':
        return ADVANCED_STATS;
      default:
        return BASIC_STATS;
    }
  };

  const currentStats = getCurrentStats();
  const playerStats = player?.stats;

  // No data available
  if (!playerStats) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          No statistics available for this player.
        </Typography>
        {player?.isInternational && (
          <Typography variant="body2" color="text.secondary">
            Statistics for international players may not be available yet. 
            Run the international stats update script to fetch the latest data.
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box>
      {/* Season Info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          2025-26 Season • {playerStats.team || player.currentTeam} {playerStats.conf && `(${playerStats.conf})`}
        </Typography>
      </Box>

      {/* Category Toggle Buttons */}
      <Box sx={{
        mb: 2,
        display: 'flex',
        justifyContent: 'center',
        overflowX: isMobile ? 'auto' : 'visible',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none'
      }}>
        <ToggleButtonGroup
          value={statCategory}
          exclusive
          onChange={handleCategoryChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              px: isMobile ? 1 : 2,
              py: isMobile ? 0.5 : 1,
              minWidth: isMobile ? 'auto' : '64px'
            }
          }}
        >
          {STATS_CATEGORIES.map(category => (
            <ToggleButton key={category.value} value={category.value}>
              {isMobile ? category.label.split(' ')[0] : category.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Stats Table */}
      <TableContainer component={Paper}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell sx={CELL_STYLES.header(isMobile)}>Stat</TableCell>
              <TableCell sx={CELL_STYLES.header(isMobile)} align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentStats.map((stat) => (
              <TableRow key={stat.key}>
                <TableCell sx={CELL_STYLES.body(isMobile)}>
                  {stat.label}
                </TableCell>
                <TableCell sx={CELL_STYLES.body(isMobile)} align="right">
                  {formatStatValue(playerStats[stat.key], stat.format)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Data Source Note */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {player?.hasTankathonStats 
            ? 'Statistics provided by Tankathon • Per-game averages'
            : 'Statistics provided by Barttorvik • Per-game averages'
          }
        </Typography>
      </Box>
    </Box>
  );
}
