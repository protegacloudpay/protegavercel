# ⚡ Quick Deployment Guide

**5-minute setup for Fly.io + Vercel**

---

## 🚀 Backend (Fly.io) - 3 minutes

### 1. Install Fly.io CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Or Homebrew
brew install flyctl
```

### 2. Login

```bash
flyctl auth login
```

### 3. Deploy Backend

```bash
cd backend

# Create app (first time only)
flyctl launch --no-deploy

# Add PostgreSQL database
flyctl postgres create --name protega-cloudpay-db --region iad

# Set secrets
flyctl secrets set PROTEGA_MASTER_KEY=$(openssl rand -hex 64)
flyctl secrets set SECRET_KEY=$(openssl rand -hex 32)
flyctl secrets set FRONTEND_URL=https://protega-app.vercel.app

# Deploy
flyctl deploy
```

✅ Copy your URL: `https://protega-cloudpay-api.fly.dev`

✅ Test: `curl https://protega-cloudpay-api.fly.dev/healthz`

---

## 🌐 Frontend (Vercel) - 2 minutes

1. Go to https://vercel.com/new → **Import Git Repository**
2. Configure:
   - **Root Directory**: `frontend`
   - **Framework**: Next.js (auto)
3. **Environment Variables**:
   ```env
   NEXT_PUBLIC_API_URL=https://protega-cloudpay-api.fly.dev
   ```
   (Use your actual Fly.io URL!)
4. Click **Deploy**

✅ Test: Visit `https://protega-app.vercel.app`

---

## 🔄 Link Them Together - 1 minute

1. Copy Vercel URL: `https://protega-app.vercel.app`
2. Update Fly.io secret:
   ```bash
   flyctl secrets set FRONTEND_URL=https://protega-app.vercel.app
   ```
3. Restart app:
   ```bash
   flyctl restart
   ```

---

## ✅ Done!

- Backend: `https://protega-cloudpay-api.fly.dev`
- Frontend: `https://protega-app.vercel.app`
- Health: `/healthz` endpoint works

---

## 📋 Useful Fly.io Commands

```bash
# View logs
flyctl logs

# Check status
flyctl status

# Update secrets
flyctl secrets set KEY=value

# Restart app
flyctl restart

# SSH into app
flyctl ssh console

# Scale up
flyctl scale count 2
```

Both auto-deploy on Git push! 🎉
