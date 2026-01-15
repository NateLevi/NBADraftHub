import { Box, Typography, Paper, Grid } from '@mui/material';
import { useResponsive } from '../../../hooks/useResponsive';
import RankCard from './RankCard';

// Source configuration with brand colors
const RANKING_SOURCES = [
  {
    key: 'tankathonRank',
    name: 'Tankathon',
    color: '#1a1a2e',
  },
  {
    key: 'nbaDraftNetRank',
    name: 'NBADraft.net',
    color: '#0066cc',
  },
  {
    key: 'espnRank',
    name: 'ESPN',
    color: '#cc0000',
  },
];

const ScoutRankings = ({ player }) => {
  const { isMobile, isTablet } = useResponsive();

  const consensusRank = player?.consensusRank;

  // Count how many sources have rankings for this player
  const sourcesWithRanks = RANKING_SOURCES.filter(
    source => player?.[source.key] !== null && player?.[source.key] !== undefined
  ).length;

  // Check if we have any ranking data
  const hasAnyRanking = consensusRank || sourcesWithRanks > 0;

  if (!hasAnyRanking) {
    return (
      <Box>
        <Typography variant="body1" color="text.secondary">
          No draft ranking available for this player.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Consensus Ranking - Featured Section */}
      {consensusRank && (
        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 3 : 4,
            mb: isMobile ? 2 : 3,
            background: 'linear-gradient(135deg, #00285E 0%, #003d8f 100%)',
            borderRadius: 3,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              letterSpacing: '2px',
              opacity: 0.9,
              fontFamily: '"Lato", sans-serif',
            }}
          >
            Consensus Ranking
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              fontSize: isMobile ? '3rem' : isTablet ? '3.5rem' : '4rem',
              fontFamily: '"Oswald", sans-serif',
              my: 1,
            }}
          >
            #{Math.round(consensusRank * 10) / 10}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              opacity: 0.85,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontFamily: '"Lato", sans-serif',
            }}
          >
            Average of {sourcesWithRanks} draft source{sourcesWithRanks !== 1 ? 's' : ''}
          </Typography>
        </Paper>
      )}

      {/* Individual Source Rankings */}
      <Typography
        variant={isMobile ? "subtitle1" : "h6"}
        component="h3"
        sx={{
          mb: isMobile ? 1.5 : 2,
          fontWeight: 'bold',
          color: '#2D3748',
          fontSize: isMobile ? '1rem' : isTablet ? '1.05rem' : '1.1rem',
          fontFamily: '"Lato", sans-serif',
        }}
      >
        Rankings by Source
      </Typography>

      <Grid container spacing={isMobile ? 1.5 : 2} sx={{ mb: isMobile ? 2 : 3 }}>
        {RANKING_SOURCES.map((source) => (
          <Grid item xs={6} sm={4} md={4} key={source.key}>
            <RankCard
              source={source.name}
              rank={player?.[source.key]}
              color={source.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Data Source Attribution */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: '#F7FAFC',
          borderRadius: 2,
          border: '1px solid #E2E8F0',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            textAlign: 'center',
            fontSize: isMobile ? '0.7rem' : '0.75rem',
          }}
        >
          Rankings sourced from Tankathon, NBADraft.net, and ESPN.
          Data is updated weekly during the college basketball season.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ScoutRankings;
