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
        return errorPage("خطأ في الإعدادات", "GITHUB_CLIENT_ID غير موجود. شغل: wrangler secret put GITHUB_CLIENT_ID");
      }
      const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
      return Response.redirect(redirectUrl, 302);
    }

    // 2. Handle Callback from GitHub
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      const error_description = url.searchParams.get("error_description");

      if (error) {
        return errorPage("خطأ من GitHub", `${error}: ${error_description || 'لا يوجد تفاصيل'}`);
      }

      if (!code) {
        return errorPage("خطأ في الطلب", "لم يتم استلام كود المصادقة من GitHub.");
      }

      if (!env.GITHUB_CLIENT_ID) {
        return errorPage("خطأ في الإعدادات", "GITHUB_CLIENT_ID غير موجود.");
      }
      if (!env.GITHUB_CLIENT_SECRET) {
        return errorPage("خطأ في الإعدادات", "GITHUB_CLIENT_SECRET غير موجود.");
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

        if (!response.ok) {
          return errorPage("خطأ في الاتصال", `فشل الاتصال بـ GitHub. Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.error) {
          return errorPage("خطأ في المصادقة", `${result.error}: ${result.error_description || ''}`);
        }

        if (!result.access_token) {
          return errorPage("خطأ غير متوقع", "لم يتم استلام access_token من GitHub.");
        }

        const token = result.access_token;

        // Success page with multiple auth methods
        const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>جاري المصادقة...</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, sans-serif;
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
            max-width: 450px;
            width: 90%;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 1.5rem; }
        p { color: #666; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .manual-box {
            background: #fff3cd;
            border: 1px solid #ffc107;
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
            display: none;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 8px;
            border: none;
            cursor: pointer;
            font-size: 14px;
        }
        .btn:hover { opacity: 0.9; }
        .btn-back { background: #6c757d; }
        .log { 
            background: #1a1a2e; 
            color: #0f0;
            padding: 12px; 
            border-radius: 8px; 
            text-align: left; 
            direction: ltr;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            max-height: 150px;
            overflow-y: auto;
            margin-top: 20px;
        }
        .log-line { margin: 2px 0; }
        .log-success { color: #7fff7f; }
        .log-error { color: #ff7f7f; }
        .log-info { color: #7fbfff; }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner" id="spinner"></div>
        <h1 id="title">جاري المصادقة...</h1>
        <p id="message">يتم إرسال بيانات الدخول للوحة التحكم</p>
        
        <div class="manual-box" id="manualBox">
            <p><strong>⚠️ لم تُغلق النافذة تلقائياً</strong></p>
            <p style="font-size: 14px;">النافذة الأصلية قد تكون أُغلقت. اضغط الزر للعودة:</p>
            <a href="https://dreamhouse-website.pages.dev/admin/" class="btn btn-back">↩️ العودة للوحة التحكم</a>
        </div>
        
        <div class="log" id="log"></div>
    </div>
    <script>
    (function() {
        var logEl = document.getElementById('log');
        var title = document.getElementById('title');
        var message = document.getElementById('message');
        var spinner = document.getElementById('spinner');
        var manualBox = document.getElementById('manualBox');
        
        function log(text, type) {
            var cls = 'log-line';
            if (type === 'success') cls += ' log-success';
            if (type === 'error') cls += ' log-error';
            if (type === 'info') cls += ' log-info';
            var time = new Date().toLocaleTimeString();
            logEl.innerHTML += '<div class="' + cls + '">[' + time + '] ' + text + '</div>';
            logEl.scrollTop = logEl.scrollHeight;
            console.log('[OAuth]', text);
        }
        
        function showSuccess() {
            spinner.style.display = 'none';
            title.innerHTML = '✅ تم تسجيل الدخول!';
            title.className = 'success';
            message.textContent = 'جاري إغلاق النافذة...';
        }
        
        function showManual() {
            manualBox.style.display = 'block';
            message.textContent = 'يمكنك إغلاق هذه النافذة يدوياً';
        }
        
        // Auth data
        var token = "${token}";
        var provider = "github";
        
        log('OAuth callback started', 'info');
        log('Token received: ' + token.substring(0, 10) + '...', 'success');
        
        // Build message in Decap CMS format
        var authData = JSON.stringify({ token: token, provider: provider });
        var authMessage = "authorization:" + provider + ":success:" + authData;
        
        log('Message: authorization:github:success:{...}', 'info');
        
        // Check for opener
        if (!window.opener) {
            log('ERROR: window.opener is null', 'error');
            log('The parent window may have been closed', 'error');
            spinner.style.display = 'none';
            title.innerHTML = '⚠️ النافذة الأصلية غير موجودة';
            title.className = 'warning';
            showManual();
            return;
        }
        
        log('window.opener found', 'success');
        
        // Send message
        try {
            window.opener.postMessage(authMessage, "*");
            log('postMessage sent to "*"', 'success');
            
            showSuccess();
            
            // Try to close
            setTimeout(function() {
                log('Attempting window.close()...', 'info');
                window.close();
                
                // If still open after 1 second
                setTimeout(function() {
                    log('Window still open - showing manual options', 'info');
                    showManual();
                }, 1000);
            }, 1500);
            
        } catch(e) {
            log('ERROR: ' + e.message, 'error');
            showManual();
        }
    })();
    </script>
</body>
</html>`;

        return new Response(html, {
          headers: { "Content-Type": "text/html;charset=UTF-8" },
        });

      } catch (error) {
        return errorPage("خطأ في الخادم", error.message);
      }
    }

    // Health check
    if (url.pathname === "/") {
      const hasClientId = !!env.GITHUB_CLIENT_ID;
      const hasSecret = !!env.GITHUB_CLIENT_SECRET;
      return new Response(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>Dream House OAuth</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #28a745; }
        .check { padding: 10px; margin: 5px 0; border-radius: 6px; }
        .ok { background: #d4edda; color: #155724; }
        .fail { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Dream House OAuth Gateway</h1>
        <p>الخادم يعمل بشكل صحيح</p>
        <div class="check ${hasClientId ? 'ok' : 'fail'}">${hasClientId ? '✅' : '❌'} GITHUB_CLIENT_ID</div>
        <div class="check ${hasSecret ? 'ok' : 'fail'}">${hasSecret ? '✅' : '❌'} GITHUB_CLIENT_SECRET</div>
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
        body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8d7da; }
        .box { background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 500px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        h1 { color: #dc3545; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 8px; font-family: monospace; word-break: break-all; text-align: left; direction: ltr; }
        .btn { display: inline-block; margin-top: 20px; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="box">
        <h1>❌ ${title}</h1>
        <div class="details">${details}</div>
        <a href="https://dreamhouse-website.pages.dev/admin/" class="btn">العودة للوحة التحكم</a>
    </div>
</body>
</html>`, {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
