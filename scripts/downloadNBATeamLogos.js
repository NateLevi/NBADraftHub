/**
 * Script to download NBA team logos from Tankathon markdown
 * Parses tankathon.md to extract team logos for each pick (1-60)
 * Downloads SVG logos and generates draft order mapping
 *
 * Usage: node scripts/downloadNBATeamLogos.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TANKATHON_MD_PATH = path.join(__dirname, '../src/data/fireCrawl/DraftmdFiles/tankathon.md');
const NBA_TEAMS_DIR = path.join(__dirname, '../public/nbateams');
const DRAFT_ORDER_OUTPUT = path.join(__dirname, '../src/data/draftOrderMapping.json');

/**
 * Download file from URL (supports both HTTP and HTTPS)
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    const protocol = url.startsWith('https') ? https : http;

    protocol.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

/**
 * Parse tankathon.md to extract pick numbers and team logos
 */
function parseTankathonForTeams(content) {
  const pickData = [];
  const lines = content.split('\n');

  let currentPick = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match pick number (standalone number line)
    if (/^\d+$/.test(line)) {
      currentPick = parseInt(line);
      continue;
    }

    // Match team logo line
    // Pattern: [![ATL](http://d2uki2uvp6v3wr.cloudfront.net/nba/atl.svg)](team_link)
    const teamMatch = line.match(/\[!\[([A-Z]+)\]\((http:\/\/d2uki2uvp6v3wr\.cloudfront\.net\/nba\/(\w+)\.svg)\)\]/);

    if (teamMatch && currentPick) {
      const teamCode = teamMatch[1];
      const logoUrl = teamMatch[2];
      const fileCode = teamMatch[3];

      // Only take the FIRST team logo for each pick (current owner)
      if (!pickData.find(p => p.pick === currentPick)) {
        pickData.push({
          pick: currentPick,
          teamCode: teamCode,
          logoUrl: logoUrl,
          fileCode: fileCode
        });
      }

      currentPick = null; // Reset after finding team
    }
  }

  return pickData;
}

/**
 * Main function
 */
async function main() {
  console.log('🏀 NBA Team Logo Downloader\n');

  // Create nbateams directory if it doesn't exist
  if (!fs.existsSync(NBA_TEAMS_DIR)) {
    fs.mkdirSync(NBA_TEAMS_DIR, { recursive: true });
    console.log('✓ Created public/nbateams directory\n');
  }

  // Read tankathon.md
  console.log('📖 Reading tankathon.md...');
  const content = fs.readFileSync(TANKATHON_MD_PATH, 'utf-8');

  // Parse team data
  console.log('🔍 Parsing draft order...');
  const pickData = parseTankathonForTeams(content);

  if (pickData.length === 0) {
    console.error('✗ No team logos found in tankathon.md');
    process.exit(1);
  }

  console.log(`✓ Found ${pickData.length} draft picks\n`);

  // Download logos
  console.log('⬇️  Downloading team logos...');
  const uniqueTeams = new Set();
  const draftOrder = {};

  let downloadCount = 0;
  let skipCount = 0;

  for (const pick of pickData) {
    const logoPath = path.join(NBA_TEAMS_DIR, `${pick.fileCode}.svg`);

    // Store draft order mapping
    draftOrder[pick.pick.toString()] = pick.teamCode;

    // Download logo if not already downloaded
    if (!uniqueTeams.has(pick.fileCode)) {
      try {
        if (fs.existsSync(logoPath)) {
          skipCount++;
        } else {
          await downloadFile(pick.logoUrl, logoPath);
          downloadCount++;
          console.log(`  ✓ Downloaded ${pick.teamCode} (${pick.fileCode}.svg)`);
        }
        uniqueTeams.add(pick.fileCode);
      } catch (error) {
        console.error(`  ✗ Failed to download ${pick.teamCode}: ${error.message}`);
      }

      // Add small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n✓ Downloaded ${downloadCount} new logos`);
  if (skipCount > 0) {
    console.log(`  Skipped ${skipCount} existing logos`);
  }
  console.log(`  Total unique teams: ${uniqueTeams.size}\n`);

  // Write draft order mapping
  console.log('💾 Generating draft order mapping...');
  const mappingContent = JSON.stringify(draftOrder, null, 2);
  fs.writeFileSync(DRAFT_ORDER_OUTPUT, mappingContent, 'utf-8');
  console.log(`✓ Created ${path.relative(process.cwd(), DRAFT_ORDER_OUTPUT)}`);
  console.log(`  Mapped ${Object.keys(draftOrder).length} picks\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`  • Picks mapped: ${Object.keys(draftOrder).length}`);
  console.log(`  • Unique NBA teams: ${uniqueTeams.size}`);
  console.log(`  • Logo files: ${fs.readdirSync(NBA_TEAMS_DIR).filter(f => f.endsWith('.svg')).length}`);
  console.log('\n✅ Done!\n');
}

// Run the script
main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
