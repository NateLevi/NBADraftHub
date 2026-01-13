// Sort options
export const SORT_OPTIONS = [
  { value: 'rank', label: 'Draft Rank' },
  { value: 'name', label: 'Player Name' },
];

// Position filter options
export const POSITION_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'G', label: 'G' },
  { value: 'F', label: 'F' },
  { value: 'C', label: 'C' },
];

// Process players with ranks (use consensusRank from merged data)
export const processPlayersWithRanks = (players, scouts) => {
  return players.map(player => ({
    ...player,
    // Use consensusRank (average of all sources) or fall back to tankathonRank
    consensusRank: player.consensusRank || player.tankathonRank || 999
  }));
};

// Filter players by search term
export const filterPlayersBySearch = (players, searchTerm) => {
  if (!searchTerm.trim()) return players;
  
  return players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Filter players by position
// Uses includes() to match composite positions like "SG/SF" with "G" or "F"
export const filterPlayersByPosition = (players, positionFilter) => {
  if (positionFilter === 'all') return players;

  return players.filter(player => player.position.includes(positionFilter));
};

// Sort players based on sort option
export const sortPlayers = (players, sortBy) => {
  return [...players].sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.consensusRank - b.consensusRank;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return a.consensusRank - b.consensusRank;
    }
  });
};

// process all filters and sorting
export const processPlayers = (players, scouts, searchTerm, sortBy, positionFilter) => {
  // Add consensus ranks
  const playersWithRanks = processPlayersWithRanks(players, scouts);
  
  // Apply filters
  let filteredPlayers = filterPlayersBySearch(playersWithRanks, searchTerm);
  filteredPlayers = filterPlayersByPosition(filteredPlayers, positionFilter);
  
  // Sort players
  return sortPlayers(filteredPlayers, sortBy);
}; 