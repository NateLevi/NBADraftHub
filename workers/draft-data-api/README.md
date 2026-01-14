# Draft Data API Worker

Cloudflare Worker that serves pre-merged draft data from Workers KV.

## Setup

1. Install Wrangler (Cloudflare CLI):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create a KV namespace:
   ```bash
   wrangler kv:namespace create "DRAFT_DATA_KV"
   ```

4. Update `wrangler.toml` with the returned namespace ID.

5. Deploy the worker:
   ```bash
   cd workers/draft-data-api
   wrangler deploy
   ```

## Local Development

```bash
wrangler dev
```

## Endpoints

- `GET /api/draft-data` - Returns pre-merged draft data
- `GET /health` - Health check

## Updating Data

Run the weekly update script from the main project:
```bash
npm run update:weekly
```

This will:
1. Scrape Tankathon and NBADraft.net
2. Fetch Barttorvik statistics
3. Merge all data
4. Upload to Workers KV
