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

    // 1. Auth endpoint - Auto-login with stored token
    if (url.pathname === "/auth") {
      // Get the GitHub token from secrets
      const token = env.GITHUB_TOKEN;
      if (!token) {
        return errorPage("خطأ في الإعدادات", "GITHUB_TOKEN غير موجود. شغل: wrangler secret put GITHUB_TOKEN");
      }

      // Auto-authenticate with the stored token
      const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>جاري تسجيل الدخول...</title>
    <style>
        body {
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #28a745;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 { color: #28a745; }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <h1>✅ جاري تسجيل الدخول...</h1>
        <p>يتم توصيلك بلوحة التحكم</p>
    </div>
    <script>
    (function() {
        var token = "${token}";
        var provider = "github";
        
        var authData = JSON.stringify({ token: token, provider: provider });
        var message = "authorization:" + provider + ":success:" + authData;
        
        console.log('[Auth] Sending token to opener...');
        
        if (window.opener) {
            window.opener.postMessage(message, "*");
            console.log('[Auth] Message sent successfully');
            
            setTimeout(function() {
                window.close();
            }, 1500);
        } else {
            document.body.innerHTML = '<div class="container"><h1>✅ تم تسجيل الدخول!</h1><p>يمكنك إغلاق هذه النافذة</p></div>';
        }
    })();
    </script>
</body>
</html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    // 2. Callback endpoint (for compatibility)
    if (url.pathname === "/callback") {
      return Response.redirect(url.origin + "/auth", 302);
    }

    // Health check
    if (url.pathname === "/") {
      const hasToken = !!env.GITHUB_TOKEN;
      return new Response(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>Dream House Gateway</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; }
        h1 { color: #28a745; }
        .check { padding: 10px; margin: 5px 0; border-radius: 6px; }
        .ok { background: #d4edda; color: #155724; }
        .fail { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Dream House Gateway</h1>
        <p>الخادم يعمل بشكل صحيح</p>
        <div class="check ${hasToken ? 'ok' : 'fail'}">${hasToken ? '✅' : '❌'} GITHUB_TOKEN</div>
    </div>
</body>
</html>`, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return errorPage("404", "الصفحة غير موجودة");
  },
};

function errorPage(title, details) {
  return new Response(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>خطأ</title>
    <style>
        body { font-family: Arial; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8d7da; }
        .box { background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 500px; }
        h1 { color: #dc3545; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="box">
        <h1>❌ ${title}</h1>
        <div class="details">${details}</div>
    </div>
</body>
</html>`, {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
