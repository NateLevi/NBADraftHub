import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { useResponsive } from '../../../hooks/useResponsive';

/**
 * RankCard - Displays a ranking from a specific source
 * @param {string} source - Name of the ranking source (e.g., "Tankathon")
 * @param {number|null} rank - The player's ranking (1-60) or null if not ranked
 * @param {string} color - Brand color for the source
 * @param {React.ReactNode} icon - Optional icon element
 */
const RankCard = ({ source, rank, color = '#00285E', icon }) => {
  const { isMobile } = useResponsive();
  
  const hasRank = rank !== null && rank !== undefined;
  const displayRank = hasRank ? `#${rank}` : 'N/A';

  return (
    <Card sx={{
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      border: '1px solid #E2E8F0',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderColor: color,
      }
    }}>
      <CardContent sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: isMobile ? 2 : 3,
        textAlign: 'center',
        flexGrow: 1,
      }}>
        {/* Source Icon (optional) */}
        {icon && (
          <Box sx={{ mb: 1 }}>
            {icon}
          </Box>
        )}
        
        {/* Source Name */}
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600,
            color: '#4A5568',
            fontFamily: '"Lato", sans-serif',
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            mb: 0.5,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {source}
        </Typography>
        
        {/* Ranking */}
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          component="div" 
          sx={{ 
            fontWeight: 'bold', 
            color: hasRank ? color : '#A0AEC0',
            fontFamily: '"Oswald", sans-serif',
            fontSize: isMobile ? '1.75rem' : '2.25rem',
            lineHeight: 1.2,
          }}
        >
          {displayRank}
        </Typography>

        {/* Not ranked indicator */}
        {!hasRank && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#A0AEC0',
              fontSize: '0.7rem',
              mt: 0.5,
            }}
          >
            Not Ranked
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default RankCard;
