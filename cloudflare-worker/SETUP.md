# ⚙️ إعداد مصادقة GitHub مع Decap CMS

هذا الـ Worker يعمل كخادم OAuth لربط Decap CMS مع GitHub.

## ✅ الخطوات المطلوبة:

---

### 📌 الخطوة 1: إنشاء تطبيق OAuth على GitHub

1. اذهب إلى: **[GitHub Developer Settings](https://github.com/settings/developers)**
2. اضغط **OAuth Apps** ثم **New OAuth App**
3. املأ البيانات:

| الحقل | القيمة |
|-------|--------|
| **Application Name** | `Dream House CMS` |
| **Homepage URL** | `https://dreamhouseweb55-web.github.io/dreamhouse-website/` |
| **Authorization callback URL** | `https://dreamhouse-git-gateway.dreamhouseweb55.workers.dev/callback` |

4. اضغط **Register application**
5. **احفظ القيم التالية:**
   - ✅ **Client ID** (يظهر مباشرة)
   - ✅ **Client Secret** (اضغط "Generate a new client secret")

> ⚠️ **مهم:** احفظ الـ Client Secret فوراً لأنه لن يظهر مرة أخرى!

---

### 📌 الخطوة 2: تثبيت Wrangler CLI (مرة واحدة فقط)

```bash
npm install -g wrangler
```

---

### 📌 الخطوة 3: تسجيل الدخول لـ Cloudflare

```bash
wrangler login
```
سيفتح المتصفح لتسجيل الدخول لحسابك على Cloudflare.

---

### 📌 الخطوة 4: نشر الـ Worker

افتح التيرمينال في مجلد `cloudflare-worker`:

```bash
cd cloudflare-worker
wrangler deploy
```

ستحصل على رابط مثل: `https://dreamhouse-git-gateway.dreamhouseweb55.workers.dev`

---

### 📌 الخطوة 5: إضافة الـ Secrets

```bash
# أضف Client ID
wrangler secret put GITHUB_CLIENT_ID
# 👆 الصق الـ Client ID من GitHub ثم اضغط Enter

# أضف Client Secret
wrangler secret put GITHUB_CLIENT_SECRET
# 👆 الصق الـ Client Secret من GitHub ثم اضغط Enter
```

---

### 📌 الخطوة 6: التجربة

1. افتح الموقع: `https://dreamhouseweb55-web.github.io/dreamhouse-website/admin/`
2. اضغط **Login with GitHub**
3. وافق على الصلاحيات في النافذة المنبثقة
4. 🎉 أنت الآن في لوحة التحكم!

---

## 🔧 استكشاف الأخطاء:

### ❌ ظهور خطأ "Configuration Error"
- تأكد من إضافة الـ secrets بشكل صحيح:
```bash
wrangler secret list
```

### ❌ النافذة لا تُغلق بعد تسجيل الدخول
- تأكد من أن الـ callback URL في GitHub يطابق:
  `https://dreamhouse-git-gateway.dreamhouseweb55.workers.dev/callback`

### ❌ خطأ CORS
- الـ Worker يتعامل مع CORS تلقائياً، تأكد من أن الموقع منشور على GitHub Pages.

---

## 📁 الملفات في هذا المجلد:

| الملف | الوصف |
|-------|-------|
| `worker.js` | كود الـ OAuth Worker |
| `wrangler.toml` | إعدادات Cloudflare Worker |
| `SETUP.md` | هذا الملف (التعليمات) |

---

## ✅ ملخص سريع (للنسخ):

```bash
# 1. تثبيت Wrangler (مرة واحدة)
npm install -g wrangler

# 2. تسجيل الدخول
wrangler login

# 3. الانتقال للمجلد
cd cloudflare-worker

# 4. نشر الـ Worker
wrangler deploy

# 5. إضافة Client ID
wrangler secret put GITHUB_CLIENT_ID

# 6. إضافة Client Secret
wrangler secret put GITHUB_CLIENT_SECRET
```

بعد كده، اذهب لـ `/admin/` واضغط "Login with GitHub" 🚀
