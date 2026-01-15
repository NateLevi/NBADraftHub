/**
 * Parse ESPN mock draft markdown to extract player rankings
 *
 * ESPN format:
 * - First round (1-30): ## N\. [Team Name] followed by **[Player Name], position, [School]**
 * - Second round (31-60): **N\. Team Name:** [Player Name], position, School
 */

/**
 * Create a slug from player name
 * @param {string} name - Player name
 * @returns {string} - URL-friendly slug
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
 * Clean up player name (remove Jr., II, etc. inconsistencies)
 * @param {string} name - Raw player name
 * @returns {string} - Cleaned name
 */
function cleanPlayerName(name) {
    return name
        .replace(/\\-\\-/g, '')
        .replace(/\\\\/g, '')
        .trim();
}

/**
 * Parse the ESPN mock draft markdown file
 * @param {string} markdown - Raw markdown content
 * @returns {Array} - Array of player objects with ESPN rankings
 */
export function parseESPNMarkdown(markdown) {
    const players = [];
    const lines = markdown.split('\n');

    // === FIRST ROUND (picks 1-30) ===
    // Format: ## N\. [Team Name] on one line, then **[Player Name](url), POSITION, [School](url)** a few lines later

    let currentRank = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Match first round pick header: ## 1\. [Team Name] or ## 1. [Team Name]
        const pickHeaderMatch = line.match(/^## (\d+)\\?\.?\s*\[/);
        if (pickHeaderMatch) {
            const rank = parseInt(pickHeaderMatch[1]);
            if (rank >= 1 && rank <= 30) {
                currentRank = rank;

                // Look for player info in next few lines
                for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                    const nextLine = lines[j].trim();

                    // Match: **[Player Name](url), POSITION, [School](url)**
                    // Also handles: **[Player Name Jr](url)., PG, [School](url)** (period after Jr link)
                    // Player name is in brackets, position is capital letters, school may be in brackets
                    const playerMatch = nextLine.match(/^\*\*\[([^\]]+)\]\([^)]*\)\.?,?\s*([A-Z][A-Z\/]*),\s*(?:\[)?([^\]\*\n,]+)/);

                    if (playerMatch) {
                        const name = cleanPlayerName(playerMatch[1]);
                        const position = playerMatch[2];
                        let school = playerMatch[3].replace(/\].*$/, '').replace(/\*\*/g, '').trim();

                        if (name && currentRank >= 1 && currentRank <= 30) {
                            players.push({
                                espnRank: currentRank,
                                name,
                                position,
                                school,
                                slug: createSlug(name),
                            });
                        }
                        break;
                    }
                }
            }
        }
    }

    // === SECOND ROUND (picks 31-60) ===
    // Format variations:
    // **31\. Team:** [Player Name](url), POSITION. School
    // **32\. Team:** Player Name, POSITION, School
    // **38\. [Team](url) (via X):** [Player Name](url), POSITION, [School](url), Year

    for (const line of lines) {
        // Match second round pick format: **N\. ... :** followed by player info
        // The team part can be plain text, a link, or have "(via Team)" suffix
        const secondRoundMatch = line.match(/^\*\*(\d+)\\?\.?\s*.+?:\*\*\s*(.+)$/);

        if (secondRoundMatch) {
            const rank = parseInt(secondRoundMatch[1]);
            if (rank >= 31 && rank <= 60) {
                const playerPart = secondRoundMatch[2];

                let name = null;
                let position = null;
                let school = null;

                // Try to extract player name - could be [Name](url) or plain text
                // Pattern 1: [Name](url) with possible trailing period or comma
                const linkedNameMatch = playerPart.match(/^\[([^\]]+)\]\([^)]*\)\.?,?\s*(.+)$/);

                if (linkedNameMatch) {
                    name = cleanPlayerName(linkedNameMatch[1]);
                    const rest = linkedNameMatch[2];

                    // Extract position and school from rest
                    // Position is capital letters (e.g., PG/SG, SF, C)
                    // School follows, may be in brackets
                    const posSchoolMatch = rest.match(/^([A-Z][A-Z\/]*)[.,]?\s*(?:\[)?([^\],\n\(]+)/);
                    if (posSchoolMatch) {
                        position = posSchoolMatch[1];
                        school = posSchoolMatch[2].replace(/\].*$/, '').trim();
                    }
                } else {
                    // Pattern 2: Plain text name (no link)
                    // e.g., "Sergio de Larrea, PG/SG, Valencia (Spain)"
                    const plainNameMatch = playerPart.match(/^([^,]+),\s*([A-Z][A-Z\/]*)[.,]?\s*(.+)$/);
                    if (plainNameMatch) {
                        name = cleanPlayerName(plainNameMatch[1]);
                        position = plainNameMatch[2];
                        school = plainNameMatch[3].replace(/\(.*\)$/, '').replace(/\[.*\].*$/, '').trim();
                    }
                }

                // Only add if we successfully parsed the player and don't already have this rank
                if (name && position && !players.find(p => p.espnRank === rank)) {
                    players.push({
                        espnRank: rank,
                        name,
                        position,
                        school: school || '',
                        slug: createSlug(name),
                    });
                }
            }
        }
    }

    // Sort by rank
    players.sort((a, b) => a.espnRank - b.espnRank);

    // Remove any duplicates (keep first occurrence for each rank)
    const seen = new Set();
    const uniquePlayers = players.filter(player => {
        if (seen.has(player.espnRank)) {
            return false;
        }
        seen.add(player.espnRank);
        return true;
    });

    console.log(`ESPN Parser: Found ${uniquePlayers.length} players`);

    // Log any missing ranks for debugging
    const foundRanks = new Set(uniquePlayers.map(p => p.espnRank));
    const missingRanks = [];
    for (let i = 1; i <= 60; i++) {
        if (!foundRanks.has(i)) {
            missingRanks.push(i);
        }
    }
    if (missingRanks.length > 0) {
        console.log(`ESPN Parser: Missing ranks: ${missingRanks.join(', ')}`);
    }

    return uniquePlayers;
}
