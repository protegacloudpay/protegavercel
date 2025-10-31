# 🚀 Protega CloudPay Deployment Guide

Complete guide for deploying Protega CloudPay to Fly.io (Backend) and Vercel (Frontend).

---

## 📋 Prerequisites

- GitHub repository with your code
- Railway account: https://railway.app
- Vercel account: https://vercel.com
- Stripe account (optional, for payments): https://stripe.com

---

## 🗂️ Project Structure

```
/protega-cloudpay/
 ┣ backend/
 ┃ ┣ main.py
 ┃ ┣ database.py
 ┃ ┣ models.py
 ┃ ┣ schemas.py
 ┃ ┣ auth.py
 ┃ ┣ security_enclave.py
 ┃ ┣ auth_biometric.py
 ┃ ┣ compliance.py
 ┃ ┣ requirements.txt
 ┃ ┣ Dockerfile
 ┃ ┗ .env.example
 ┗ frontend/
    ┣ package.json
    ┣ next.config.ts
    ┗ .env.example
```

---

## ⚙️ BACKEND DEPLOYMENT (Fly.io)

### Step 1: Install Fly.io CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or via Homebrew (macOS)
brew install flyctl
```

Verify installation:
```bash
flyctl version
```

### Step 2: Login to Fly.io

```bash
flyctl auth login
```

This opens your browser to authenticate.

### Step 3: Prepare Repository

Ensure your `backend/` folder contains:
- ✅ `Dockerfile` (already created)
- ✅ `requirements.txt` (updated)
- ✅ `main.py` with `/healthz` endpoint (updated)
- ✅ `.env.example` (created)
- ✅ `fly.toml` (created)

### Step 4: Create Fly.io App

From your project root directory:

```bash
cd backend
flyctl launch
```

This will:
- Ask for app name (or generate one: `protega-cloudpay-api`)
- Ask for region (choose closest to you, e.g., `iad` for Washington D.C.)
- Create `fly.toml` configuration file
- **DO NOT** deploy yet (we need to set up database first)

### Step 5: Add PostgreSQL Database

```bash
flyctl postgres create --name protega-cloudpay-db --region iad
```

This will:
- Create a PostgreSQL database
- Return a connection string
- Ask to attach to your app (say **yes**)

Fly.io will automatically inject `DATABASE_URL` as a secret.

### Step 6: Set Environment Variables (Secrets)

Set secrets (encrypted environment variables):

```bash
# Required - Generate master key
flyctl secrets set PROTEGA_MASTER_KEY=$(openssl rand -hex 64)

# Required - JWT secret
flyctl secrets set SECRET_KEY=$(openssl rand -hex 32)

# Required - Set after Vercel deployment
flyctl secrets set FRONTEND_URL=https://protega-app.vercel.app

# Optional - CORS origins
flyctl secrets set CORS_ORIGINS=https://protega-app.vercel.app

# Optional - Stripe keys
flyctl secrets set STRIPE_SECRET_KEY=sk_test_xxx
flyctl secrets set STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Optional - JWT settings
flyctl secrets set ALGORITHM=HS256
flyctl secrets set ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**⚠️ Important**: 
- Secrets are encrypted and only visible via `flyctl secrets list`
- Set `FRONTEND_URL` after Vercel deployment (see below)
- Update secrets: `flyctl secrets set KEY=value`

### Step 7: Deploy

```bash
flyctl deploy
```

This will:
- Build Docker image
- Deploy to Fly.io
- Expose on public URL: `https://protega-cloudpay-api.fly.dev`

### Step 8: Verify Backend

```bash
# Check app status
flyctl status

# View logs
flyctl logs

# Test health endpoint
curl https://protega-cloudpay-api.fly.dev/healthz
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "version": "2.0.0"
}
```

---

## 🌐 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Frontend

Ensure `frontend/` contains:
- ✅ `next.config.ts` (updated)
- ✅ `.env.example` (created)
- ✅ `package.json` with build scripts

### Step 2: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com/new
2. **Import Git Repository**
3. **Configure Project**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto)
   - **Output Directory**: `.next` (auto)

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://protega-api.up.railway.app
```

**⚠️ Important**: Replace with your actual Railway URL!

### Step 4: Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build Next.js app (`npm run build`)
   - Deploy to CDN
3. **Copy your Vercel URL**: e.g., `https://protega-app.vercel.app`

### Step 5: Update Fly.io CORS

Update the `FRONTEND_URL` secret in Fly.io:

```bash
flyctl secrets set FRONTEND_URL=https://protega-app.vercel.app
```

Fly.io will automatically restart with updated CORS settings.

---

## ✅ POST-DEPLOYMENT CHECKS

### Check 1: Backend Health
```bash
curl https://protega-cloudpay-api.fly.dev/healthz
```
Expected: `{"status": "ok", "database": "connected", "version": "2.0.0"}`

### Check 2: Frontend Loads
Visit: `https://protega-app.vercel.app`

Expected: Landing page loads correctly

