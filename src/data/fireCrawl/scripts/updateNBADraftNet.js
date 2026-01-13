/**
 * Firecrawl Script to Update NBADraft.net Mock Draft Data
 * 
 * This script scrapes the NBADraft.net mock draft page and saves it as markdown.
 * Run this script whenever you need to update the draft data.
 * 
 * Usage:
 *   node src/data/firecrawl/updateNBADraftNet.js
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
const NBADRAFT_NET_URL = 'https://www.nbadraft.net/nba-mock-drafts/';
const OUTPUT_FILE = path.resolve(__dirname, '../DraftmdFiles/nbadraft-net.md');

async function updateNBADraftNetData() {
  console.log('🚀 Starting NBADraft.net data update...');
  console.log(`📍 Scraping: ${NBADRAFT_NET_URL}`);

  try {
    // Check for API key
    if (!process.env.FIRECRAWL_API_KEY) {
      throw new Error(
        'FIRECRAWL_API_KEY environment variable is not set.\n' +
        'Please add it to your .env file or set it in your environment.'
      );
    }

    // Initialize Firecrawl
    const app = new FirecrawlApp({ 
      apiKey: process.env.FIRECRAWL_API_KEY 
    });

    // Scrape the page
    console.log('⏳ Scraping page...');
    const result = await app.scrapeUrl(NBADRAFT_NET_URL, {
      formats: ['markdown'],
      onlyMainContent: true,
    });

    if (!result.markdown) {
      throw new Error('No markdown content returned from Firecrawl');
    }

    // Save to file
    console.log(`💾 Saving to: ${OUTPUT_FILE}`);
    await fs.writeFile(OUTPUT_FILE, result.markdown, 'utf-8');

    console.log('✅ Successfully updated NBADraft.net data!');
    console.log(`📄 File size: ${(result.markdown.length / 1024).toFixed(2)} KB`);
    
    return result.markdown;
  } catch (error) {
    console.error('❌ Error updating NBADraft.net data:', error.message);
    throw error;
  }
}

// Run if called directly
// Check if this file is being run directly (not imported)
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  updateNBADraftNetData()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { updateNBADraftNetData };
