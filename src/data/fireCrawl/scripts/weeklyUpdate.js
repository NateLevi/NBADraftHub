/**
 * Weekly Update Script
 *
 * Runs all scrapers, fetches Barttorvik data, merges everything,
 * and uploads to Cloudflare Workers KV.
 *
 * Usage:
 *   npm run update:weekly
 *
 * Prerequisites:
 *   - FIRECRAWL_API_KEY in local.env
 *   - CF_ACCOUNT_ID in local.env
 *   - CF_API_TOKEN in local.env (needs Workers KV write permission)
 *   - KV_NAMESPACE_ID in local.env
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import scraper functions
import { updateTankathonData } from './updateTankathon.js';
import { updateNBADraftNetData } from './updateNBADraftNet.js';
import { scrapeInternationalStats } from './scrapeInternationalStats.js';

// Import parsers
import { parseTankathonMarkdown } from '../../../utils/parseTankathon.js';
import { parseNBADraftNetMarkdown } from '../../../utils/parseNBADraftNet.js';
import { findBarttorvikMatch, normalizeName, normalizeNameLoose } from '../../../utils/nameMatching.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../../local.env') });

// Configuration
const BARTTORVIK_API_URL = 'https://barttorvik.com/getadvstats.php?year=2026&json=1';
const DRAFT_MD_DIR = path.resolve(__dirname, '../DraftmdFiles');

// Cloudflare Workers KV configuration
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const KV_NAMESPACE_ID = process.env.KV_NAMESPACE_ID;

/**
 * Map Tankathon slugs to image filenames where they differ
 */
const SLUG_TO_IMAGE_MAP = {
  'patrick-ngongba-ii': 'patrick-ngongba',
  'darius-acuff': 'darius-acuff-jr',
  'sergio-de-larrea': 'sergio-de-larrea-asenjo',
  'jojo-tugler': 'joseph-tugler',
  'johann-grunloh': 'johann-gruenloh',
};

/**
 * Player images with PNG extension (all others are JPG)
 */
const PNG_PLAYER_IMAGES = new Set([
  'dame-sarr',
  'karim-lopez',
]);

/**
 * Convert Barttorvik API response (array of arrays) to objects
 * Matches the structure from src/data/players/api.tsx
 */
function convertBarttorvikData(rawData) {
  return rawData.map((playerArray) => ({
    player_name: playerArray[0],
    team: playerArray[1],
    conf: playerArray[2],
    GP: playerArray[3],
    Min_per: playerArray[4],
    ORtg: playerArray[5],
    usg: playerArray[6],
    eFG: playerArray[7],
    TS_per: playerArray[8],
    ORB_per: playerArray[9],
    DRB_per: playerArray[10],
    AST_per: playerArray[11],
    TO_per: playerArray[12],
    FTM: playerArray[13],
    FTA: playerArray[14],
    FT_per: playerArray[15],
    twoPM: playerArray[16],
    twoPA: playerArray[17],
    twoP_per: playerArray[18],
    TPM: playerArray[19],
    TPA: playerArray[20],
    TP_per: playerArray[21],
    blk_per: playerArray[22],
    stl_per: playerArray[23],
    ftr: playerArray[24],
    yr: playerArray[25],
    ht: playerArray[26],
    num: playerArray[27],
    porpag: playerArray[28],
    adjoe: playerArray[29],
    pfr: playerArray[30],
    year: playerArray[31],
    pid: playerArray[32],
    type: playerArray[33],
    recRank: playerArray[34],
    astTov: playerArray[35],
    rimmade: playerArray[36],
    rimmadeRimmiss: playerArray[37],
    midmade: playerArray[38],
    midmadeMidmiss: playerArray[39],
    rimmadeRatio: playerArray[40],
    midmadeRatio: playerArray[41],
    dunksmade: playerArray[42],
    dunksTotal: playerArray[43],
    dunksRatio: playerArray[44],
    pick: playerArray[45],
    drtg: playerArray[46],
    adrtg: playerArray[47],
    dporpag: playerArray[48],
    stops: playerArray[49],
    bpm: playerArray[50],
    obpm: playerArray[51],
    dbpm: playerArray[52],
    gbpm: playerArray[53],
    mp: playerArray[54],
    ogbpm: playerArray[55],
    dgbpm: playerArray[56],
    oreb: playerArray[57],
    dreb: playerArray[58],
    treb: playerArray[59],
    ast: playerArray[60],
    stl: playerArray[61],
    blk: playerArray[62],
    pts: playerArray[63],
    role: playerArray[64],
    threePPer100: playerArray[65],
  }));
}

/**
 * Fetch Barttorvik data directly
 */
