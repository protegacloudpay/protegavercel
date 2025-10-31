# 🚀 Deploy to Vercel via GitHub - Simple Guide

**Yes! GitHub deployment is MUCH easier!** Here's how:

---

## ✅ Quick Steps

### 1. Push Your Code to GitHub

```bash
# If you haven't initialized git yet:
cd /Users/mjrodriguez/Desktop/Protega123
git init
git add .
git commit -m "Prepare for Vercel deployment"

# Connect to GitHub (create repo first on github.com)
git remote add origin https://github.com/yourusername/Protega123.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. **Go to**: https://vercel.com/new
2. **Import Git Repository**:
   - Click "Import Git Repository"
   - Select your GitHub repo
   - Or paste: `https://github.com/yourusername/Protega123`

3. **Configure Project**:
   - **Framework**: Next.js (auto-detected) ✅
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT - Set this!**
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

4. **Environment Variables**:
   - Click "Environment Variables"
   - Add:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://protega-api.fly.dev
     ```
   - ⚠️ Use YOUR actual Fly.io backend URL!

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://your-app.vercel.app`

---

## 🔄 After Deployment

### Update Fly.io CORS

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app -a protega-api
flyctl restart -a protega-api
```

---

## ✅ Done!

- **Backend**: https://protega-api.fly.dev ✅
- **Frontend**: https://your-app.vercel.app ✅
- **Auto-deploys** on every Git push! 🎉

---

## Why GitHub is Better

- ✅ **No CLI build errors**
- ✅ **Vercel handles TypeScript better**
- ✅ **Environment variables via web UI**
- ✅ **Better error messages**
- ✅ **Automatic deployments**
- ✅ **Easy rollbacks**

**Much simpler than CLI!** 🚀



