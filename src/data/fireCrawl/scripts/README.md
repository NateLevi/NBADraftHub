# Player Image Download Script

This script downloads player images from Sports Reference and stores them locally in the `/public/players` folder.

## How to Run

```bash
npm run download-images
```

## What It Does

1. Fetches the current year's player data from the barttorvik API (same source as your app)
2. For each unique player, it:
   - Converts their name to URL format (e.g., "Darryn Peterson" → "darryn-peterson")
   - Downloads their image from Sports Reference: `https://www.sports-reference.com/req/202512231/cbb/images/players/[player-name]-1.jpg`
   - Saves it to `/public/players/[player-name].jpg`
3. Shows a summary of successful and failed downloads

## Output

Images are saved to: `/public/players/`

Example:
- `darryn-peterson.jpg`
- `cooper-flagg.jpg`
- `ace-bailey.jpg`

## Using the Images in Your App

Once downloaded, you can reference images in your components:

```jsx
const playerImageUrl = `/players/${formatPlayerName(player.player_name)}.jpg`;

<img src={playerImageUrl} alt={player.player_name} />
```

## Notes

- The script adds a 100ms delay between downloads to be respectful to Sports Reference's servers
- Some players may not have images available on Sports Reference (the script will log these)
- You'll need to re-run this script each year for the new draft class
- Total download time: ~6-10 seconds for 60 players