async function fetchBarttorvikData() {
  console.log('Fetching Barttorvik data...');
  console.log(`URL: ${BARTTORVIK_API_URL}`);

  const response = await fetch(BARTTORVIK_API_URL);

  if (!response.ok) {
    throw new Error(`Barttorvik API error: ${response.status}`);
  }

  const rawData = await response.json();
  const converted = convertBarttorvikData(rawData);

  console.log(`Fetched ${converted.length} players from Barttorvik`);
  return converted;
}

/**
 * Get image slug for player (handles name mismatches)
 */
function getImageSlug(slug) {
  return SLUG_TO_IMAGE_MAP[slug] || slug;
}

/**
 * Get player photo URL (local path)
 */
function getPlayerPhotoUrl(slug) {
  const imageSlug = getImageSlug(slug);
  const extension = PNG_PLAYER_IMAGES.has(imageSlug) ? 'png' : 'jpg';
  return `/players/${imageSlug}.${extension}`;
}

/**
 * Helper functions for stats mapping
 */
function round(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return null;
  return Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function toPct(val) {
  if (val === null || val === undefined || isNaN(val)) return null;
  if (val > 1) return round(val);
  return round(val * 100);
}

/**
 * Map Barttorvik stats to display format
 */
function mapBarttorvikStats(bt) {
  if (!bt) return null;

  const gp = bt.GP || 1;
  const perGame = (total) => {
    if (total === null || total === undefined || isNaN(total)) return null;
    return round(total / gp);
  };

  const fgm = (bt.twoPM || 0) + (bt.TPM || 0);
  const fga = (bt.twoPA || 0) + (bt.TPA || 0);
  const fgPct = fga > 0 ? (fgm / fga) * 100 : null;

  return {
    GP: bt.GP,
    MP: round(bt.Min_per),
    PTS: round(bt.pts),
    FGM: perGame(fgm),
    FGA: perGame(fga),
    'FG%': round(fgPct),
    '2PM': perGame(bt.twoPM),
    '2PA': perGame(bt.twoPA),
    '2P%': toPct(bt.twoP_per),
    '3PM': perGame(bt.TPM),
    '3PA': perGame(bt.TPA),
    '3P%': toPct(bt.TP_per),
    FTM: perGame(bt.FTM),
    FTA: perGame(bt.FTA),
    'FT%': toPct(bt.FT_per),
    ORB: round(bt.oreb),
    DRB: round(bt.dreb),
    TRB: round(bt.treb),
    AST: round(bt.ast),
    STL: round(bt.stl),
    BLK: round(bt.blk),
    'eFG%': round(bt.eFG),
    'TS%': round(bt.TS_per),
    USG: round(bt.usg),
    ORtg: round(bt.ORtg, 0),
    DRtg: round(bt.drtg, 0),
    BPM: round(bt.bpm),
    OBPM: round(bt.obpm),
    DBPM: round(bt.dbpm),
    team: bt.team,
    conf: bt.conf,
  };
}

/**
 * Map international stats to display format
 */
function mapInternationalStats(stats) {
  if (!stats) return null;

  return {
    GP: stats.GP,
    MP: stats.MP,
    PTS: stats.PTS,
    FGM: stats.FGM,
    FGA: stats.FGA,
    'FG%': stats['FG%'],
    '2PM': null,
    '2PA': null,
    '2P%': null,
    '3PM': stats['3PM'],
    '3PA': stats['3PA'],
    '3P%': stats['3P%'],
    FTM: stats.FTM,
    FTA: stats.FTA,
    'FT%': stats['FT%'],
    ORB: stats.ORB,
    DRB: stats.DRB,
    TRB: stats.TRB,
    AST: stats.AST,
    STL: stats.STL,
    BLK: stats.BLK,
    'eFG%': stats['eFG%'],
    'TS%': stats['TS%'],
    USG: stats.USG,
    ORtg: stats.ORtg,
    DRtg: stats.DRtg,
    BPM: stats.BPM,
    OBPM: stats.OBPM,
    DBPM: stats.DBPM,
    team: stats.team,
    conf: null,
    source: 'tankathon',
  };
}

/**
 * Calculate consensus rank from available rankings
 */
function calculateConsensusRank(tankathonRank, nbaDraftNetRank) {
  const ranks = [tankathonRank, nbaDraftNetRank].filter(
    r => r !== null && r !== undefined && r > 0
  );
  if (ranks.length === 0) return 999;
  const avg = ranks.reduce((a, b) => a + b, 0) / ranks.length;
  return Math.round(avg * 10) / 10;
}

/**
 * Generate player ID from slug
 */
function generatePlayerId(slug) {
  return `player_${slug}`;
}

/**
 * Create slug from player name
 */
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/['']/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Merge all data sources (Node.js version)
 * This is a standalone version of mergeDraftData that works without Vite
 */
async function mergeDataForUpload(tankathonMd, nbaDraftNetMd, barttorvikData, internationalStatsData) {
  // Parse both sources
  const tankathonPlayers = tankathonMd ? parseTankathonMarkdown(tankathonMd) : [];
  const nbaDraftNetPlayers = nbaDraftNetMd ? parseNBADraftNetMarkdown(nbaDraftNetMd) : [];

  console.log(`Parsed: ${tankathonPlayers.length} Tankathon, ${nbaDraftNetPlayers.length} NBADraft.net`);

  // Create player map
  const playerMap = new Map();

  // Add Tankathon players first (primary source)
  for (const tp of tankathonPlayers) {
    const normalizedName = normalizeName(tp.name);
    playerMap.set(normalizedName, {
      name: tp.name,
      slug: tp.slug,
      tankathonRank: tp.tankathonRank,
      nbaDraftNetRank: null,
      position: tp.position,
      school: tp.school,
      height: tp.height,
      heightInches: tp.heightInches,
      weight: tp.weight,
      year: tp.year,
      age: tp.age,
    });
  }

  // Create loose name index for fallback matching
  const looseNameIndex = new Map();
  for (const [strictName, player] of playerMap.entries()) {
    const looseName = normalizeNameLoose(player.name);
    if (!looseNameIndex.has(looseName)) {
      looseNameIndex.set(looseName, strictName);
    }
  }

  // Add NBADraft.net rankings
  for (const ndp of nbaDraftNetPlayers) {
    const normalizedName = normalizeName(ndp.name);
    let existing = playerMap.get(normalizedName);

    if (!existing) {
      const looseName = normalizeNameLoose(ndp.name);
      const strictKey = looseNameIndex.get(looseName);
      if (strictKey) {
        existing = playerMap.get(strictKey);
      }
    }

    if (existing) {
      existing.nbaDraftNetRank = ndp.nbaDraftNetRank;
    } else {
      playerMap.set(normalizedName, {
        name: ndp.name,
        slug: ndp.slug || createSlug(ndp.name),
        tankathonRank: null,
        nbaDraftNetRank: ndp.nbaDraftNetRank,
        position: ndp.position,
        school: ndp.school,
        height: ndp.height,
        heightInches: ndp.heightInches,
        weight: ndp.weight,
        year: ndp.year,
        age: null,
      });
      const looseName = normalizeNameLoose(ndp.name);
      if (!looseNameIndex.has(looseName)) {
        looseNameIndex.set(looseName, normalizedName);
      }
    }
  }

  // Track stats
  let matched = 0;
  let unmatched = 0;
  let international = 0;
  let internationalWithStats = 0;
  let withBothSources = 0;
  let tankathonOnly = 0;

  const allPlayers = Array.from(playerMap.values());
  const tankathonBasedPlayers = allPlayers.filter(p => p.tankathonRank !== null);

  tankathonBasedPlayers.forEach(p => {
    if (p.nbaDraftNetRank !== null) {
      withBothSources++;
    } else {
      tankathonOnly++;
    }
  });

  // Build final player objects
  const players = tankathonBasedPlayers.map(p => {
    const consensusRank = calculateConsensusRank(p.tankathonRank, p.nbaDraftNetRank);
    const isInternational = p.year === 'International';
    const barttorvikMatch = findBarttorvikMatch(p, barttorvikData);

    // Get international stats if available
    let intlStats = null;
    if (isInternational && internationalStatsData?.players?.[p.slug]) {
      intlStats = internationalStatsData.players[p.slug].stats;
    }

    let stats = null;
    let hasTankathonStats = false;

    if (barttorvikMatch) {
      matched++;
      stats = mapBarttorvikStats(barttorvikMatch);
    } else if (isInternational && intlStats) {
      international++;
      internationalWithStats++;
      stats = mapInternationalStats(intlStats);
      hasTankathonStats = true;
    } else if (isInternational) {
      international++;
    } else {
      unmatched++;
    }

    return {
      id: generatePlayerId(p.slug),
      playerId: generatePlayerId(p.slug),
      name: p.name,
      slug: p.slug,
      photoUrl: getPlayerPhotoUrl(p.slug),
      tankathonRank: p.tankathonRank,
      nbaDraftNetRank: p.nbaDraftNetRank,
      consensusRank,
      position: p.position || '',
      currentTeam: p.school || '',
      leagueType: isInternational ? 'International' : 'NCAA',
      height: p.heightInches,
      heightDisplay: p.height || '',
      weight: p.weight,
      age: p.age,
      year: p.year || 'Unknown',
      hasBarttorvikData: !!barttorvikMatch,
      hasTankathonStats,
      hasStats: !!stats,
      isInternational,
      stats,
    };
  });

  // Sort by consensus rank
  players.sort((a, b) => a.consensusRank - b.consensusRank);

  return {
    players,
    matchStats: {
      total: players.length,
      matched,
      unmatched,
      international,
      internationalWithStats,
      withBothSources,
      tankathonOnly,
      sourceCounts: {
        tankathon: tankathonPlayers.length,
        nbaDraftNet: nbaDraftNetPlayers.length,
      }
    }
  };
}

/**
 * Upload merged data to Cloudflare Workers KV
 */
async function uploadToWorkersKV(data) {
  console.log('\nUploading to Workers KV...');

  if (!CF_ACCOUNT_ID || !CF_API_TOKEN || !KV_NAMESPACE_ID) {
    throw new Error(
      'Missing Cloudflare credentials. Please set in local.env:\n' +
      '  CF_ACCOUNT_ID\n' +
      '  CF_API_TOKEN\n' +
      '  KV_NAMESPACE_ID'
    );
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${KV_NAMESPACE_ID}/values/draft-data`;

  const payload = {
    players: data.players,
    matchStats: data.matchStats,
    updatedAt: new Date().toISOString(),
  };

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`KV upload failed: ${response.status} - ${errorText}`);
  }

  console.log('Successfully uploaded to Workers KV');
  console.log(`  Key: draft-data`);
  console.log(`  Players: ${data.players.length}`);
}

/**
 * Main weekly update function
 */
async function weeklyUpdate() {
  console.log('='.repeat(60));
  console.log('WEEKLY UPDATE - Starting...');
  console.log('='.repeat(60));
  console.log(`Time: ${new Date().toISOString()}\n`);

  try {
    // Step 1: Run scrapers
    console.log('\n[1/6] Running Tankathon scraper...');
    await updateTankathonData();

    console.log('\n[2/6] Running NBADraft.net scraper...');
    await updateNBADraftNetData();

    console.log('\n[3/6] Running International Stats scraper...');
    await scrapeInternationalStats();

    // Step 2: Fetch Barttorvik data
    console.log('\n[4/6] Fetching Barttorvik data...');
    const barttorvikData = await fetchBarttorvikData();

    // Step 3: Read all data files
    console.log('\n[5/6] Reading data files and merging...');

    const tankathonMd = await fs.readFile(
      path.join(DRAFT_MD_DIR, 'tankathon.md'),
      'utf-8'
    );

    const nbaDraftNetMd = await fs.readFile(
      path.join(DRAFT_MD_DIR, 'nbadraft-net.md'),
      'utf-8'
    );

    let internationalStatsData = null;
    try {
      const intlStatsRaw = await fs.readFile(
        path.join(DRAFT_MD_DIR, 'international-stats.json'),
        'utf-8'
      );
      internationalStatsData = JSON.parse(intlStatsRaw);
    } catch (e) {
      console.log('  (No international stats file found, continuing without)');
    }

    // Step 4: Merge all data
    const mergedData = await mergeDataForUpload(
      tankathonMd,
      nbaDraftNetMd,
      barttorvikData,
      internationalStatsData
    );

    console.log('\nMerge Results:');
    console.log(`  Total players: ${mergedData.players.length}`);
    console.log(`  Matched with Barttorvik: ${mergedData.matchStats.matched}`);
    console.log(`  International: ${mergedData.matchStats.international}`);
    console.log(`  International with stats: ${mergedData.matchStats.internationalWithStats}`);
    console.log(`  Unmatched college: ${mergedData.matchStats.unmatched}`);

    // Step 5: Save local backup
    const backupPath = path.join(DRAFT_MD_DIR, 'merged-data.json');
    await fs.writeFile(backupPath, JSON.stringify(mergedData, null, 2), 'utf-8');
    console.log(`\nLocal backup saved: ${backupPath}`);

    // Step 6: Upload to Workers KV
    console.log('\n[6/6] Uploading to Workers KV...');
    await uploadToWorkersKV(mergedData);

    // Done!
    console.log('\n' + '='.repeat(60));
    console.log('WEEKLY UPDATE - Complete!');
    console.log('='.repeat(60));
    console.log(`Finished at: ${new Date().toISOString()}`);

    return mergedData;

  } catch (error) {
    console.error('\nWeekly update FAILED:', error.message);
    throw error;
  }
}

// Run if called directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  weeklyUpdate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { weeklyUpdate };
