// Team Logo for the stats table
import { Box, Typography } from '@mui/material';
import { useResponsive } from '../../../hooks/useResponsive';
import { getTeamLogoUrl } from '../../../utils/imageHelpers';

const TeamCell = ({ teamName }) => {
  const { isMobile, isTablet } = useResponsive();
  
  if (!teamName || teamName === 'N/A') {
    return 'N/A';
  }

  const logoUrl = getTeamLogoUrl(teamName);
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 1 }}>
      {logoUrl && (
        <img 
          src={logoUrl} 
          alt={`${teamName} logo`}
          style={{ 
            width: isMobile ? 16 : isTablet ? 18 : 20, 
            height: isMobile ? 16 : isTablet ? 18 : 20, 
            objectFit: 'contain',
            flexShrink: 0 
          }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      )}
      <Typography 
        variant="body2" 
        sx={{ 
          fontSize: isMobile ? '0.75rem' : isTablet ? '0.8rem' : '0.875rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: isMobile ? '100px' : isTablet ? '120px' : 'none'
        }}
      >
        {teamName}
      </Typography>
    </Box>
  );
};

export default TeamCell; 