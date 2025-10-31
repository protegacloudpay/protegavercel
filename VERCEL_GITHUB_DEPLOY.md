# 🚀 Deploy to Vercel via GitHub

Deploying via GitHub is **much easier** than CLI - Vercel handles everything!

---

## ✅ Advantages of GitHub Deployment

- ✅ **No TypeScript build errors** - Vercel handles it better
- ✅ **Automatic deployments** on every Git push
- ✅ **Environment variables** via web UI (easier)
- ✅ **Better error messages** in dashboard
- ✅ **Auto-detects** Next.js configuration
- ✅ **No CLI issues**

---

## 📋 Steps to Deploy

### Step 1: Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Fix TypeScript errors and prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

### Step 2: Import to Vercel

1. **Go to**: https://vercel.com/new
2. **Click**: "Import Git Repository"
3. **Select**: Your GitHub repository
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected) ✅
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
   - **Install Command**: `npm install` (auto)

### Step 3: Set Environment Variables

**In Vercel Project Settings → Environment Variables**, add:

```
NEXT_PUBLIC_API_URL = https://protega-api.fly.dev
```

**⚠️ Use YOUR actual Fly.io URL!**

### Step 4: Deploy

Click **"Deploy"** - that's it!

Vercel will:
- ✅ Install dependencies
- ✅ Build your app
- ✅ Deploy to production
- ✅ Give you a URL like: `https://protega-app.vercel.app`

---

## 🔄 After Deployment

### Update Fly.io CORS

Once you have your Vercel URL:

```bash
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app -a protega-api
flyctl restart -a protega-api
```

---

## 📝 Quick Summary

1. ✅ Push code to GitHub
2. ✅ Go to vercel.com/new
3. ✅ Import your repo
4. ✅ Set Root Directory: `frontend`
5. ✅ Add env var: `NEXT_PUBLIC_API_URL=https://protega-api.fly.dev`
6. ✅ Deploy!

**Much easier than CLI!** 🎉



