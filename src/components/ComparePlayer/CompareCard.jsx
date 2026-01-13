import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  getPlayerStats,
  formatStatValue,
  getComparisonCellColor,
  createStatsComparisonData
} from '../../utils/compareHelpers';

// Styling constants
const COLORS = {
  primary: '#00285E',
  secondary: '#4A5568',
  background: '#FFFFFF',
  border: '#E2E8F0',
  text: '#2D3748',
  chipBg: '#F7FAFC',
};

// Player Card Component
const PlayerCard = ({ player, statsComparison, isPlayerA }) => {
  const navigate = useNavigate();

  // Use tankathonRank from new data structure
  const rank = player?.tankathonRank;

  const handlePlayerClick = () => {
    if (player?.id) {
      navigate(`/players/${player.id}`);
    }
  };

  const getStatForComparison = (stat) => {
    const statKey = isPlayerA ? stat.keyA : stat.keyB;
    const otherStatKey = isPlayerA ? stat.keyB : stat.keyA;

    return {
      value: formatStatValue(statKey, stat.stat),
      backgroundColor: getComparisonCellColor(statKey, otherStatKey, stat.higherIsBetter)
    };
  };

  return (
    <Box sx={{ flex: 1, maxWidth: 400 }}>
      <Paper 
        elevation={2}
        sx={{ 
          backgroundColor: COLORS.background,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        {/* Player Header */}
        <Box sx={{ p: 4, borderBottom: `1px solid ${COLORS.border}`, textAlign: 'center' }}>
          <Avatar 
            src={player?.photoUrl} 
            onClick={handlePlayerClick}
            sx={{ 
              width: 80, 
              height: 80, 
              mx: 'auto', 
              mb: 2,
              border: `2px solid ${COLORS.primary}`,
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease-in-out'
              }
            }}
          >
            {player?.name?.charAt(0)}
          </Avatar>
          
          <Typography 
            variant="h4" 
            onClick={handlePlayerClick}
            sx={{ 
              fontWeight: 'bold',
              color: COLORS.text,
              fontFamily: '"Oswald", sans-serif',
              mb: 1,
              cursor: 'pointer',
              '&:hover': {
                color: COLORS.primary,
                transition: 'color 0.2s ease-in-out'
              }
            }}
          >
            {player?.name}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
            <Chip 
              label={`#${rank || 'NR'}`}
              size="small"
              sx={{
                backgroundColor: COLORS.primary,
                color: COLORS.background,
                fontFamily: '"Lato", sans-serif',
                fontWeight: '600'
              }}
            />
            <Chip 
              label={player?.position}
              size="small"
              sx={{
                backgroundColor: COLORS.chipBg,
                color: COLORS.secondary,
                fontFamily: '"Lato", sans-serif'
              }}
            />
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: COLORS.secondary,
              fontFamily: '"Lato", sans-serif'
            }}
          >
            {player?.currentTeam}
          </Typography>
        </Box>
        
        {/* Stats Table */}
        <Table size="medium">
          <TableBody>
            {statsComparison.map((stat, index) => {
              const playerStats = getStatForComparison(stat);
              
              return (
                <TableRow key={index}>
                  <TableCell 
                    sx={{ 
                      fontWeight: '500',
                      color: COLORS.secondary,
                      fontFamily: '"Lato", sans-serif',
                      width: '55%',
                      py: 1.5
                    }}
                  >
                    {stat.stat}
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      backgroundColor: playerStats.backgroundColor,
                      fontFamily: '"Lato", sans-serif',
                      fontWeight: '600',
                      textAlign: 'center',
                      py: 1.5
                    }}
                  >
                    {playerStats.value}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

// Main Compare Card Component
const CompareCard = ({ playerA, playerB }) => {
  // Get stats for both players from new data structure
  const playerAStats = getPlayerStats(playerA);
  const playerBStats = getPlayerStats(playerB);

  // Create stats comparison data
  const statsComparison = createStatsComparisonData(playerA, playerB, playerAStats, playerBStats);

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 4,
        mb: 4,
        flexWrap: { xs: 'wrap', md: 'nowrap' }
      }}>
        <PlayerCard 
          player={playerA} 
          statsComparison={statsComparison} 
          isPlayerA={true} 
        />
        <PlayerCard 
          player={playerB} 
          statsComparison={statsComparison} 
          isPlayerA={false} 
        />
      </Box>
    </Box>
  );
};

export default CompareCard;