import { ListItem, ListItemAvatar, ListItemText, Avatar, Chip, Box, Typography } from '@mui/material';
import {
  getPlayerItemStyles,
  playerNameStyles,
  playerInfoStyles,
  getRankChipStyles
} from '../../utils/Sidebar/sidebarStyles';

function PlayerListItem({ player, isSelected, onClick }) {
  return (
    <ListItem
      onClick={() => onClick(player.id)}
      selected={isSelected}
      sx={getPlayerItemStyles(isSelected)}
    >
      {/* Player Avatar */}
      <ListItemAvatar>
        <Avatar
          src={player.photoUrl}
          sx={{ width: 40, height: 40 }}
        >
          {player.name.charAt(0)}
        </Avatar>
      </ListItemAvatar>

      {/* Player Info */}
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={playerNameStyles}>
              {player.name}
            </Typography>
            <Chip
              label={`#${player.consensusRank}`}
              size="small"
              sx={getRankChipStyles(isSelected)}
            />
          </Box>
        }
        secondary={
          <Typography variant="caption" sx={playerInfoStyles}>
            {player.position} • {player.currentTeam}
          </Typography>
        }
      />
    </ListItem>
  );
}

export default PlayerListItem; 