# 🔧 Manual Vercel Configuration

Since Vercel isn't showing the `frontend` folder automatically, configure it manually:

---

## ✅ Solution: Use Root Directory with Custom Build Settings

### In Vercel Import Page:

1. **Root Directory**: Select **`protegavercel`** (the root)

2. **Framework Preset**: Should auto-detect **Next.js** - if not, manually select it

3. **Override Settings** - Click "Override" or "Edit" and set:

   **Root Directory**: `frontend`
   
   **Build Command**: 
   ```
   npm install && npm run build
   ```
   
   **Output Directory**: 
   ```
   .next
   ```
   
   **Install Command**: 
   ```
   npm install
   ```

4. **Environment Variables**:
   - Add: `NEXT_PUBLIC_API_URL = https://protega-api.fly.dev`

5. **Deploy!**

---

## 🔄 Alternative: Update vercel.json

I've updated the `vercel.json` file to specify `"rootDirectory": "frontend"`. 

**Try this:**
1. **Cancel current import** (if in progress)
2. **Refresh the page**
3. **Re-import** the repository
4. Vercel should now read the `vercel.json` and use `frontend` automatically!

---

## 📋 Quick Steps

1. Go to: https://vercel.com/new
2. Import: `protegacloudpay/protegavercel`
3. **If you see options**: Select `protegavercel` (root)
4. **Click "Override"** or "Edit" on the build settings
5. **Manually set**:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `.next`
6. **Add Environment Variable**: `NEXT_PUBLIC_API_URL = https://protega-api.fly.dev`
7. **Deploy!**

---

**The vercel.json has been updated and pushed to GitHub. Try refreshing Vercel now!**



