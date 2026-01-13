import React, { useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Avatar,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { usePlayers } from '../../contexts/playersContextDef';

// Styling constants
const COLORS = {
  primary: '#00285E',
  secondary: '#4A5568',
  background: '#FFFFFF',
  border: '#E2E8F0',
  text: '#2D3748',
  chipBg: '#F7FAFC',
  hoverBg: '#F7FAFC',
  selectedBg: 'rgba(0, 40, 94, 0.08)',
  selectedHoverBg: 'rgba(0, 40, 94, 0.12)',
};

const CompareDropdown = ({
  selectedPlayer,
  onPlayerChange,
  label = "Select Player",
  excludePlayerId = null
}) => {
  const { players } = usePlayers();

  // Process and sort players by draft rank (tankathonRank)
  const sortedPlayers = useMemo(() => {
    return players
      .filter(player => player.id !== excludePlayerId)
      .map(player => ({
        ...player,
        // Use tankathonRank from new data structure
        consensusRank: player.tankathonRank || 999
      }))
      .sort((a, b) => a.consensusRank - b.consensusRank);
  }, [players, excludePlayerId]);

  const handleChange = (event, newValue) => {
    onPlayerChange(newValue);
  };

  // Filter options based on search input
  const filterOptions = (options, { inputValue }) => {
    const searchTerm = inputValue.toLowerCase();
    return options.filter(option =>
      option.name.toLowerCase().includes(searchTerm) ||
      option.position.toLowerCase().includes(searchTerm) ||
      option.currentTeam.toLowerCase().includes(searchTerm)
    );
  };

  // Text field styles
  const getTextFieldStyles = () => ({
    minWidth: 300,
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: COLORS.border },
      '&:hover fieldset': { borderColor: COLORS.primary },
      '&.Mui-focused fieldset': { borderColor: COLORS.primary },
    },
    '& .MuiInputLabel-root': {
      color: COLORS.secondary,
      fontFamily: '"Lato", sans-serif',
      '&.Mui-focused': { color: COLORS.primary },
    },
    '& .MuiInputBase-input': {
      fontFamily: '"Lato", sans-serif',
    },
  });

  // Option item styles
  const getOptionStyles = () => ({
    py: 1.5,
    px: 2,
    '&:hover': { backgroundColor: COLORS.hoverBg },
    '&[aria-selected="true"]': {
      backgroundColor: COLORS.selectedBg,
      '&:hover': { backgroundColor: COLORS.selectedHoverBg },
    },
  });

  // Dropdown paper styles
  const getPaperStyles = () => ({
    maxHeight: 400,
    backgroundColor: COLORS.background,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '& .MuiAutocomplete-listbox': {
      fontFamily: '"Lato", sans-serif',
    },
  });

  return (
    <Autocomplete
      value={selectedPlayer}
      onChange={handleChange}
      options={sortedPlayers}
      getOptionLabel={(option) => option?.name || ''}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      filterOptions={filterOptions}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Search by name, position, or team..."
          sx={getTextFieldStyles()}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} sx={getOptionStyles()}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {/* Player Avatar */}
            <Avatar src={option.photoUrl} sx={{ width: 40, height: 40 }}>
              {option.name?.charAt(0)}
            </Avatar>
            
            {/* Player Info */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ 
                  fontWeight: '600',
                  color: COLORS.text,
                  fontFamily: '"Lato", sans-serif'
                }}>
                  {option.name}
                </Typography>
                <Chip 
                  label={`#${option.consensusRank}`}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.75rem',
                    backgroundColor: COLORS.chipBg,
                    color: COLORS.primary,
                    fontFamily: '"Lato", sans-serif',
                    fontWeight: '600',
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ 
                color: COLORS.secondary,
                fontFamily: '"Lato", sans-serif'
              }}>
                {option.position} • {option.currentTeam}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      PaperComponent={({ children, ...other }) => (
        <Box {...other} sx={getPaperStyles()}>
          {children}
        </Box>
      )}
      sx={{
        '& .MuiAutocomplete-inputRoot': {
          fontFamily: '"Lato", sans-serif',
        },
      }}
    />
  );
};

export default CompareDropdown;
