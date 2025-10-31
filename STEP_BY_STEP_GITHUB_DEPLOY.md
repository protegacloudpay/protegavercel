# 📋 Step-by-Step: Deploy to Vercel via GitHub

Follow these steps **in order**:

---

## ✅ STEP 1: Create GitHub Repository (2 minutes)

1. **Open**: https://github.com/new
2. **Repository name**: `Protega123` (or your preferred name)
3. **Description**: `Protega CloudPay - Biometric Payment System` (optional)
4. **Visibility**: Choose **Public** or **Private**
5. **⚠️ IMPORTANT**: 
   - ❌ **DO NOT** check "Add a README file"
   - ❌ **DO NOT** check "Add .gitignore"  
   - ❌ **DO NOT** check "Choose a license"
   - (We already have these files!)
6. **Click**: "Create repository"

---

## ✅ STEP 2: Get Your Repository URL

After creating the repo, GitHub will show you a page with commands.

**Look for the URL** that looks like:
```
https://github.com/YOUR_USERNAME/Protega123.git
```

**Or find it in the green "Code" button** on your new repo page.

**📝 Write it down or copy it!** You'll need it in the next step.

---

## ✅ STEP 3: Push Code to GitHub (1 minute)

**Open your terminal** and run these commands:

```bash
cd /Users/mjrodriguez/Desktop/Protega123

# Add your GitHub repository (replace with YOUR actual URL)
git remote add origin https://github.com/YOUR_USERNAME/Protega123.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` and `Protega123`** with your actual GitHub username and repository name!

**If asked for authentication:**
- Use a **Personal Access Token** (not password)
- Or use **GitHub CLI**: `gh auth login`

---

## ✅ STEP 4: Deploy on Vercel (3 minutes)

### 4a. Go to Vercel

1. **Open**: https://vercel.com/new
2. **Click**: "Import Git Repository"
3. **Connect GitHub** (if not already connected):
   - Click "Connect Git Provider"
   - Select "GitHub"
   - Authorize Vercel

### 4b. Select Your Repository

4. **Find and click**: Your `Protega123` repository
5. **Click**: "Import"

### 4c. Configure Project

**⚠️ IMPORTANT SETTINGS:**

6. **Framework Preset**: Should show "Next.js" ✅ (auto-detected)

7. **Root Directory**: 
   - Click "Edit" next to Root Directory
   - Change from `/` to: `frontend`
   - ⚠️ **This is critical!**

8. **Build Command**: Should be `npm run build` ✅ (auto)

9. **Output Directory**: Should be `.next` ✅ (auto)

10. **Install Command**: Should be `npm install` ✅ (auto)

### 4d. Add Environment Variable

11. **Click**: "Environment Variables"
12. **Add New**:
    - **Name**: `NEXT_PUBLIC_API_URL`
    - **Value**: `https://protega-api.fly.dev`
    - **⚠️ Use YOUR actual Fly.io backend URL!**
13. **Click**: "Add"
14. **Click**: "Continue"

### 4e. Deploy!

15. **Click**: "Deploy"
16. **Wait 2-3 minutes** while Vercel:
    - Installs dependencies
    - Builds your app
    - Deploys to production

---

## ✅ STEP 5: Get Your Vercel URL

Once deployment finishes:

1. **Copy your Vercel URL** - looks like:
   ```
   https://protega123.vercel.app
   ```
   or
   ```
   https://frontend-xxx.vercel.app
   ```

2. **Save this URL** - you'll need it next!

---

## ✅ STEP 6: Update Fly.io CORS (1 minute)

**In your terminal**, run:

```bash
# Replace with YOUR actual Vercel URL
flyctl secrets set FRONTEND_URL=https://your-actual-vercel-url.vercel.app -a protega-api

# Restart to apply changes
flyctl restart -a protega-api
```

**Replace `your-actual-vercel-url.vercel.app`** with the URL from Step 5!

---

## 🎉 DONE!

Your application is now live:

- **Backend**: https://protega-api.fly.dev ✅
- **Frontend**: https://your-app.vercel.app ✅
- **Database**: Neon PostgreSQL ✅

**Test it**: Visit your Vercel URL in a browser!

---

## 🆘 Troubleshooting

### GitHub Authentication Issues

If `git push` fails:

**Option A: Use GitHub CLI**
```bash
gh auth login
gh repo create Protega123 --public --source=. --remote=origin --push
```

**Option B: Use Personal Access Token**
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Check: `repo` scope
4. Use token as password when pushing

### Vercel Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify Root Directory** is set to `frontend`
3. **Check environment variables** are set correctly

### Frontend Can't Connect to Backend

1. **Verify** `NEXT_PUBLIC_API_URL` in Vercel matches Fly.io URL
2. **Check** CORS is updated in Fly.io
3. **Test** backend health: `curl https://protega-api.fly.dev/healthz`

---

## ✅ Current Status

- ✅ Git repository initialized
- ✅ Files committed
- ⏳ **Waiting for you to:**
  1. Create GitHub repo (Step 1)
  2. Push code (Step 2)
  3. Deploy on Vercel (Step 4)

**Let me know when you've completed Step 1, and I'll help with Step 2!**



