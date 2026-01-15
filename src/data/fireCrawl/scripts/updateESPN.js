/**
 * Firecrawl Script to Update ESPN Mock Draft Data
 * 
 * This script scrapes the ESPN 2026 NBA mock draft article and saves it as markdown.
 * Run this script whenever you need to update the ESPN draft data.
 * 
 * Usage:
 *   node src/data/fireCrawl/scripts/updateESPN.js
 */

import FirecrawlApp from '@mendable/firecrawl-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from local.env
dotenv.config({ path: path.resolve(__dirname, '../../../../local.env') });

// Configuration
const ESPN_URL = 'https://www.espn.com/nba/story/_/id/47581915/2026-nba-mock-draft-new-names-top-30-first-round-picks';
const OUTPUT_FILE = path.resolve(__dirname, '../DraftmdFiles/espn.md');

async function updateESPNData() {
    console.log('🚀 Starting ESPN mock draft data update...');
    console.log(`📍 Scraping: ${ESPN_URL}`);

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

        // Scrape the page
        console.log('⏳ Scraping page...');
        const result = await app.scrapeUrl(ESPN_URL, {
            formats: ['markdown'],
            onlyMainContent: true,
        });

        if (!result.markdown) {
            throw new Error('No markdown content returned from Firecrawl');
        }

        // Validate picks before saving
        // First round picks: ## N\. [Team] format
        const firstRoundMatches = result.markdown.match(/^## \d+\\?\./gm);
        const firstRoundCount = firstRoundMatches ? firstRoundMatches.length : 0;
        
        // Second round picks: **N\. Team Name:** format
        const secondRoundMatches = result.markdown.match(/^\*\*\d+\\?\./gm);
        const secondRoundCount = secondRoundMatches ? secondRoundMatches.length : 0;
        
        const totalPicks = firstRoundCount + secondRoundCount;
        
        console.log('📊 Pick validation:');
        console.log(`   Round 1 picks (## N\.): ${firstRoundCount}/30`);
        console.log(`   Round 2 picks (**N\.): ${secondRoundCount}/30`);
        console.log(`   Total picks: ${totalPicks}/60`);
        
        // Warn if we don't have all 60 picks, but don't fail
        if (totalPicks < 60) {
            console.warn(`⚠️  Warning: Expected 60 picks but found ${totalPicks}. The article may have been updated or the format changed.`);
        } else if (totalPicks > 60) {
            console.warn(`⚠️  Warning: Found ${totalPicks} picks (expected 60). There may be duplicate content.`);
        } else {
            console.log('✅ All 60 picks validated successfully!');
        }

        // Save to file
        console.log(`💾 Saving to: ${OUTPUT_FILE}`);
        await fs.writeFile(OUTPUT_FILE, result.markdown, 'utf-8');

        console.log('✅ Successfully updated ESPN mock draft data!');
        console.log(`📄 File size: ${(result.markdown.length / 1024).toFixed(2)} KB`);

        return result.markdown;
    } catch (error) {
        console.error('❌ Error updating ESPN data:', error.message);
        throw error;
    }
}

// Run if called directly
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
    updateESPNData()
        .then(() => {
            console.log('\n🎉 Done!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Script failed:', error);
            process.exit(1);
        });
}

export { updateESPNData };
