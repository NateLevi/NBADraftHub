import { Link } from 'react-router-dom';
import { Tooltip } from '@mui/material';
import ReactCountryFlag from 'react-country-flag';
import { getCountryCode } from '../formatHelpers';
import { DEFAULT_PLAYER_IMAGE } from '../imageHelpers';
import { getNBATeamName, getNBATeamLogoUrl } from '../nbaTeamHelpers';
import {
  getPlayerCellStyles,
  getPlayerImageStyles,
  getPlayerLinkStyles,
  getTeamCellStyles,
  getLeagueTypeStyles,
  getNationalityStyles,
  getFlagStyles,
  getNationalityTextStyles,
  getNBATeamCellStyles,
  getNBATeamLogoStyles,
} from './tableStyles';

// Default player photo fallback (from Cloudflare R2 helper)
const DEFAULT_PHOTO = DEFAULT_PLAYER_IMAGE;

// NBA Team logo cell renderer (shows which NBA team owns the draft pick)
export const createNBATeamCell = (isMobile, isTablet) => (params) => {
  const teamCode = params.value;

  if (!teamCode) {
    return (
      <span style={{ color: '#718096', fontSize: '0.85rem' }}>
        -
      </span>
    );
  }

  const teamName = getNBATeamName(teamCode);
  const logoUrl = getNBATeamLogoUrl(teamCode);

  return (
    <div style={getNBATeamCellStyles()}>
      <img
        src={logoUrl}
        alt={teamName}
        title={teamName}
        style={getNBATeamLogoStyles(isMobile, isTablet)}
        onError={(e) => {
          e.target.src = '/nbalogo.png'; // Fallback to generic NBA logo
        }}
      />
    </div>
  );
};

// Rank cell renderer (for draft rank)
export const createRankCell = (isMobile, isTablet) => (params) => {
  const value = params.value;

  return (
    <span style={{
      fontWeight: 600,
      fontSize: isMobile ? '0.85rem' : isTablet ? '0.9rem' : '1rem',
      color: '#2D3748',
    }}>
      {value || '-'}
    </span>
  );
};

// Stat cell renderer (for stats like PTS, AST, etc.)
export const createStatCell = (isMobile, isTablet) => (params) => {
  const value = params.value;
  const hasValue = value !== null && value !== undefined;

  if (!hasValue) {
    return (
      <Tooltip title="No data available" placement="top">
        <span style={{
          color: '#A0AEC0',
          fontSize: '0.85rem',
        }}>
          -
        </span>
      </Tooltip>
    );
  }

  // Format the value - show whole numbers for GP, one decimal for others
  let displayValue = value;
  if (typeof value === 'number') {
    // GP should be whole number, others can have decimals
    if (params.field === 'GP') {
      displayValue = Math.round(value);
    } else {
      displayValue = value.toFixed(1);
    }
  }

  return (
    <span style={{
      fontSize: '0.85rem',
      color: '#2D3748',
    }}>
      {displayValue}
    </span>
  );
};

// Percentage stat cell renderer
export const createPctCell = (isMobile, isTablet) => (params) => {
  const value = params.value;
  const hasValue = value !== null && value !== undefined;

  if (!hasValue) {
    return (
      <span style={{
        color: '#A0AEC0',
        fontSize: isMobile ? '0.75rem' : '0.85rem',
      }}>
        -
      </span>
    );
  }

  return (
    <span style={{
      fontSize: isMobile ? '0.75rem' : isTablet ? '0.8rem' : '0.85rem',
      color: '#2D3748',
    }}>
      {value.toFixed(1)}%
    </span>
  );
};

// Player name cell
export const createPlayerNameCell = (isMobile, isTablet) => (params) => (
  <div style={getPlayerCellStyles(isMobile, isTablet)}>
    <img
      src={params.row.photoUrl || DEFAULT_PHOTO}
      alt={params.value}
      style={getPlayerImageStyles(isMobile, isTablet)}
    />
    <Link
      to={`/players/${params.row.id}`}
      style={getPlayerLinkStyles(isMobile, isTablet)}
      title={params.value}
    >
      {params.value}
    </Link>
  </div>
);

