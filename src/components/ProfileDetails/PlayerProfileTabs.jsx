import React, { useState, useEffect, useRef } from 'react';
import { AppBar, Toolbar, Button, Box, Typography } from '@mui/material';
import ProfileSectionAccordion from './ProfileSectionAccordion';
import { usePlayers } from '../../contexts/playersContextDef';
import { useResponsive } from '../../hooks/useResponsive';

// Icons
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

// Constants
const SECTIONS = [
  { id: 'scout-ranks', label: 'Scout Ranks', icon: <AssessmentIcon /> },
  { id: 'statistics', label: 'Statistics', icon: <BarChartIcon />},
  { id: 'physical', label: 'Physical', icon: <FitnessCenterIcon /> },
];

const COLORS = {
  primary: '#00285E',
  secondary: '#4A5568',
  primaryBg: 'rgba(0, 40, 94, 0.08)',
  primaryBgHover: 'rgba(0, 40, 94, 0.12)',
  secondaryBgHover: 'rgba(0, 40, 94, 0.04)',
};

export default function PlayerProfileTabs({ playerToDisplay }) {
  const { selectedPlayer, setSelectedPlayer } = usePlayers();
  const { isMobile, isTablet } = useResponsive();
  
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedSections, setExpandedSections] = useState(
    SECTIONS.reduce((acc, section) => ({ ...acc, [section.id]: true }), {})
  );
  
  const sectionRefs = useRef({});
  const navRef = useRef(null);

  // Initialize refs
  SECTIONS.forEach(section => {
    if (!sectionRefs.current[section.id]) {
      sectionRefs.current[section.id] = React.createRef();
    }
  });

  // Handle navigation to section
  const scrollToSection = (sectionId) => {
    const element = sectionRefs.current[sectionId]?.current;
    if (!element) return;

    const navHeight = navRef.current?.offsetHeight || 56;
    const yOffset = navHeight + 16;
    const y = element.getBoundingClientRect().top + window.pageYOffset - yOffset;
    
    window.scrollTo({ top: y, behavior: 'smooth' });
    
    // Expand the section when navigating to it
    setExpandedSections(prev => ({ ...prev, [sectionId]: true }));
  };

  // Handle accordion expand/collapse
  const handleAccordionChange = (sectionId) => (event, isExpanded) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: isExpanded }));
  };

  // Track scroll position for nav styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.pageYOffset > 10);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce((closest, entry) => {
            const entryTop = entry.boundingClientRect.top;
            const closestTop = closest.boundingClientRect.top;
            return Math.abs(entryTop) < Math.abs(closestTop) ? entry : closest;
          });
          setActiveSection(topEntry.target.id);
        }
      },
      {
        rootMargin: '-60px 0px -40% 0px',
        threshold: 0.1,
      }
    );

    SECTIONS.forEach(section => {
      const element = sectionRefs.current[section.id]?.current;
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Set selected player
  useEffect(() => {
    if (playerToDisplay) {
      setSelectedPlayer(playerToDisplay);
    }
  }, [playerToDisplay, setSelectedPlayer]);

  // Loading/error states
  if (!selectedPlayer) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6" color="text.secondary">
          {playerToDisplay ? 'Player not found.' : 'No player selected.'}
        </Typography>
      </Box>
    );
  }

  // Get button styles
  const getButtonStyles = (isActive) => ({
    mx: isMobile ? 0 : isTablet ? 0.25 : 1,
    my: 0.5,
    flex: isMobile || isTablet ? 1 : 'none',
    minWidth: isMobile ? 'auto' : isTablet ? '80px' : '120px',
    textTransform: 'none',
    fontFamily: '"Lato", sans-serif',
    fontWeight: isActive ? 'bold' : 500,
    color: isActive ? COLORS.primary : COLORS.secondary,
    backgroundColor: isActive ? COLORS.primaryBg : 'transparent',
    borderRadius: '8px',
    fontSize: isMobile ? '0.7rem' : isTablet ? '0.8rem' : '0.875rem',
    px: isMobile ? 0.5 : isTablet ? 1 : 2,
    '&:hover': {
      backgroundColor: isActive ? COLORS.primaryBgHover : COLORS.secondaryBgHover,
      color: COLORS.primary,
    },
  });

  // Get nav styles
  const getNavStyles = () => ({
    zIndex: 1090,
    backgroundColor: isScrolled ? 'rgba(255,255,255,0.85)' : 'background.paper',
    backdropFilter: isScrolled ? 'blur(8px)' : 'none',
    WebkitBackdropFilter: isScrolled ? 'blur(8px)' : 'none',
    transition: 'all 0.3s ease',
    boxShadow: isScrolled ? '0 2px 4px -1px rgba(0,0,0,0.07)' : 'none',
    borderBottom: isScrolled ? 1 : 0,
    borderColor: 'divider',
  });

  return (
    <>
      {/* Sticky Navigation */}
      <AppBar
        position="sticky"
        ref={navRef}
        elevation={isScrolled ? 2 : 0}
        sx={getNavStyles()}
      >
        <Toolbar sx={{ 
          justifyContent: 'center', 
          minHeight: 56, 
          px: isMobile ? 1 : 2 
        }}>
          <Box sx={{
            display: 'flex', 
            width: '100%',
            justifyContent: isMobile || isTablet ? 'space-between' : 'center',
          }}>
            {SECTIONS.map((section) => (
              <Button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                startIcon={React.cloneElement(section.icon, { 
                  sx: { color: activeSection === section.id ? COLORS.primary : COLORS.secondary } 
                })}
                sx={getButtonStyles(activeSection === section.id)}
              >
                {isMobile ? section.label.split(' ')[0] : section.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content Sections */}
      <Box component="main" sx={{ p: { xs: 1, sm: 2 } }}>
        {SECTIONS.map((section) => (
          <ProfileSectionAccordion
            key={section.id}
            section={section}
            expanded={expandedSections[section.id]}
            onAccordionChange={handleAccordionChange(section.id)}
            sectionRef={sectionRefs.current[section.id]}
          />
        ))}
      </Box>
    </>
  );
}