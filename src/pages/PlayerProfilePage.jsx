import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import PlayerHero from '../components/ProfileDetails/PlayerHero'
import PlayerProfileTabs from '../components/ProfileDetails/PlayerProfileTabs'
import NavBar from '../components/Nav/NavBar'
import PlayerSidebar from '../components/PlayerSidebar/PlayerSidebar';
import { usePlayers } from '../contexts/playersContextDef';
import { useResponsive } from '../hooks/useResponsive';

const PlayerProfilePage = () => {
  // Get the playerId from the URL parameters
  const { playerId } = useParams();

  // State to store the current player
  const [currentPlayer, setCurrentPlayer] = useState(null);
  
  // State for sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get the players data from the context
  const { players } = usePlayers();
  
  // Responsive breakpoints
  const { isMobile, isTablet } = useResponsive();

  // Fetch the player data based on the playerId
  useEffect(() => {
    // New data uses string IDs like "tank_darryn-peterson"
    const foundPlayer = players.find(p => p.id === playerId);
    setCurrentPlayer(foundPlayer);
  }, [playerId, players]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle sidebar close
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  if (!currentPlayer) {
    return (
      <Box sx={{ 
        p: isMobile ? 4 : 8, 
        textAlign: 'center', 
        color: 'error.main',
        backgroundColor: '#F7FAFC',
        minHeight: '100vh'
      }}>
        Player not found.
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#F7FAFC', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden', 
    }}>
      <NavBar onPlayerSidebarToggle={handleSidebarToggle} />
      <PlayerSidebar 
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
        currentPlayerId={playerId}
      />
      <Box sx={{ 
        p: isMobile ? 4 : isTablet ? 4 : 6,
        maxWidth: '100%',
        overflow: 'hidden', 
      }}>
        <PlayerHero player={currentPlayer} />
        <PlayerProfileTabs playerToDisplay={currentPlayer} />
      </Box>
    </Box>
  )
}

export default PlayerProfilePage; 