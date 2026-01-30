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
        return new Response("GITHUB_CLIENT_ID not set", { status: 500 });
      }
      const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
      return Response.redirect(redirectUrl, 302);
    }

    // 2. Handle Callback from GitHub
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(`GitHub Error: ${error}`, { status: 400 });
      }

      if (!code) {
        return new Response("No code provided", { status: 400 });
      }

      try {
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
          return new Response(`OAuth Error: ${result.error}`, { status: 400 });
        }

        const token = result.access_token;

        // Return HTML that sends token back to opener
        const html = `<!DOCTYPE html>
<html>
<head><title>Success</title></head>
<body>
<script>
(function() {
    const token = "${token}";
    const data = { token: token, provider: "github" };
    const message = "authorization:github:success:" + JSON.stringify(data);
    
    if (window.opener) {
        window.opener.postMessage(message, "*");
        window.close();
    } else {
        document.body.innerHTML = "<h1>Login successful!</h1><p>You can close this window.</p>";
    }
})();
</script>
</body>
</html>`;

        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });

      } catch (error) {
        return new Response(`Server Error: ${error.message}`, { status: 500 });
      }
    }

    // Health check
    if (url.pathname === "/") {
      return new Response("OAuth Gateway Running", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },
};
