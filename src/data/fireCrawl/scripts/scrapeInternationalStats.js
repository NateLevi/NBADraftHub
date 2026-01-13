/**
 * Firecrawl Script to Scrape International Player Stats from Tankathon
 * 
 * This script:
 * 1. Reads the tankathon.md file to identify international players
 * 2. Scrapes each international player's profile page from Tankathon
 * 3. Parses their stats and saves them to international-stats.json
 * 
 * Usage:
 *   node src/data/firecrawl/scripts/scrapeInternationalStats.js
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import the parsers
import { parseTankathonMarkdown } from '../../../utils/parseTankathon.js';
import { parseTankathonPlayerStats, parsePlayerTeam } from '../../../utils/parseTankathonPlayerStats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from local.env
dotenv.config({ path: path.resolve(__dirname, '../../../../local.env') });

// Configuration
const TANKATHON_MD_FILE = path.resolve(__dirname, '../DraftmdFiles/tankathon.md');
const OUTPUT_FILE = path.resolve(__dirname, '../DraftmdFiles/international-stats.json');
const TANKATHON_PLAYER_URL_BASE = 'https://www.tankathon.com/players/';

// Rate limiting - be nice to the server
const DELAY_BETWEEN_REQUESTS_MS = 1500;

/**
 * Delay helper function
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to scrape international player stats
 */
async function scrapeInternationalStats() {
  console.log('🌍 Starting international player stats scrape...\n');

  try {
    // Check for API key
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error(
        'FIRECRAWL_API_KEY environment variable is not set.\n' +
        'Please add it to your local.env file.'
      );
    }

    // Read the tankathon markdown file
    console.log('📄 Reading tankathon.md...');
    const tankathonMarkdown = await fs.readFile(TANKATHON_MD_FILE, 'utf-8');
    
    // Parse to get all players
    const allPlayers = parseTankathonMarkdown(tankathonMarkdown);
    console.log(`   Found ${allPlayers.length} total players`);

    // Filter for international players
    const internationalPlayers = allPlayers.filter(p => p.year === 'International');
    console.log(`   Found ${internationalPlayers.length} international players:\n`);
    
    internationalPlayers.forEach(p => {
      console.log(`   • ${p.name} (${p.school}) - slug: ${p.slug}`);
    });
    console.log('');

    if (internationalPlayers.length === 0) {
      console.log('⚠️  No international players found. Nothing to scrape.');
      return;
    }

    // Initialize Firecrawl
    const app = new FirecrawlApp({ 
      apiKey: process.env.FIRECRAWL_API_KEY 
    });

    // Scrape each international player's page
    const results = {};
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < internationalPlayers.length; i++) {
      const player = internationalPlayers[i];
      const url = `${TANKATHON_PLAYER_URL_BASE}${player.slug}`;
      
      console.log(`\n🏀 [${i + 1}/${internationalPlayers.length}] Scraping ${player.name}...`);
      console.log(`   URL: ${url}`);

      try {
        const result = await app.scrapeUrl(url, {
          formats: ['markdown'],
          onlyMainContent: true,
        });

        if (!result.markdown) {
          console.log(`   ❌ No markdown content returned`);
          failCount++;
          continue;
        }

        // Parse the stats from the markdown
        const stats = parseTankathonPlayerStats(result.markdown);
        const team = parsePlayerTeam(result.markdown);

        if (stats) {
          // Add player info to stats
          stats.team = team || player.school;
          
          results[player.slug] = {
            name: player.name,
            slug: player.slug,
            tankathonRank: player.tankathonRank,
            stats: stats,
            scrapedAt: new Date().toISOString(),
          };
          
          console.log(`   ✅ Stats parsed successfully`);
          console.log(`      GP: ${stats.GP}, PTS: ${stats.PTS}, REB: ${stats.TRB}, AST: ${stats.AST}`);
          successCount++;
        } else {
          console.log(`   ⚠️  Could not parse stats from page`);
          failCount++;
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        failCount++;
      }

      // Rate limiting - wait between requests
      if (i < internationalPlayers.length - 1) {
        await delay(DELAY_BETWEEN_REQUESTS_MS);
      }
    }

    // Save results to JSON file
    console.log(`\n💾 Saving results to: ${OUTPUT_FILE}`);
    
    const output = {
      metadata: {
        generatedAt: new Date().toISOString(),
        totalPlayers: internationalPlayers.length,
        successfulScrapes: successCount,
        failedScrapes: failCount,
      },
      players: results,
    };

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully scraped: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📄 Output file: ${OUTPUT_FILE}`);

    return output;

  } catch (error) {
    console.error('\n❌ Error scraping international stats:', error.message);
    throw error;
  }
}

// Run if called directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  scrapeInternationalStats()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { scrapeInternationalStats };
