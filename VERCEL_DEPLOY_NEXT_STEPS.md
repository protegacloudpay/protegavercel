# ✅ Step 2 Complete! Now Deploy to Vercel

Your code is now on GitHub: https://github.com/protegacloudpay/protegavercel

---

## 🚀 Step 3: Deploy on Vercel (5 minutes)

### 1. Go to Vercel

**Open**: https://vercel.com/new

### 2. Import Your Repository

1. Click **"Import Git Repository"**
2. If prompted, **connect GitHub**:
   - Click "Connect Git Provider"
   - Select "GitHub"
   - Authorize Vercel
3. **Find and click**: `protegacloudpay/protegavercel`
4. Click **"Import"**

### 3. Configure Project ⚠️ CRITICAL SETTINGS

**⚠️ IMPORTANT - Pay attention to these:**

1. **Framework Preset**: Should show **"Next.js"** ✅ (auto-detected)

2. **Root Directory** ⚠️ **MUST CHANGE THIS**:
   - Click **"Edit"** next to "Root Directory"
   - Change from `/` to: **`frontend`**
   - This is **critical** - Vercel needs to know where your Next.js app is!

3. **Build Command**: Should be `npm run build` ✅ (auto)

4. **Output Directory**: Should be `.next` ✅ (auto)

5. **Install Command**: Should be `npm install` ✅ (auto)

### 4. Add Environment Variable

1. Click **"Environment Variables"**
2. Click **"Add New"**
3. Enter:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://protega-api.fly.dev`
   - ⚠️ This connects your frontend to your Fly.io backend!
4. Click **"Add"**
5. Click **"Continue"**

### 5. Deploy!

1. Click **"Deploy"** button
2. **Wait 2-3 minutes** while Vercel:
   - Installs dependencies
   - Builds your Next.js app
   - Deploys to production

### 6. Get Your Vercel URL

Once deployment finishes:
- **Copy your Vercel URL** - it will look like:
  - `https://protegavercel.vercel.app`
  - or `https://frontend-xxx.vercel.app`

**Save this URL!** You'll need it in the next step.

---

## 🔄 Step 4: Update Fly.io CORS (After Deployment)

Once you have your Vercel URL, run:

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app -a protega-api
flyctl restart -a protega-api
```

Replace `your-vercel-url.vercel.app` with your actual Vercel URL from Step 6 above.

---

## ✅ Summary

- ✅ **Step 1**: GitHub repo created
- ✅ **Step 2**: Code pushed to GitHub
- ⏳ **Step 3**: Deploy on Vercel (do this now!)
- ⏳ **Step 4**: Update Fly.io CORS (after Vercel deployment)

---

## 🆘 Need Help?

If Vercel build fails:
1. Check **Root Directory** is set to `frontend`
2. Check **environment variable** is set correctly
3. View build logs in Vercel dashboard

**Ready? Go to https://vercel.com/new and follow Step 3 above!**