// Team cell
export const createTeamCell = (isMobile, isTablet, isDesktop) => (params) => {
  const styles = getTeamCellStyles(isMobile, isTablet, isDesktop);

  if (isDesktop) {
    return (
      <div style={styles}>
        <span>{params.row.school}</span>
        {params.row.leagueType && (
          <span style={getLeagueTypeStyles()}>
            ({params.row.leagueType})
          </span>
        )}
      </div>
    );
  }

  return (
    <span style={styles} title={params.row.school}>
      {params.row.school}
    </span>
  );
};

// Nationality cell
export const createNationalityCell = () => (params) => {
  const countryCode = getCountryCode(params.value);

  if (countryCode) {
    return (
      <div style={getNationalityStyles()}>
        <ReactCountryFlag
          countryCode={countryCode}
          svg
          style={getFlagStyles()}
          title={params.value}
        />
        <span style={getNationalityTextStyles()}>
          {params.value.length > 12
            ? `${params.value.substring(0, 12)}...`
            : params.value
          }
        </span>
      </div>
    );
  }

  return (
    <span style={getNationalityTextStyles()}>
      {params.value || 'N/A'}
    </span>
  );
};

// Generate stat columns for the table
// All stats shown on all screen sizes with adequate widths for full data
export const generateStatColumns = (isMobile, isTablet, renderStatCell, renderPctCell) => {
  const stats = [
    { field: 'GP', headerName: 'GP', width: 50 },
    { field: 'PTS', headerName: 'PTS', width: 55 },
    { field: 'TRB', headerName: 'REB', width: 55 },
    { field: 'AST', headerName: 'AST', width: 55 },
    { field: 'STL', headerName: 'STL', width: 50 },
    { field: 'BLK', headerName: 'BLK', width: 50 },
  ];

  return stats.map(col => ({
    field: col.field,
    headerName: col.headerName,
    width: col.width,
    renderCell: renderStatCell,
    headerAlign: 'center',
    align: 'center',
  }));
};

// Base columns (NBA Team, Rank, Player, Age, Height, Position, Team)
// All columns shown on all screen sizes with adequate widths for full data
export const generateBaseColumns = (isMobile, isTablet, isDesktop, renderRankCell, renderPlayerNameCell, renderTeamCell, renderNationalityCell) => {
  const columns = [];

  // NBA Team column (first column - shows which NBA team owns the draft pick)
  columns.push({
    field: 'nbaTeam',
    headerName: 'Team',
    width: isMobile ? 60 : isTablet ? 70 : 80,
    renderCell: createNBATeamCell(isMobile, isTablet),
    headerAlign: 'center',
    align: 'center',
    sortable: true,
  });

  // Rank column
  columns.push({
    field: 'rank',
    headerName: '#',
    width: 50,
    renderCell: renderRankCell,
    headerAlign: 'center',
    align: 'center',
  });

  // Player name column
  columns.push({
    field: 'name',
    headerName: 'Player',
    flex: 1,
    minWidth: 160,
    renderCell: renderPlayerNameCell,
  });

  // Age column
  columns.push({
    field: 'age',
    headerName: 'Age',
    width: 55,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <span style={{ fontSize: '0.85rem' }}>
        {params.value ? params.value.toFixed(1) : '-'}
      </span>
    ),
  });

  // Height column
  columns.push({
    field: 'height',
    headerName: 'Ht',
    width: 65,
    headerAlign: 'center',
    align: 'center',
  });

  // Position column - wider to fit "SF/PF" etc
  columns.push({
    field: 'position',
    headerName: 'Pos',
    width: 70,
    headerAlign: 'center',
    align: 'center',
  });

  // Class column - displays year (Freshman, Sophomore, etc.)
  columns.push({
    field: 'year',
    headerName: 'Class',
    width: 90,
    headerAlign: 'center',
    align: 'center',
    renderCell: (params) => (
      <span style={{ fontSize: '0.85rem', color: '#2D3748' }}>
        {params.value || '-'}
      </span>
    ),
  });

  // Team column - wide enough for "North Carolina", "Virginia Tech", etc.
  columns.push({
    field: 'school',
    headerName: 'Team',
    width: 180,
    renderCell: renderTeamCell,
  });

  return columns;
};
