import React from 'react';
import PhysicalCard from './PhysicalCard';
import StraightenIcon from '@mui/icons-material/Straighten';
import ScaleIcon from '@mui/icons-material/Scale';
import { Grid, Typography, Box, Paper } from '@mui/material';
import { useResponsive } from '../../../hooks/useResponsive';
import { formatHeight } from '../../../utils/formatHelpers';

const PhysicalSection = ({ player }) => {
  const { isMobile, isTablet } = useResponsive();

  // Get basic measurements from Tankathon data
  const height = player?.heightDisplay || formatHeight(player?.height);
  const weight = player?.weight;

  // Check if we have any physical data
  const hasBasicData = height || weight;

  if (!hasBasicData) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No physical measurements available for this player.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Basic Measurements from Tankathon */}
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        component="h3"
        sx={{
          mb: isMobile ? 1.5 : 2,
          fontWeight: 'bold',
          color: '#2D3748',
          fontSize: isMobile ? '1rem' : isTablet ? '1.05rem' : '1.1rem',
          fontFamily: '"Lato", sans-serif'
        }}
      >
        Physical Measurements
      </Typography>

      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 2 : 3 }}>
        {height && (
          <Grid item xs={6} sm={6} md={4} lg={3}>
            <PhysicalCard
              label="Height"
              value={height}
              unit=""
              icon={<StraightenIcon sx={{ color: '#00285E' }} />}
            />
          </Grid>
        )}
        {weight && (
          <Grid item xs={6} sm={6} md={4} lg={3}>
            <PhysicalCard
              label="Weight"
              value={weight}
              unit=" lbs"
              icon={<ScaleIcon sx={{ color: '#00285E' }} />}
            />
          </Grid>
        )}
      </Grid>

      {/* Notice about missing combine data */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: '#F7FAFC',
          borderRadius: 2,
          border: '1px solid #E2E8F0'
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          <strong>Note:</strong> Detailed combine measurements (wingspan, vertical leap, agility tests, etc.) are not currently available.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          This data will be updated after the NBA Draft Combine or when additional measurements become available.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PhysicalSection;
