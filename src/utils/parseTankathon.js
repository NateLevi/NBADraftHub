/**
 * Parse Tankathon markdown to extract player draft rankings and info
 * The order of players in the markdown = their draft rank (1-60)
 */

/**
 * Parse height string to inches
 * @param {string} heightStr - e.g., "6'6\"" or "6'10.5\""
 * @returns {number} - height in inches
 */
function parseHeightToInches(heightStr) {
  if (!heightStr) return null;
  const match = heightStr.match(/(\d+)'(\d+(?:\.\d+)?)/);
  if (match) {
    return parseInt(match[1]) * 12 + parseFloat(match[2]);
  }
  return null;
}

/**
 * Parse weight string to number
 * @param {string} weightStr - e.g., "205 lbs"
 * @returns {number}
 */
function parseWeight(weightStr) {
  if (!weightStr) return null;
  const match = weightStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Parse age string to number
 * @param {string} ageStr - e.g., "19.4 yrs"
 * @returns {number}
 */
function parseAge(ageStr) {
  if (!ageStr) return null;
  const match = ageStr.match(/([\d.]+)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Parse the full Tankathon markdown file
 * @param {string} markdown - Raw markdown content
 * @returns {Array} - Array of player objects sorted by draft rank
 */
export function parseTankathonMarkdown(markdown) {
  const players = [];
  const lines = markdown.split('\n');

  let currentRank = 0;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Detect standalone pick number (1, 2, 3, ... 60)
    if (/^\d{1,2}$/.test(line)) {
      const pickNum = parseInt(line);
      if (pickNum >= 1 && pickNum <= 60 && pickNum > currentRank) {
        currentRank = pickNum;
      }
      i++;
      continue;
    }

    // Detect player link start - format: [PlayerName\\
    // The player name line starts with [ and contains the name followed by \\
    if (line.startsWith('[') && line.includes('\\') && !line.includes('![')) {
      // Extract player name from this line
      const nameMatch = line.match(/^\[([^\\\]]+)/);
      if (!nameMatch) {
        i++;
        continue;
      }

      const name = nameMatch[1].trim();

      // Skip to find the position/school line
      let j = i + 1;
      let position = '';
      let school = '';
      let slug = '';

      // Look for the line with position | school](url)
      while (j < i + 5 && j < lines.length) {
        const nextLine = lines[j].trim();
        // Match: SG/PG \| Kansas](https://www.tankathon.com/players/darryn-peterson)
        const posSchoolMatch = nextLine.match(/^([A-Z\/]+)\s*\\\|\s*([^\]]+)\]\(https:\/\/www\.tankathon\.com\/players\/([a-z0-9-]+)\)/);
        if (posSchoolMatch) {
          position = posSchoolMatch[1];
          school = posSchoolMatch[2];
          slug = posSchoolMatch[3];
          j++;
          break;
        }
        j++;
      }

      if (!slug) {
        // Try alternate pattern without the backslash before pipe
        j = i + 1;
        while (j < i + 5 && j < lines.length) {
          const nextLine = lines[j].trim();
          const altMatch = nextLine.match(/^([A-Z\/]+)\s*\|\s*([^\]]+)\]\(https:\/\/www\.tankathon\.com\/players\/([a-z0-9-]+)\)/);
          if (altMatch) {
            position = altMatch[1];
            school = altMatch[2];
            slug = altMatch[3];
            j++;
            break;
          }
          j++;
        }
      }

      if (!slug) {
        slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }

      // Now scan ahead for height, weight, year, age
      let height = null;
      let weight = null;
      let year = null;
      let age = null;

      const bioSearchEnd = Math.min(j + 10, lines.length);
      for (let k = j; k < bioSearchEnd; k++) {
        const bioLine = lines[k].trim();

        // Height: "6'6"" or "6'10.5""
        if (!height && /^\d+'\d+(?:\.\d+)?"?$/.test(bioLine)) {
          height = bioLine.replace(/"/g, '');
        }

        // Weight: "205 lbs"
        if (!weight && /^\d+\s*lbs?$/i.test(bioLine)) {
          weight = parseWeight(bioLine);
        }

        // Year: Freshman, Sophomore, Junior, Senior, International
        if (!year && /^(Freshman|Sophomore|Junior|Senior|International)$/i.test(bioLine)) {
          year = bioLine;
        }

        // Age: "19.4 yrs"
        if (!age && /^[\d.]+\s*yrs?$/i.test(bioLine)) {
          age = parseAge(bioLine);
        }

        // Stop if we hit the next pick number
        if (/^\d{1,2}$/.test(bioLine) && parseInt(bioLine) > currentRank) {
          break;
        }
      }

      // Only add if we have at least the name
      if (name && currentRank > 0) {
        players.push({
          tankathonRank: currentRank,
          name,
          position: position || '',
          school: school || '',
          slug,
          height: height || '',
          heightInches: parseHeightToInches(height),
          weight,
          year: year || 'Unknown',
          age,
        });
      }
    }

    i++;
  }

  // Sort by rank and remove duplicates (keep first occurrence)
  const seen = new Set();
  const uniquePlayers = [];
  players.sort((a, b) => a.tankathonRank - b.tankathonRank);

  for (const player of players) {
    if (!seen.has(player.tankathonRank)) {
      seen.add(player.tankathonRank);
      uniquePlayers.push(player);
    }
  }

  return uniquePlayers;
}
