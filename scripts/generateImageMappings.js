/**
 * Script to automatically generate image extension mappings
 * Run this after adding or changing player image formats
 * Usage: node scripts/generateImageMappings.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLAYERS_DIR = path.join(__dirname, '../public/players');
const IMAGE_HELPERS_PATH = path.join(__dirname, '../src/utils/imageHelpers.js');

function generateImageMappings() {
  // Read all files in players directory
  const files = fs.readdirSync(PLAYERS_DIR);

  // Filter for PNG images (excluding fallback.svg)
  const pngPlayers = files
    .filter(file => file.endsWith('.png') && file !== 'fallback.png')
    .map(file => path.basename(file, '.png'))
    .sort();

  console.log('Found PNG player images:', pngPlayers);

  // Read the current imageHelpers.js file
  let content = fs.readFileSync(IMAGE_HELPERS_PATH, 'utf8');

  // Create the new PNG_PLAYER_IMAGES set content
  const newSetContent = `const PNG_PLAYER_IMAGES = new Set([\n  '${pngPlayers.join("',\n  '")}',\n]);`;

  // Replace the PNG_PLAYER_IMAGES set using regex
  const regex = /const PNG_PLAYER_IMAGES = new Set\(\[[^\]]*\]\);/;

  if (regex.test(content)) {
    content = content.replace(regex, newSetContent);
    fs.writeFileSync(IMAGE_HELPERS_PATH, content, 'utf8');
    console.log('\n✓ Successfully updated imageHelpers.js');
    console.log(`  Added ${pngPlayers.length} PNG player images to the mapping`);
  } else {
    console.error('✗ Could not find PNG_PLAYER_IMAGES set in imageHelpers.js');
    process.exit(1);
  }
}

// Run the script
try {
  generateImageMappings();
} catch (error) {
  console.error('Error generating image mappings:', error.message);
  process.exit(1);
}
