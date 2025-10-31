# 🚀 Fly.io Deployment - Step by Step

## Prerequisites

1. **Install Fly.io CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   # Or: brew install flyctl
   ```

2. **Login**:
   ```bash
   flyctl auth login
   ```

---

## Deploy Backend

### 1. Initialize Fly.io App

```bash
cd backend
flyctl launch --no-deploy
```

When prompted:
- **App name**: `protega-cloudpay-api` (or choose your own)
- **Region**: Choose closest to you (e.g., `iad` for Washington D.C.)
- **PostgreSQL**: Skip for now (we'll add it separately)

This creates `fly.toml` configuration file.

### 2. Create PostgreSQL Database

```bash
flyctl postgres create --name protega-cloudpay-db --region iad
```

When prompted:
- **Attach to app**: Type `yes`
- This automatically sets `DATABASE_URL` as a secret

### 3. Set Secrets (Environment Variables)

```bash
# Required: Master key for Secure Enclave
flyctl secrets set PROTEGA_MASTER_KEY=$(openssl rand -hex 64)

# Required: JWT secret
flyctl secrets set SECRET_KEY=$(openssl rand -hex 32)

# Required: Frontend URL (set after Vercel deployment)
flyctl secrets set FRONTEND_URL=https://protega-app.vercel.app

# Optional: Additional CORS origins
flyctl secrets set CORS_ORIGINS=https://protega-app.vercel.app

# Optional: Stripe keys
flyctl secrets set STRIPE_SECRET_KEY=sk_test_xxx
flyctl secrets set STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Optional: JWT settings
flyctl secrets set ALGORITHM=HS256
flyctl secrets set ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**View secrets**:
```bash
flyctl secrets list
```

### 4. Deploy

```bash
flyctl deploy
```

This will:
- Build Docker image from `Dockerfile`
- Deploy to Fly.io
- Assign URL: `https://protega-cloudpay-api.fly.dev`

### 5. Verify Deployment

```bash
# Check status
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

## Update After Frontend Deployment

Once Vercel is deployed:

```bash
# Update FRONTEND_URL
flyctl secrets set FRONTEND_URL=https://your-vercel-url.vercel.app

# Restart app
flyctl restart
```

---

## Useful Commands

```bash
# View logs (real-time)
flyctl logs -a protega-cloudpay-api

# Check app status
flyctl status -a protega-cloudpay-api

# SSH into app
flyctl ssh console -a protega-cloudpay-api

# View metrics
flyctl metrics -a protega-cloudpay-api

# Scale app
flyctl scale count 2 -a protega-cloudpay-api

# Connect to database
flyctl postgres connect -a protega-cloudpay-db

# View database status
flyctl postgres status -a protega-cloudpay-db
```

---

## Troubleshooting

### App won't start
```bash
flyctl logs -a protega-cloudpay-api
flyctl status -a protega-cloudpay-api
flyctl ssh console -a protega-cloudpay-api
```

### Database connection issues
```bash
# Verify database is attached
flyctl status -a protega-cloudpay-api

# Check DATABASE_URL secret
flyctl secrets list -a protega-cloudpay-api

# Test connection
flyctl postgres connect -a protega-cloudpay-db
```

### CORS errors
```bash
# Check FRONTEND_URL
flyctl secrets list -a protega-cloudpay-api

# Update if needed
flyctl secrets set FRONTEND_URL=https://correct-url.vercel.app -a protega-cloudpay-api
flyctl restart -a protega-cloudpay-api
```

---

## Custom Domain (Optional)

```bash
# Add certificate
flyctl certs add api.protegacloudpay.com -a protega-cloudpay-api

# Update DNS (at your DNS provider)
# CNAME api.protegacloudpay.com → protega-cloudpay-api.fly.dev

# Verify
flyctl certs show api.protegacloudpay.com -a protega-cloudpay-api
```

---

## Cost Management

Fly.io offers:
- **Free tier**: 3 shared-cpu VMs, 3GB storage
- **Paid plans**: Starting at $1.94/month per VM

Monitor usage:
```bash
flyctl dashboard
```

