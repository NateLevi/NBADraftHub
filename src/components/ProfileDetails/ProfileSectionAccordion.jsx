import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import { motion as Motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PhysicalSection from './Physical/PhysicalSection';
import ScoutRankings from './ScoutRanks/ScoutRankings';
import Stats from './Statistics/StatsTable';
import { usePlayers } from '../../contexts/playersContextDef.js';
import { useResponsive } from '../../hooks/useResponsive';

const ProfileSectionAccordion = ({ 
  section, 
  expanded, 
  onAccordionChange, 
  sectionRef, 
}) => {
  const { selectedPlayer } = usePlayers();
  const { isMobile, isTablet } = useResponsive();

  const sectionVariants = {
    hidden: { y: 0 },
    visible: { y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <Motion.div
      id={section.id}
      ref={sectionRef}
      variants={sectionVariants}
      initial="visible"
      animate="visible"
      viewport={{ once: true, amount: 0.1 }}
      style={{ marginBottom: '16px' }}
    >
      <Accordion
        expanded={expanded}
        onChange={onAccordionChange}
        sx={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            mb: { xs: 3, sm: 4 },
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: '#4A5568' }} />}
          aria-controls={`${section.id}-content`}
          id={`${section.id}-header`}
          sx={{
            minHeight: isMobile ? 48 : isTablet ? 56 : 64,
            backgroundColor: '#FFFFFF',
            px: isMobile ? 2 : 3,
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              my: isMobile ? 1 : 1.5,
            },
            '&:hover': {
              backgroundColor: '#F7FAFC',
            },
          }}
        >
          {React.cloneElement(section.icon, { 
            sx: { 
              mr: isMobile ? 1 : 1.5, 
              fontSize: isMobile ? '1.5rem' : '1.75rem', 
              color: '#00285E' 
            }
          })} 
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            component="div" 
            sx={{ 
              fontWeight: 'medium', 
              color: '#2D3748',
              fontFamily: '"Oswald", sans-serif',
              fontSize: isMobile ? '1.1rem' : isTablet ? '1.2rem' : '1.25rem'
            }}
          >
            {section.label}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ 
          py: isMobile ? 1.5 : 2, 
          px: isMobile ? 1.5 : isTablet ? 2 : 3,
          fontFamily: '"Lato", sans-serif'
        }}>
          {section.id === 'physical' && <PhysicalSection player={selectedPlayer} />}
          {section.id === 'scout-ranks' && <ScoutRankings player={selectedPlayer} />}
          {section.id === 'statistics' && <Stats player={selectedPlayer} />}
        </AccordionDetails>
      </Accordion>
    </Motion.div>
  );
};

export default ProfileSectionAccordion;