/**
 * Firecrawl Script to Update NBA Draft Room Mock Draft Data
 * 
 * This script scrapes both the first and second round pages from NBA Draft Room
 * and combines them into a single markdown file.
 * Run this script whenever you need to update the draft data.
 * 
 * Usage:
 *   node src/data/firecrawl/updateNBADraftRoom.js
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from local.env
dotenv.config({ path: path.resolve(__dirname, '../../../local.env') });

// Configuration
const FIRST_ROUND_URL = 'https://nbadraftroom.com/2026-nba-mock-draft/';
const SECOND_ROUND_URL = 'https://nbadraftroom.com/2026-2nd-round/';
const OUTPUT_FILE = path.resolve(__dirname, '../DraftmdFiles/nbadraftroom.md');

async function scrapeUrl(app, url, roundName) {
  console.log(`⏳ Scraping ${roundName}: ${url}`);
  
  const result = await app.scrapeUrl(url, {
    formats: ['markdown'],
    onlyMainContent: true,
  });

  if (!result.markdown) {
    throw new Error(`No markdown content returned for ${roundName}`);
  }

  console.log(`✅ Successfully scraped ${roundName} (${(result.markdown.length / 1024).toFixed(2)} KB)`);
  return result.markdown;
}

async function updateNBADraftRoomData() {
  console.log('🚀 Starting NBA Draft Room data update...');
  console.log('📍 Scraping both rounds...\n');

  try {
    // Check for API key
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error(
        'FIRECRAWL_API_KEY environment variable is not set.\n' +
        'Please add it to your local.env file or set it in your environment.'
      );
    }

    // Initialize Firecrawl
    const app = new FirecrawlApp({ 
      apiKey: process.env.FIRECRAWL_API_KEY 
    });

    // Scrape both rounds
    const firstRoundMarkdown = await scrapeUrl(app, FIRST_ROUND_URL, 'First Round');
    const secondRoundMarkdown = await scrapeUrl(app, SECOND_ROUND_URL, 'Second Round');

    // Combine the markdown files
    const combinedMarkdown = `# NBA Draft Room - 2026 Mock Draft (Combined)

---

## First Round (Picks 1-30)

${firstRoundMarkdown}

---

## Second Round (Picks 31-60)

${secondRoundMarkdown}
`;

    // Save to file
    console.log(`\n💾 Saving combined data to: ${OUTPUT_FILE}`);
    await fs.writeFile(OUTPUT_FILE, combinedMarkdown, 'utf-8');

    console.log('✅ Successfully updated NBA Draft Room data!');
    console.log(`📄 Combined file size: ${(combinedMarkdown.length / 1024).toFixed(2)} KB`);
    console.log(`📊 First Round: ${(firstRoundMarkdown.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Second Round: ${(secondRoundMarkdown.length / 1024).toFixed(2)} KB`);
    
    return combinedMarkdown;
  } catch (error) {
    console.error('❌ Error updating NBA Draft Room data:', error.message);
    throw error;
  }
}

// Run if called directly
// Check if this file is being run directly (not imported)
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  updateNBADraftRoomData()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { updateNBADraftRoomData };
