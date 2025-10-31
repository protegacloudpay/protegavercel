# 🚀 START HERE: Deploy Protega CloudPay

Follow these steps in order to deploy your application.

---

## Step 1: Install Fly.io CLI (2 minutes)

### macOS/Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

### Or with Homebrew (macOS):
```bash
brew install flyctl
```

### Verify Installation:
```bash
flyctl version
```

### Login:
```bash
flyctl auth login
```
(This opens your browser to authenticate)

---

## Step 2: Deploy Backend to Fly.io (5 minutes)

```bash
# Navigate to backend folder
cd backend

# Create Fly.io app (first time only)
flyctl launch --no-deploy
```
**When prompted:**
- **App name**: Type `protega-cloudpay-api` (or press Enter to use suggested name)
- **Region**: Choose closest to you (e.g., type `iad` for Washington D.C.)
- **PostgreSQL**: Type `n` (we'll add it separately)

---

### Step 2b: Create PostgreSQL Database

```bash
# Create database
flyctl postgres create --name protega-cloudpay-db --region iad
```

**When prompted:**
- **Attach to app**: Type `yes`
- This automatically sets `DATABASE_URL` for your app

---

### Step 2c: Set Environment Variables (Secrets)

```bash
# Generate and set master key (REQUIRED)
flyctl secrets set PROTEGA_MASTER_KEY=$(openssl rand -hex 64)

# Generate and set JWT secret (REQUIRED)
flyctl secrets set SECRET_KEY=$(openssl rand -hex 32)

# Set frontend URL (we'll update this after Vercel deployment)
# For now, use a placeholder
flyctl secrets set FRONTEND_URL=https://protega-app.vercel.app
```

**Optional (if using Stripe):**
```bash
flyctl secrets set STRIPE_SECRET_KEY=sk_test_xxx
flyctl secrets set STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

### Step 2d: Deploy Backend

```bash
flyctl deploy
```

**This will:**
- Build your Docker image
- Deploy to Fly.io
- Give you a URL like: `https://protega-cloudpay-api.fly.dev`

**⏱️ Wait 2-3 minutes for deployment to complete**

---

### Step 2e: Verify Backend

```bash
# Test health endpoint
curl https://protega-cloudpay-api.fly.dev/healthz
```

**Expected response:**
```json
{"status": "ok", "database": "connected", "version": "2.0.0"}
```

**✅ If you see this, backend is working!**

**📝 Copy your Fly.io URL** - you'll need it for Step 3:
```
https://protega-cloudpay-api.fly.dev
```

---

## Step 3: Deploy Frontend to Vercel (5 minutes)

### Option A: Via Web UI (Easiest)

1. **Go to**: https://vercel.com/new
2. **Click**: "Import Git Repository"
3. **Select**: Your GitHub repository
4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT**: Set this!
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)
5. **Environment Variables**:
   - Click "Environment Variables"
   - Add:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://protega-cloudpay-api.fly.dev` (use YOUR Fly.io URL from Step 2!)
6. **Click**: "Deploy"

**⏱️ Wait 2-3 minutes for deployment**

7. **Copy your Vercel URL** - you'll see something like:
   ```
   https://protega-app.vercel.app
   ```

---

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# When prompted:
# - Link to existing project? No
# - Project name: protega-cloudpay
# - Directory: ./
# - Environment variables: Add NEXT_PUBLIC_API_URL=https://protega-cloudpay-api.fly.dev
```

---

## Step 4: Link Backend and Frontend (1 minute)

Now update Fly.io with your actual Vercel URL:

```bash
# Replace with YOUR actual Vercel URL
flyctl secrets set FRONTEND_URL=https://your-actual-vercel-url.vercel.app

# Restart app to apply changes
flyctl restart -a protega-cloudpay-api
```

---

## Step 5: Test Everything ✅

### Test 1: Backend Health
```bash
curl https://protega-cloudpay-api.fly.dev/healthz
```
Should return: `{"status": "ok", "database": "connected"}`

### Test 2: Frontend Loads
Visit your Vercel URL in browser:
```
https://your-app.vercel.app
```

### Test 3: API Connection
1. Open browser console (F12)
2. Visit your frontend
3. Try logging in or registering
4. Check for CORS errors (should be none)

---

## 🎉 Done!

Your application is now live:

- **Backend**: `https://protega-cloudpay-api.fly.dev`
- **Frontend**: `https://your-app.vercel.app`
- **Database**: PostgreSQL on Fly.io

---

## 🆘 Troubleshooting

### Backend won't start?
```bash
# Check logs
flyctl logs -a protega-cloudpay-api

# Check status
flyctl status -a protega-cloudpay-api
```

### Database connection failed?
```bash
# Verify database is attached
flyctl status -a protega-cloudpay-api

# Check DATABASE_URL is set
flyctl secrets list -a protega-cloudpay-api
```

### CORS errors?
1. Verify `FRONTEND_URL` in Fly.io matches your Vercel URL exactly:
   ```bash
   flyctl secrets list -a protega-cloudpay-api
   ```
2. Update if wrong:
   ```bash
   flyctl secrets set FRONTEND_URL=https://correct-url.vercel.app
   flyctl restart -a protega-cloudpay-api
   ```

### Frontend can't connect to backend?
1. Check `NEXT_PUBLIC_API_URL` in Vercel dashboard
2. Make sure it matches your Fly.io URL exactly
3. Redeploy frontend if you changed it

---

## 📚 Next Steps

- Custom domains (optional)
- Monitoring setup
- Production optimizations

See `DEPLOYMENT_GUIDE.md` for advanced configuration.

