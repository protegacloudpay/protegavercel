# 🚀 Migrated from Railway to Fly.io

All deployment configuration has been updated for **Fly.io** instead of Railway.

---

## ✅ What Changed

### Backend Configuration

1. **Created `backend/fly.toml`**:
   - App configuration for Fly.io
   - Health check endpoint: `/healthz`
   - Region: `iad` (Washington D.C.)
   - VM: 512MB RAM, 1 shared CPU

2. **Updated `backend/Dockerfile`**:
   - Uses `PORT` environment variable (auto-set by Fly.io)
   - Defaults to port 8000 for local development

3. **Updated `backend/main.py`**:
   - Comments now reference Fly.io instead of Railway
   - Health check endpoint ready for Fly.io monitoring

4. **Created `.dockerignore`**:
   - Excludes unnecessary files from Docker builds

### Documentation

1. **`DEPLOYMENT_GUIDE.md`**: Complete rewrite for Fly.io
2. **`QUICK_DEPLOY.md`**: Quick start guide for Fly.io
3. **`FLY_DEPLOY.md`**: Step-by-step Fly.io deployment guide
4. **`FLY_IO_MIGRATION.md`**: This file

### Removed Files

- `railway.json` ❌
- `.railwayignore` ❌

---

## 🚀 Quick Start (Fly.io)

### 1. Install Fly.io CLI

```bash
curl -L https://fly.io/install.sh | sh
flyctl auth login
```

### 2. Deploy Backend

```bash
cd backend
flyctl launch --no-deploy
flyctl postgres create --name protega-cloudpay-db --region iad
flyctl secrets set PROTEGA_MASTER_KEY=$(openssl rand -hex 64)
flyctl secrets set SECRET_KEY=$(openssl rand -hex 32)
flyctl secrets set FRONTEND_URL=https://protega-app.vercel.app
flyctl deploy
```

### 3. Deploy Frontend (Vercel)

1. Go to https://vercel.com/new
2. Root Directory: `frontend`
3. Environment Variable: `NEXT_PUBLIC_API_URL=https://protega-cloudpay-api.fly.dev`
4. Deploy

### 4. Link Them

```bash
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app
flyctl restart
```

---

## 📋 Key Differences: Railway vs Fly.io

| Feature | Railway | Fly.io |
|---------|---------|--------|
| **CLI Required** | No (Web UI) | Yes (`flyctl`) |
| **Secrets** | Dashboard UI | CLI (`flyctl secrets set`) |
| **Database** | Plugin (auto-attached) | CLI (`flyctl postgres create`) |
| **Logs** | Dashboard | CLI (`flyctl logs`) |
| **SSH Access** | Limited | Full (`flyctl ssh console`) |
| **Regions** | Automatic | Choose during setup |
| **Scaling** | Auto | Manual (`flyctl scale`) |
| **Free Tier** | Limited | 3 VMs, 3GB storage |

---

## 🔍 Verification

After deployment:

```bash
# Check backend
curl https://protega-cloudpay-api.fly.dev/healthz

# Expected: {"status": "ok", "database": "connected", "version": "2.0.0"}

# View logs
flyctl logs -a protega-cloudpay-api

# Check status
flyctl status -a protega-cloudpay-api
```

---

## 📚 Documentation

- **Full Guide**: `DEPLOYMENT_GUIDE.md`
- **Quick Start**: `QUICK_DEPLOY.md`
- **Step-by-Step**: `FLY_DEPLOY.md`

---

## ✅ Ready to Deploy!

All configuration is complete. Follow `QUICK_DEPLOY.md` for fastest setup, or `DEPLOYMENT_GUIDE.md` for detailed instructions.

