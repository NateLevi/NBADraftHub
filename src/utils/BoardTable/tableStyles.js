// BoardTable styling constants and utilities
export const TABLE_COLORS = {
  primary: '#00285E',
  secondary: '#4A5568',
  muted: '#6B7280',
  light: '#9CA3AF',
  background: '#FFFFFF',
  border: '#E2E8F0',
};

export const FONT_FAMILY = '"Lato", sans-serif';

// Responsive font sizes
export const getFontSize = (isMobile, isTablet, mobileSize = '0.75rem', tabletSize = '0.85rem', desktopSize = '1.125rem') => {
  if (isMobile) return mobileSize;
  if (isTablet) return tabletSize;
  return desktopSize;
};

// Scout rank cell styles
export const getScoutRankStyles = (isMobile, isTablet, hasValue = true) => ({
  color: hasValue ? TABLE_COLORS.secondary : TABLE_COLORS.light,
  fontFamily: FONT_FAMILY,
  fontSize: getFontSize(isMobile, isTablet),
  fontWeight: hasValue ? '600' : '500',
});

// Player name cell styles
export const getPlayerCellStyles = (isMobile, isTablet) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: isMobile ? '6px 2px' : isTablet ? '8px 6px' : '12px 20px',
});

export const getPlayerImageStyles = (isMobile, isTablet) => ({
  width: isMobile ? 24 : isTablet ? 32 : 40,
  height: isMobile ? 24 : isTablet ? 32 : 40,
  borderRadius: '50%',
  objectFit: 'cover',
  marginRight: isMobile ? 4 : isTablet ? 8 : 12,
  flexShrink: 0,
});

export const getPlayerLinkStyles = (isMobile, isTablet) => ({
  color: TABLE_COLORS.primary,
  textDecoration: 'none',
  fontWeight: '500',
  fontFamily: FONT_FAMILY,
  fontSize: getFontSize(isMobile, isTablet, '0.875rem', '1rem', '1.125rem'),
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
  display: 'block',
});

// Team cell styles
export const getTeamCellStyles = (isMobile, isTablet, isDesktop) => {
  const baseStyles = {
    fontFamily: FONT_FAMILY,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
  };

  if (isDesktop) {
    return {
      ...baseStyles,
      color: TABLE_COLORS.secondary,
      fontSize: '1.125rem',
    };
  }

  if (isTablet) {
    return {
      ...baseStyles,
      fontSize: '0.875rem',
      color: TABLE_COLORS.secondary,
    };
  }

  // Mobile
  return {
    ...baseStyles,
    fontSize: '0.75rem',
    color: TABLE_COLORS.muted,
  };
};

// League type styles
export const getLeagueTypeStyles = () => ({
  marginLeft: '8px',
  color: TABLE_COLORS.muted,
  fontSize: '1rem',
  fontFamily: FONT_FAMILY,
});

// Nationality cell styles
export const getNationalityStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  color: TABLE_COLORS.secondary,
  fontFamily: FONT_FAMILY,
});

export const getFlagStyles = () => ({
  width: '1.2em',
  height: '1.2em',
  marginRight: '6px',
});

export const getNationalityTextStyles = () => ({
  fontSize: '1rem',
  fontFamily: FONT_FAMILY,
});

// DataGrid styles
export const getDataGridStyles = (isMobile) => ({
  backgroundColor: TABLE_COLORS.background,
  border: `1px solid ${TABLE_COLORS.border}`,
  borderRadius: isMobile ? '8px' : '12px',
  fontFamily: FONT_FAMILY,
  '& .round-2-start': {
    borderTop: '3px solid #00285E',
    position: 'relative',
    '&::before': {
      content: '"Round 2"',
      position: 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#00285E',
      color: 'white',
      padding: '2px 12px',
      fontSize: '0.7rem',
      fontWeight: '600',
      borderRadius: '4px',
      zIndex: 1,
    },
  },
});

// NBA Team logo cell styles
export const getNBATeamCellStyles = () => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
});

export const getNBATeamLogoStyles = (isMobile, isTablet) => ({
  width: isMobile ? '28px' : isTablet ? '36px' : '44px',
  height: isMobile ? '28px' : isTablet ? '36px' : '44px',
  objectFit: 'contain',
  display: 'block',
  filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 1px rgba(0, 0, 0, 0.3))',
}); 