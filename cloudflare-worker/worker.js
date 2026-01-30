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
                const provider = "github";

                // Build the data object
                const data = JSON.stringify({ token: token, provider: provider });

                // Script to post message back to the CMS window
                const responseHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorizing...</title>
</head>
<body>
  <p>Authorizing, please wait...</p>
  <script>
    (function() {
      function receiveMessage(e) {
        console.log("Received message:", e.data);
        if (e.data === "authorizing:github") {
          sendAuth();
        }
      }
      
      function sendAuth() {
        var data = ${data};
        var message = "authorization:github:success:" + JSON.stringify(data);
        console.log("Sending message:", message);
        
        if (window.opener) {
          window.opener.postMessage(message, "*");
          setTimeout(function() { window.close(); }, 500);
        } else {
          document.body.innerHTML = "<p>Authorization successful! You can close this window.</p>";
        }
      }
      
      window.addEventListener("message", receiveMessage, false);
      
      // Try sending immediately
      sendAuth();
    })();
  </script>
</body>
</html>
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
