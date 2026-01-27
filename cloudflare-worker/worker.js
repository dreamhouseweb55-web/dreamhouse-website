/**
 * Cloudflare Worker - Git Gateway for Decap CMS
 * Proxies requests from Decap CMS to GitHub API
 */

export default {
    async fetch(request, env) {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        const url = new URL(request.url);

        // Only allow requests to /api path
        if (!url.pathname.startsWith('/api')) {
            return new Response('Not Found', { status: 404 });
        }

        try {
            // Extract GitHub API path
            const githubPath = url.pathname.replace('/api', '');
            const githubUrl = `https://api.github.com${githubPath}${url.search}`;

            // Clone request headers and add GitHub auth
            const headers = new Headers(request.headers);
            headers.set('Authorization', `token ${env.GITHUB_TOKEN}`);
            headers.set('Accept', 'application/vnd.github.v3+json');
            headers.delete('Host');

            // Forward request to GitHub
            const githubRequest = new Request(githubUrl, {
                method: request.method,
                headers: headers,
                body: request.method !== 'GET' && request.method !== 'HEAD'
                    ? await request.arrayBuffer()
                    : null
            });

            const githubResponse = await fetch(githubRequest);

            // Clone response and add CORS headers
            const response = new Response(githubResponse.body, {
                status: githubResponse.status,
                statusText: githubResponse.statusText,
                headers: githubResponse.headers
            });

            // Add CORS headers
            response.headers.set('Access-Control-Allow-Origin', '*');
            response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
            response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            return response;

        } catch (error) {
            return new Response(JSON.stringify({
                error: 'Proxy error',
                message: error.message
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }
};

function handleCORS() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}
