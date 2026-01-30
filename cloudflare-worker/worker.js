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
        return errorPage("خطأ في الإعدادات", "GITHUB_CLIENT_ID غير موجود في إعدادات الـ Worker. تأكد من إضافته باستخدام: wrangler secret put GITHUB_CLIENT_ID");
      }
      const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user`;
      return Response.redirect(redirectUrl, 302);
    }

    // 2. Handle Callback from GitHub
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");
      const error_description = url.searchParams.get("error_description");

      // Check for OAuth errors from GitHub
      if (error) {
        return errorPage("خطأ من GitHub", `${error}: ${error_description || 'لا يوجد تفاصيل'}`);
      }

      if (!code) {
        return errorPage("خطأ في الطلب", "لم يتم استلام كود المصادقة من GitHub. حاول مرة أخرى.");
      }

      // Check for missing credentials
      if (!env.GITHUB_CLIENT_ID) {
        return errorPage("خطأ في الإعدادات", "GITHUB_CLIENT_ID غير موجود. شغل: wrangler secret put GITHUB_CLIENT_ID");
      }
      if (!env.GITHUB_CLIENT_SECRET) {
        return errorPage("خطأ في الإعدادات", "GITHUB_CLIENT_SECRET غير موجود. شغل: wrangler secret put GITHUB_CLIENT_SECRET");
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
          return errorPage("خطأ في الاتصال", `فشل الاتصال بـ GitHub. Status: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        if (result.error) {
          return errorPage("خطأ في المصادقة", `${result.error}: ${result.error_description || 'لا يوجد تفاصيل'}`);
        }

        if (!result.access_token) {
          return errorPage("خطأ غير متوقع", "لم يتم استلام access_token من GitHub. Response: " + JSON.stringify(result));
        }

        const token = result.access_token;

        // Success page with detailed logging
        const script = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>جاري المصادقة...</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
            max-width: 400px;
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
        h1 { color: #333; margin-bottom: 10px; }
        p { color: #666; }
        .success { color: #28a745; }
        .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 8px; }
        .log { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 8px; 
            text-align: left; 
            direction: ltr;
            font-family: monospace;
            font-size: 12px;
            max-height: 150px;
            overflow-y: auto;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner" id="spinner"></div>
        <h1 id="title">جاري المصادقة...</h1>
        <p id="message">يتم إرسال بيانات الدخول للوحة التحكم</p>
        <div class="log" id="log"></div>
    </div>
    <script>
    (function() {
        var log = document.getElementById('log');
        var title = document.getElementById('title');
        var message = document.getElementById('message');
        var spinner = document.getElementById('spinner');
        
        function addLog(text) {
            var time = new Date().toLocaleTimeString();
            log.innerHTML += '[' + time + '] ' + text + '\\n';
            log.scrollTop = log.scrollHeight;
            console.log(text);
        }
        
        function showError(errorText) {
            spinner.style.display = 'none';
            title.innerHTML = '❌ حدث خطأ';
            title.style.color = '#dc3545';
            message.innerHTML = '<div class="error">' + errorText + '</div>';
        }
        
        function showSuccess() {
            spinner.style.display = 'none';
            title.innerHTML = '✅ تم تسجيل الدخول بنجاح!';
            title.style.color = '#28a745';
            message.textContent = 'جاري إغلاق النافذة...';
        }
        
        addLog('Starting authentication...');
        
        var token = "${token}";
        var provider = "github";
        
        if (!token) {
            showError('Token is empty!');
            return;
        }
        
        addLog('Token received: ' + token.substring(0, 10) + '...');
        
        // The EXACT format Decap CMS expects
        // See: https://github.com/decaporg/decap-cms/blob/main/packages/netlify-cms-lib-auth/src/implicit-oauth.js
        var content = {
            token: token,
            provider: provider
        };
        
        addLog('Message format: authorization:github:success:{token,provider}');
        
        if (!window.opener) {
            showError('لا يوجد نافذة أصلية (opener). تأكد من فتح صفحة التسجيل من لوحة التحكم وليس مباشرة.');
            addLog('ERROR: window.opener is null or undefined');
            return;
        }
        
        addLog('window.opener found: ' + (typeof window.opener));
        
        try {
            // Method 1: Direct message format (what Decap CMS expects)
            var msg = "authorization:" + provider + ":success:" + JSON.stringify(content);
            addLog('Sending: ' + msg.substring(0, 50) + '...');
            
            window.opener.postMessage(msg, "*");
            addLog('✓ Message sent to opener');
            
            showSuccess();
            
            // Give time for message to be received before closing
            setTimeout(function() { 
                addLog('Window will close now...');
                window.close(); 
            }, 1500);
            
        } catch(e) {
            showError('خطأ في إرسال البيانات: ' + e.message);
            addLog('ERROR: ' + e.stack);
        }
    })();
    </script>
</body>
</html>`;

        return new Response(script, {
          headers: {
            "Content-Type": "text/html;charset=UTF-8",
          },
        });

      } catch (error) {
        return errorPage("خطأ في الخادم", `حدث خطأ غير متوقع: ${error.message}`);
      }
    }

    // Health check endpoint
    if (url.pathname === "/") {
      return new Response(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>Dream House OAuth Gateway</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        h1 { color: #28a745; }
        .status { background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Dream House OAuth Gateway</h1>
        <div class="status">✅ الخادم يعمل بشكل صحيح</div>
        <h3>Endpoints:</h3>
        <ul>
            <li><code>/auth</code> - بدء عملية المصادقة</li>
            <li><code>/callback</code> - استلام الرد من GitHub</li>
        </ul>
        <h3>الإعدادات:</h3>
        <ul>
            <li>GITHUB_CLIENT_ID: ${env.GITHUB_CLIENT_ID ? '✅ موجود' : '❌ غير موجود'}</li>
            <li>GITHUB_CLIENT_SECRET: ${env.GITHUB_CLIENT_SECRET ? '✅ موجود' : '❌ غير موجود'}</li>
        </ul>
    </div>
</body>
</html>`, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" }
      });
    }

    return errorPage("صفحة غير موجودة", `المسار ${url.pathname} غير موجود. المسارات المتاحة: /, /auth, /callback`);
  },
};

// Error page helper function
function errorPage(title, details) {
  return new Response(`
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="utf-8">
    <title>خطأ - ${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #ff6b6b 0%, #c44569 100%);
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 500px;
        }
        h1 { color: #dc3545; margin-bottom: 10px; }
        .error-icon { font-size: 60px; margin-bottom: 20px; }
        .details { 
            background: #f8d7da; 
            color: #721c24;
            padding: 15px; 
            border-radius: 8px; 
            text-align: left;
            direction: ltr;
            font-family: monospace;
            font-size: 13px;
            word-break: break-all;
        }
        .back-btn {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #dc3545;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
        }
        .back-btn:hover { background: #c82333; }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-icon">❌</div>
        <h1>${title}</h1>
        <div class="details">${details}</div>
        <a href="https://dreamhouse-website.pages.dev/admin/" class="back-btn">العودة للوحة التحكم</a>
    </div>
</body>
</html>`, {
    status: 400,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
