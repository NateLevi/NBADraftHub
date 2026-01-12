/**
 * Firecrawl Script to Update Tankathon Mock Draft Data
 * 
 * This script scrapes the Tankathon mock draft page and saves it as markdown.
 * Run this script whenever you need to update the draft data.
 * 
 * Usage:
 *   node src/data/firecrawl/updateTankathon.js
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TANKATHON_URL = 'https://www.tankathon.com/mock_draft';
const OUTPUT_FILE = path.resolve(__dirname, '../tankathon.md');

async function updateTankathonData() {
  console.log('🚀 Starting Tankathon data update...');
  console.log(`📍 Scraping: ${TANKATHON_URL}`);

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
    const result = await app.scrapeUrl(TANKATHON_URL, {
      formats: ['markdown'],
      onlyMainContent: true,
    });

    if (!result.markdown) {
      throw new Error('No markdown content returned from Firecrawl');
    }

    // Save to file
    console.log(`💾 Saving to: ${OUTPUT_FILE}`);
    await fs.writeFile(OUTPUT_FILE, result.markdown, 'utf-8');

    console.log('✅ Successfully updated Tankathon data!');
    console.log(`📄 File size: ${(result.markdown.length / 1024).toFixed(2)} KB`);
    
    return result.markdown;
  } catch (error) {
    console.error('❌ Error updating Tankathon data:', error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateTankathonData()
    .then(() => {
      console.log('\n🎉 Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

export { updateTankathonData };
