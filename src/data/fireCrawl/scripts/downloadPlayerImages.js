import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTankathonMarkdown } from '../../../utils/parseTankathon.js';

// Get the current directory (needed for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TANKATHON_FILE = path.join(__dirname, '../fireCrawl/tankathon.md');
const SPORTS_REF_BASE = 'https://www.sports-reference.com/req/202512231/cbb/images/players';
const OUTPUT_DIR = path.join(__dirname, '../../../public/players');

// Check if running in test mode (only download first player)
const TEST_MODE = process.argv.includes('--test');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`✅ Created directory: ${OUTPUT_DIR}`);
}

// Download a single image
async function downloadImage(player) {
  const { name, slug } = player;
  const imageUrl = `${SPORTS_REF_BASE}/${slug}-1.jpg`;
  const outputPath = path.join(OUTPUT_DIR, `${slug}.jpg`);

  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.log(`⚠️  Failed to download ${name}: ${response.status} ${response.statusText}`);
      return { success: false, player: name };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Downloaded: ${name} -> ${slug}.jpg`);
    
    return { success: true, player: name };
  } catch (error) {
    console.log(`❌ Error downloading ${name}: ${error.message}`);
    return { success: false, player: name, error: error.message };
  }
}

// Main function
async function downloadAllPlayerImages() {
  console.log('🏀 Starting player image download...\n');
  
  if (TEST_MODE) {
    console.log('🧪 TEST MODE: Will only download the first player\n');
  }
  
  console.log(`📄 Reading player data from: ${TANKATHON_FILE}\n`);

  try {
    // Read and parse Tankathon markdown file
    const markdown = fs.readFileSync(TANKATHON_FILE, 'utf-8');
    let players = parseTankathonMarkdown(markdown);
    
    console.log(`📊 Found ${players.length} players in draft board\n`);
    
    // If test mode, only download the first player
    if (TEST_MODE) {
      players = [players[0]];
      console.log(`🧪 Testing with: ${players[0].name} (${players[0].slug})\n`);
    }
    
    console.log('⬇️  Downloading images...\n');

    // Download images with a small delay to avoid overwhelming the server
    const results = [];
    for (let i = 0; i < players.length; i++) {
      const result = await downloadImage(players[i]);
      results.push(result);
      
      // Add a small delay between requests (100ms)
      if (i < players.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(50));
    console.log('📊 Download Summary:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Images saved to: ${OUTPUT_DIR}`);
    console.log('='.repeat(50));

    if (failed > 0) {
      console.log('\n⚠️  Failed downloads:');
      results
        .filter(r => !r.success)
        .forEach(r => console.log(`   - ${r.player}`));
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
downloadAllPlayerImages();
