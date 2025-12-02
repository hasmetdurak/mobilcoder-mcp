// Cloudflare Worker for WebRTC signaling
// Stores peer signals temporarily (expires in 5 min)

interface SignalData {
  signal: any;
  timestamp: number;
}

// In-memory storage (Cloudflare Workers KV could be used for persistence)
const signals = new Map<string, SignalData>();

// Cleanup expired signals every minute
setInterval(() => {
  const now = Date.now();
  const expireTime = 5 * 60 * 1000; // 5 minutes

  for (const [key, data] of signals.entries()) {
    if (now - data.timestamp > expireTime) {
      signals.delete(key);
    }
  }
}, 60000); // Check every minute

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Mobile posts offer
      if (url.pathname === '/offer' && request.method === 'POST') {
        const body = await request.json() as { code: string; signal: any };
        const key = `offer-${body.code}`;
        signals.set(key, {
          signal: body.signal,
          timestamp: Date.now(),
        });
        return new Response('OK', { headers: corsHeaders });
      }

      // Desktop polls for offer
      if (url.pathname === '/poll' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        if (!code) {
          return new Response('Missing code parameter', { 
            status: 400,
            headers: corsHeaders 
          });
        }

        const key = `offer-${code}`;
        const data = signals.get(key);
        
        if (data) {
          // Optionally delete after reading (one-time use)
          // signals.delete(key);
          return Response.json({ signal: data.signal }, { headers: corsHeaders });
        } else {
          return Response.json({ signal: null }, { headers: corsHeaders });
        }
      }

      // Desktop posts answer
      if (url.pathname === '/answer' && request.method === 'POST') {
        const body = await request.json() as { code: string; signal: any };
        const key = `answer-${body.code}`;
        signals.set(key, {
          signal: body.signal,
          timestamp: Date.now(),
        });
        return new Response('OK', { headers: corsHeaders });
      }

      // Mobile polls for answer
      if (url.pathname === '/answer' && request.method === 'GET') {
        const code = url.searchParams.get('code');
        if (!code) {
          return new Response('Missing code parameter', { 
            status: 400,
            headers: corsHeaders 
          });
        }

        const key = `answer-${code}`;
        const data = signals.get(key);
        
        if (data) {
          // Optionally delete after reading (one-time use)
          // signals.delete(key);
          return Response.json({ signal: data.signal }, { headers: corsHeaders });
        } else {
          return Response.json({ signal: null }, { headers: corsHeaders });
        }
      }

      // Health check
      if (url.pathname === '/health' && request.method === 'GET') {
        return Response.json({ 
          status: 'ok',
          signals: signals.size 
        }, { headers: corsHeaders });
      }

      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders 
      });
    } catch (error) {
      return new Response(`Error: ${error}`, { 
        status: 500,
        headers: corsHeaders 
      });
    }
  },
};

