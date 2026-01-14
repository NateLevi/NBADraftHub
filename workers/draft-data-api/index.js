/**
 * Cloudflare Worker to serve draft data from KV
 *
 * Endpoints:
 *   GET /api/draft-data - Returns pre-merged draft data
 *
 * Environment bindings required:
 *   DRAFT_DATA_KV - Workers KV namespace binding
 */

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);

    // Serve draft data
    if (url.pathname === '/api/draft-data' && request.method === 'GET') {
      try {
        // Get data from KV
        const data = await env.DRAFT_DATA_KV.get('draft-data', 'json');

        if (!data) {
          return new Response(
            JSON.stringify({ error: 'No draft data found. Run update:weekly script first.' }),
            {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
              },
            }
          );
        }

        return new Response(JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600', // 1 hour cache
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch draft data', details: error.message }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: 'Not found', availableEndpoints: ['/api/draft-data', '/health'] }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  },
};
