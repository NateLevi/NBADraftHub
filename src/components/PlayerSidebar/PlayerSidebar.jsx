import React, { useState, useMemo } from 'react';
import { Drawer, Box, Typography, List, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../../contexts/playersContextDef';
import PlayerListItem from './PlayerListItem';
import SidebarFilters from './SidebarFilters';
import { processPlayers } from '../../utils/Sidebar/sidebarHelpers';
import { 
  drawerStyles, 
  headerStyles, 
  countStyles, 
  listStyles, 
  emptyStateStyles, 
  emptyTextStyles,
  SIDEBAR_COLORS 
} from '../../utils/Sidebar/sidebarStyles';

const PlayerSidebar = ({ isOpen, onClose, currentPlayerId }) => {
  // State for searching and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rank'); 
  const [positionFilter, setPositionFilter] = useState('all'); 
  
  // Get players and scouts from context
  const { players, scouts } = usePlayers();
  const navigate = useNavigate();

  // Process and filter players using extracted helper and memo to prevent unnecessary re-renders
  const processedPlayers = useMemo(() => {
    return processPlayers(players, scouts, searchTerm, sortBy, positionFilter);
  }, [players, scouts, searchTerm, sortBy, positionFilter]);

  // Handle player selection
  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
    onClose(); 
  };

  // Generate results count text
  const getResultsText = () => {
    const count = processedPlayers.length;
    const playerText = count !== 1 ? 'players' : 'player';
    const filterText = positionFilter !== 'all' ? ` (${positionFilter} only)` : '';
    return `${count} ${playerText}${filterText}`;
  };

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      sx={drawerStyles}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Typography variant="h6" sx={headerStyles}>
          Player Navigator
        </Typography>
        
        {/* Results Count */}
        <Typography variant="body2" sx={countStyles}>
          {getResultsText()}
        </Typography>

        {/* Filters */}
        <SidebarFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          positionFilter={positionFilter}
          onPositionChange={setPositionFilter}
        />

        <Divider sx={{ mb: 2, borderColor: SIDEBAR_COLORS.border }} />

        {/* Players List */}
        <List sx={listStyles}>
          {processedPlayers.map((player) => (
            <PlayerListItem
              key={player.id}
              player={player}
              isSelected={player.id === currentPlayerId}
              onClick={handlePlayerClick}
            />
          ))}
        </List>

        {/* Empty State */}
        {processedPlayers.length === 0 && (
          <Box sx={emptyStateStyles}>
            <Typography variant="body2" sx={emptyTextStyles}>
              No players found matching "{searchTerm}"
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default PlayerSidebar; 