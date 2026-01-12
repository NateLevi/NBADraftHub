# Firecrawl Integration Guide

## 🎉 Successfully Scraped Tankathon Mock Draft!

The markdown data has been saved to `src/data/tankathon.md` with the complete 2026 NBA Mock Draft information.

---

## How to Update Tankathon Data

### Quick Start

Run the update script anytime you need fresh data:

```bash
cd src/data/firecrawl
npm run update:tankathon
```

Or run directly:

```bash
node src/data/firecrawl/updateTankathon.js
```

### Setup (First Time Only)

1. **Install dependencies**:
   ```bash
   cd src/data/firecrawl
   npm install
   ```

2. **Set up environment variables** (create `.env` file in project root):
   ```
   FIRECRAWL_API_KEY=your_api_key_here
   ```

---

## How to Use Firecrawl to Get Markdown from a URL

### Method 1: Using the MCP Tool Directly (Recommended in Cursor)

Since Firecrawl is available as an MCP (Model Context Protocol) tool in Cursor, you can use it directly through the AI assistant:

1. **Ask the AI to scrape a URL**:
   ```
   "Use Firecrawl to scrape https://example.com and save it as markdown"
   ```

2. **The AI will call the MCP tool**:
   ```json
   {
     "server": "user-firecrawl",
     "toolName": "firecrawl_scrape",
     "arguments": {
       "url": "https://example.com",
       "formats": ["markdown"],
       "maxAge": 172800000
     }
   }
   ```

### Method 2: Using the Update Script (For Automated Updates)

Use the provided `updateTankathon.js` script:

1. **Install Firecrawl SDK** (already in package.json):
   ```bash
   npm install @mendable/firecrawl-js
   ```

2. **Set up environment variables**:
   ```
   FIRECRAWL_API_KEY=your_api_key_here
   ```

3. **Run the script**:
   ```bash
   npm run update:tankathon
   ```

## Parameters Explained

- **url** (required): The webpage URL to scrape
- **formats**: Array of formats you want. Options:
  - `"markdown"` - Clean markdown output
  - `"html"` - Cleaned HTML
  - `"rawHtml"` - Original HTML
  - `"screenshot"` - Page screenshot
  - `"links"` - Extract all links
  - `"summary"` - AI summary
- **maxAge**: Use cached data if available (in milliseconds). 172800000 = 48 hours
- **onlyMainContent**: Set to `true` to extract just the main content, removing headers/footers/ads

## Common Use Cases

### Scrape and Save to File
Ask AI: "Scrape https://tankathon.com/draft and save the markdown to tankathon.md"

### Scrape Multiple Formats
```json
{
  "formats": ["markdown", "html", "screenshot"]
}
```

### Scrape with Custom Options
```json
{
  "url": "https://example.com",
  "formats": ["markdown"],
  "onlyMainContent": true,
  "removeBase64Images": true,
  "maxAge": 172800000
}
```

## Notes

- The MCP tool is available through Cursor AI - just ask!
- For production apps, use the Firecrawl SDK
- Always respect robots.txt and rate limits
- Cache results when possible using `maxAge` parameter
