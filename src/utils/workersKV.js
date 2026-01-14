/**
 * Fetch pre-merged draft data from Cloudflare Workers KV
 *
 * The data is uploaded weekly by the update:weekly script.
 * This provides faster loading than fetching from multiple APIs.
 */

// Worker endpoint
const KV_WORKER_URL = import.meta.env.VITE_KV_WORKER_URL || 'https://draft-data-api.nathan-levi8.workers.dev';

/**
 * Fetch draft data from Workers KV via the worker endpoint
 * @returns {Promise<{players: Array, matchStats: object, updatedAt: string}>}
 */
export async function fetchDraftDataFromKV() {
  const url = `${KV_WORKER_URL}/api/draft-data`;

  console.log('Fetching draft data from Workers KV...');
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch draft data: ${response.status}`);
    }

    const data = await response.json();

    console.log(`Loaded ${data.players?.length || 0} players from Workers KV`);
    console.log(`Data updated at: ${data.updatedAt}`);

    return {
      players: data.players || [],
      matchStats: data.matchStats || {
        total: 0,
        matched: 0,
        unmatched: 0,
        international: 0,
        sourceCounts: { tankathon: 0, nbaDraftNet: 0 }
      },
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching from Workers KV:', error);
    throw error;
  }
}
