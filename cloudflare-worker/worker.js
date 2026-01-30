export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Handle CORS
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        // 1. Redirect to GitHub OAuth
        if (url.pathname === "/auth") {
            const client_id = env.GITHUB_CLIENT_ID;
            if (!client_id) {
                return new Response("Configuration Error: GITHUB_CLIENT_ID is missing.", { status: 500 });
            }
            const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
            return Response.redirect(redirectUrl, 302);
        }

        // 2. Handle Callback from GitHub
        if (url.pathname === "/callback") {
            const code = url.searchParams.get("code");

            try {
                if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
                    return new Response("Configuration Error: GITHUB credentials missing.", { status: 500 });
                }

                const response = await fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                    body: JSON.stringify({
                        client_id: env.GITHUB_CLIENT_ID,
                        client_secret: env.GITHUB_CLIENT_SECRET,
                        code,
                    }),
                });

                const result = await response.json();

                if (result.error) {
                    return new Response(`Error: ${result.error_description}`, { status: 400 });
                }

                const token = result.access_token;
                const provider = "github"; // Matches backend name in config.yml

                // Script to post message back to the CMS window
                // The message format expected by Decap CMS is "authorization:provider:success:data"
                const responseHTML = `
          <script>
            const receiveMessage = (message) => {
              window.opener.postMessage(
                'authorization:${provider}:success:${JSON.stringify({ token: token, provider: provider })}', 
                '*'
              );
              window.close();
            };
            receiveMessage();
          </script>
        `;

                return new Response(responseHTML, {
                    headers: {
                        "Content-Type": "text/html;charset=UTF-8",
                    },
                });

            } catch (error) {
                return new Response(`Server Error: ${error.message}`, { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
};
