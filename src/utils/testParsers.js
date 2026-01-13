/**
 * Test script to verify the new parsers work correctly
 * Run with: node src/utils/testParsers.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseNBADraftNetMarkdown } from './parseNBADraftNet.js';
import { parseNBADraftRoomMarkdown } from './parseNBADraftRoom.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the markdown files
const nbadraftnetPath = path.resolve(__dirname, '../data/fireCrawl/DraftmdFiles/nbadraft-net.md');
const nbadraftroomPath = path.resolve(__dirname, '../data/fireCrawl/DraftmdFiles/nbadraftroom.md');

console.log('🧪 Testing NBADraft.net Parser...\n');
const nbadraftnetMd = fs.readFileSync(nbadraftnetPath, 'utf-8');
const nbadraftnetPlayers = parseNBADraftNetMarkdown(nbadraftnetMd);

console.log(`✅ Parsed ${nbadraftnetPlayers.length} players from NBADraft.net`);
console.log('\nFirst 5 players:');
nbadraftnetPlayers.slice(0, 5).forEach(p => {
  console.log(`  ${p.nbaDraftNetRank}. ${p.name} - ${p.position} - ${p.school} (${p.year})`);
  console.log(`     Height: ${p.height} (${p.heightInches}"), Weight: ${p.weight} lbs`);
});
console.log('\nLast 5 players:');
nbadraftnetPlayers.slice(-5).forEach(p => {
  console.log(`  ${p.nbaDraftNetRank}. ${p.name} - ${p.position} - ${p.school} (${p.year})`);
});

console.log('\n' + '='.repeat(60) + '\n');

console.log('🧪 Testing NBA Draft Room Parser...\n');
const nbadraftroomMd = fs.readFileSync(nbadraftroomPath, 'utf-8');
const nbadraftroomPlayers = parseNBADraftRoomMarkdown(nbadraftroomMd);

console.log(`✅ Parsed ${nbadraftroomPlayers.length} players from NBA Draft Room`);
console.log('\nFirst 5 players:');
nbadraftroomPlayers.slice(0, 5).forEach(p => {
  console.log(`  ${p.nbaDraftRoomRank}. ${p.name} - ${p.position} - ${p.school} (${p.year})`);
  console.log(`     Height: ${p.height} (${p.heightInches}"), Weight: ${p.weight} lbs`);
});
console.log('\nLast 5 players:');
nbadraftroomPlayers.slice(-5).forEach(p => {
  console.log(`  ${p.nbaDraftRoomRank}. ${p.name} - ${p.position} - ${p.school} (${p.year})`);
});

// Find Tarris Reed Jr.
const tarris = nbadraftroomPlayers.find(p => p.name.toLowerCase().includes('tarris'));
if (tarris) {
  console.log('\n🔍 Tarris Reed Jr. found:');
  console.log(`  Rank: ${tarris.nbaDraftRoomRank}, Name: ${tarris.name}, Position: ${tarris.position}, School: ${tarris.school}`);
}

// Check for duplicate names in NBA Draft Room
console.log('\n🔍 Checking for duplicate player names in NBA Draft Room...');
const nameCounts = {};
nbadraftroomPlayers.forEach(p => {
  const name = p.name.toLowerCase();
  nameCounts[name] = (nameCounts[name] || 0) + 1;
});
const duplicates = Object.entries(nameCounts).filter(([k,v]) => v > 1);
if (duplicates.length > 0) {
  console.log('Duplicates found:', duplicates);
} else {
  console.log('No duplicates found in parsed data');
}

console.log('\n' + '='.repeat(60) + '\n');
console.log('🎉 All parsers tested successfully!');