### Check 3: API Connection
Open browser console on frontend, check:
- No CORS errors
- API requests go to Fly.io URL
- Authentication works

### Check 4: Database Connection
In Fly.io logs, check for:
```bash
flyctl logs
```
Look for:
- ✅ "Database initialized"
- ✅ No connection errors

---

## 🔐 SECURITY CHECKLIST

- [ ] `PROTEGA_MASTER_KEY` is 64+ characters (random hex)
- [ ] `SECRET_KEY` is 32+ characters (random)
- [ ] Never commit `.env` files
- [ ] CORS only allows your frontend URL
- [ ] HTTPS enabled (Railway & Vercel auto-enable)
- [ ] Database password is secure
- [ ] Stripe keys are production keys (not test keys) in production

---

## 🔄 UPDATING DEPLOYMENTS

### Backend (Railway)
- Push to `main` branch → Railway auto-deploys
- Or manually trigger in Railway dashboard

### Frontend (Vercel)
- Push to `main` branch → Vercel auto-deploys
- Or manually trigger in Vercel dashboard

---

## 🐛 TROUBLESHOOTING

### Backend Issues

**Database Connection Failed**
- Check database is attached: `flyctl status`
- Verify connection: `flyctl postgres connect -a protega-cloudpay-db`
- Check `DATABASE_URL` secret: `flyctl secrets list`
- Check Fly.io logs: `flyctl logs`

**CORS Errors**
- Verify `FRONTEND_URL` matches Vercel URL exactly: `flyctl secrets list`
- Check `CORS_ORIGINS` includes frontend URL
- Update secrets and restart: `flyctl secrets set FRONTEND_URL=https://...` then `flyctl restart`

**Import Errors**
- Verify all dependencies in `requirements.txt`
- Check `Dockerfile` copies all files correctly
- Check build logs: `flyctl logs`
- Test locally with Docker first

**App Won't Start**
- Check app status: `flyctl status`
- View logs: `flyctl logs`
- SSH into machine: `flyctl ssh console`
- Check health endpoint: `curl https://your-app.fly.dev/healthz`

### Frontend Issues

**API Connection Failed**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check Railway URL is accessible
- Check browser console for errors

**Build Fails**
- Check `next.config.ts` syntax
- Verify all dependencies in `package.json`
- Check Vercel build logs

**Environment Variables Not Working**
- Variables must start with `NEXT_PUBLIC_` to be exposed
- Redeploy after changing env vars
- Clear browser cache

---

## 📊 MONITORING

### Fly.io Logs
- View logs: `flyctl logs`
- Stream logs in real-time: `flyctl logs -a protega-cloudpay-api`
- View app status: `flyctl status`
- Monitor metrics: `flyctl metrics`

### Vercel Analytics
- Enable in Vercel dashboard → Analytics
- Monitor page views, performance

### Database Monitoring
- Connect to database: `flyctl postgres connect -a protega-cloudpay-db`
- View database info: `flyctl postgres status -a protega-cloudpay-db`
- Monitor database size and connections in Fly.io dashboard

---

## 🔗 CUSTOM DOMAINS (Optional)

### Backend Domain (Fly.io)
1. Add custom domain:
   ```bash
   flyctl certs add api.protegacloudpay.com
   ```
2. Update DNS: `CNAME api.protegacloudpay.com` → `protega-cloudpay-api.fly.dev`
3. Update `FRONTEND_URL` secret:
   ```bash
   flyctl secrets set FRONTEND_URL=https://api.protegacloudpay.com
   ```

### Frontend Domain (Vercel)
1. Add custom domain in Vercel dashboard
2. Update DNS: `CNAME app.protegacloudpay.com` → Vercel
3. SSL certificates auto-issued

---

## 📝 FINAL CHECKLIST

Before going live:

- [ ] Backend health check returns `{"status": "ok"}`
- [ ] Frontend loads without errors
- [ ] API calls work (test login/register)
- [ ] Database migrations applied
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] HTTPS enabled (auto by Railway/Vercel)
- [ ] Stripe keys are production keys
- [ ] Master key is secure (64+ chars random)
- [ ] Error logging enabled
- [ ] Custom domains configured (if applicable)

---

## 🎉 SUCCESS!

Your deployment is complete:

- **Backend**: `https://protega-cloudpay-api.fly.dev`
- **Frontend**: `https://protega-app.vercel.app`
- **Health Check**: `/healthz`
- **Database**: PostgreSQL on Fly.io

Both services include:
- ✅ HTTPS/SSL certificates (automatic)
- ✅ Global edge network (Fly.io)
- ✅ Monitoring and logs
- ✅ Zero-downtime deployments
- ✅ Auto-scaling (configurable)

---

## 📞 Support

If you encounter issues:
1. Check Fly.io logs: `flyctl logs`
2. Check app status: `flyctl status`
3. Check Vercel logs: Dashboard → Project → Deployments
4. Verify secrets are set: `flyctl secrets list`
5. Test locally first with same environment variables
6. SSH into app: `flyctl ssh console` (for debugging)


