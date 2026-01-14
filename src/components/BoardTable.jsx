import { DataGrid } from '@mui/x-data-grid';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';
import { usePlayers } from '../contexts/playersContextDef';
import { useResponsive } from '../hooks/useResponsive';
import {
  createRankCell,
  createStatCell,
  createPctCell,
  createPlayerNameCell,
  createTeamCell,
  createNationalityCell,
  generateStatColumns,
  generateBaseColumns
} from '../utils/BoardTable/columnHelpers';
import { generateTableRows, getDataGridConfig } from '../utils/BoardTable/dataHelpers';
import { getDataGridStyles } from '../utils/BoardTable/tableStyles';

export default function BoardTable() {
  const { players, loading, error, matchStats } = usePlayers();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Show loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          gap: 2
        }}
      >
        <CircularProgress size={48} sx={{ color: '#0053BC' }} />
        <Typography variant="body1" color="text.secondary">
          Loading draft prospects...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load draft data: {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please check your internet connection and try refreshing the page.
        </Typography>
      </Box>
    );
  }

  // Show empty state
  if (!players || players.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          No draft prospects found.
        </Alert>
      </Box>
    );
  }

  // Cell renderers with responsive values
  const renderRankCell = createRankCell(isMobile, isTablet);
  const renderStatCell = createStatCell(isMobile, isTablet);
  const renderPctCell = createPctCell(isMobile, isTablet);
  const renderPlayerNameCell = createPlayerNameCell(isMobile, isTablet);
  const renderTeamCell = createTeamCell(isMobile, isTablet, isDesktop);
  const renderNationalityCell = createNationalityCell();

  // Generate columns
  const baseColumns = generateBaseColumns(
    isMobile,
    isTablet,
    isDesktop,
    renderRankCell,
    renderPlayerNameCell,
    renderTeamCell,
    renderNationalityCell
  );

  const statColumns = generateStatColumns(isMobile, isTablet, renderStatCell, renderPctCell);
  const columns = [...baseColumns, ...statColumns];

  // Row data
  const rows = generateTableRows(players);

  // DataGrid configs
  const dataGridConfig = getDataGridConfig(isMobile, isTablet);

  // Handle row click
  const handleRowClick = (params) => {
    console.log('Selected player:', params.row);
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: isDesktop ? '1400px' : '100%',
      margin: isDesktop ? '0 auto' : '0',
      height: 'calc(100vh - 150px)',
    }}>
      {/* Match stats info (optional - shown on desktop) */}
      {isDesktop && matchStats && (
        <Box sx={{ mb: 1, display: 'flex', gap: 2, fontSize: '0.75rem', color: '#718096' }}>
          <span>Total: {matchStats.total}</span>
          <span>NCAA players count: {matchStats.total - matchStats.international}</span>
          {matchStats.international > 0 && (
            <span>International: {matchStats.international}</span>
          )}
        </Box>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        onRowClick={handleRowClick}
        sx={getDataGridStyles(isMobile)}
        getRowClassName={(params) => params.row.rank === 31 ? 'round-2-start' : ''}
        {...dataGridConfig}
      />
    </div>
  );
}
