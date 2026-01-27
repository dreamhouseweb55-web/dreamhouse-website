# 🚀 Setup Guide - Cloudflare Workers (Git Gateway)

اتبع الخطوات دي بالترتيب عشان تخلص الإعداد في **10 دقائق**.

---

## **الخطوة 1: إنشاء حساب Cloudflare**

1. افتح [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. سجل بأي إيميل (مجاني 100%)
3. افتح الإيميل واعمل Verify

---

## **الخطوة 2: إنشاء GitHub Personal Access Token**

1. افتح [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. اضغط **"Generate new token"** → **"Generate new token (classic)"**
3. في **Note** اكتب: `Decap CMS Token`
4. في **Expiration** اختار: `No expiration`
5. في **Scopes** فعّل:
   - ✅ `repo` (كل الصلاحيات تحتها)
6. اضغط **"Generate token"**
7. **انسخ الـ Token وحطه في مكان آمن** (مش هيظهر تاني!)

مثال للـ Token:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## **الخطوة 3: نشر الـ Worker على Cloudflare**

افتح **PowerShell** وشغل الأوامر دي:

```powershell
# 1. روح لمجلد الـ Worker
cd "e:\DREAM HOUSE\cloudflare-worker"

# 2. نزّل Wrangler (أداة Cloudflare)
npm install -g wrangler

# 3. سجل دخول Cloudflare
wrangler login
```

هيفتح متصفح، اعمل **Allow** للصلاحيات.

```powershell
# 4. انشر الـ Worker
wrangler deploy
```

**النتيجة:** هتشوف رسالة فيها:
```
Published dreamhouse-git-gateway
  https://dreamhouse-git-gateway.YOUR_SUBDOMAIN.workers.dev
```

**انسخ الـ URL ده!** 📋

---

## **الخطوة 4: إضافة الـ GitHub Token للـ Worker**

```powershell
wrangler secret put GITHUB_TOKEN
```

هيطلب منك تكتب الـ Token:
- الصق الـ **GitHub Token** اللي نسخته من الخطوة 2
- اضغط **Enter**

---

## **الخطوة 5: تحديث config.yml**

1. افتح ملف: `e:\DREAM HOUSE\admin\config.yml`
2. في السطر 3، استبدل `YOUR_SUBDOMAIN` بـ subdomain بتاعك من الخطوة 3

**مثال:**
```yaml
backend:
  name: proxy
  proxy_url: https://dreamhouse-git-gateway.abc123.workers.dev/api
```

**احفظ الملف!**

---

## **✅ الخطوة الأخيرة: اختبار**

1. افتح الموقع المحلي: `http://localhost:8080/admin`
2. اعمل Login بحساب جوجل (`dreamhouseweb55@gmail.com`)
3. **المفروض CMS يفتح مباشرة بدون GitHub Login!**
4. جرب تعدل منتج واحفظ
5. روح على GitHub وشوف الـ commit

---

## ✨ **تم بنجاح!**

دلوقتي أنت بتدخل **مرة واحدة بس** بجوجل ومفيش GitHub Login خالص! 🎉
