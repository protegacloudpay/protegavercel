# Protega CloudPay - Production Deployment Guide

## Prerequisites

Before deploying, ensure you have:

1. **Stripe Account** with:
   - Secret Key (`STRIPE_SECRET_KEY`)
   - Publishable Key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
   - Webhook Secret (`STRIPE_WEBHOOK_SECRET`)

2. **Neon Database** with connection string ready

3. **Security Master Key** generated:
   ```bash
   openssl rand -hex 64
   ```

## Backend Deployment (Fly.io)

### 1. Navigate to backend directory
```bash
cd /Users/mjrodriguez/Desktop/Protega123/backend
```

### 2. Set required secrets
```bash
# Database
fly secrets set DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST.neon.tech/neondb?sslmode=require"

# Stripe
fly secrets set STRIPE_SECRET_KEY="sk_live_YOUR_KEY"
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET"

# Security
fly secrets set PROTEGA_MASTER_KEY="YOUR_64_CHAR_HEX_KEY"
fly secrets set JWT_SECRET_KEY="YOUR_JWT_SECRET"

# Frontend URL for CORS
fly secrets set FRONTEND_URL="https://your-app.vercel.app"
```

### 3. Deploy backend
```bash
fly deploy
```

### 4. Verify deployment
```bash
fly logs
curl https://protega-api.fly.dev/healthz
```

## Frontend Deployment (Vercel)

### 1. Navigate to frontend directory
```bash
cd /Users/mjrodriguez/Desktop/Protega123/frontend
```

### 2. Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### 3. Set environment variables in Vercel Dashboard or CLI

**Via Vercel Dashboard:**
- Go to your project settings → Environment Variables
- Add:
  - `NEXT_PUBLIC_API_URL` = `https://protega-api.fly.dev`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_YOUR_KEY`

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://protega-api.fly.dev

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Enter: pk_live_YOUR_KEY
```

### 4. Deploy frontend
```bash
vercel --prod
```

## Post-Deployment Verification

### 1. Test Backend Health
```bash
curl https://protega-api.fly.dev/healthz
```

Expected response:
```json
{"status": "healthy", "database": "connected"}
```

### 2. Test Merchant Registration
```bash
curl -X POST https://protega-api.fly.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Merchant",
    "email": "test@merchant.com",
    "password": "SecurePass123!",
    "company_name": "Test Company",
    "role": "merchant"
  }'
```

### 3. Test Frontend
1. Visit your Vercel URL
2. Click "Sign Up" and create a merchant account
3. Log in and verify:
   - Dashboard loads with $0.00 revenue (no mock data)
   - Inventory page is empty (no demo products)
   - POS terminal is accessible
   - Customer terminal URL works

### 4. Test Customer Flow
1. Go to `/customer/register`
2. Complete registration with fingerprint enrollment
3. Add a payment method (requires real Stripe publishable key)
4. Verify card appears in payment methods

### 5. Test End-to-End Transaction
1. As merchant: Add a product to inventory
2. Open POS terminal
3. Scan/add product to cart
4. On customer terminal: Verify fingerprint
5. Select payment method
6. Complete payment
7. Verify transaction appears in merchant dashboard

## Stripe Webhook Setup

### 1. Get your webhook URL
```
https://protega-api.fly.dev/api/webhooks/stripe
```

### 2. In Stripe Dashboard
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copy the **Signing secret**
6. Update Fly.io secret:
   ```bash
   fly secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET"
   ```

### 3. Test webhook
```bash
stripe trigger payment_intent.succeeded
```

## Troubleshooting

### Backend Issues

**Database connection fails:**
```bash
# Check secrets
fly secrets list

# View logs
fly logs

# SSH into instance
fly ssh console
```

**CORS errors:**
- Verify `FRONTEND_URL` secret matches your Vercel domain
- Check browser console for actual origin being blocked

### Frontend Issues

**API calls fail with 404:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is deployed and healthy

**Stripe Elements not showing:**
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Check browser console for Stripe errors

**Still seeing old/demo data:**
```bash
# Clear browser cache and hard refresh
# Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

# Or rebuild and redeploy
vercel --prod --force
```

## Security Checklist

- [ ] All API keys are set as secrets (not committed to git)
- [ ] `PROTEGA_MASTER_KEY` is 64+ characters and randomly generated
- [ ] Database uses SSL (`sslmode=require`)
- [ ] Stripe is in live mode (keys start with `sk_live_` and `pk_live_`)
- [ ] CORS is configured with specific frontend URL
- [ ] JWT secret is strong and unique
- [ ] Webhooks are verified with signing secret

## Rollback Plan

**Backend:**
```bash
# List releases
fly releases

# Rollback to previous version
fly releases rollback <VERSION_NUMBER>
```

**Frontend:**
```bash
# In Vercel dashboard: Deployments → Select previous → Promote to Production
# Or via CLI:
vercel rollback
```

## Monitoring

**Backend:**
```bash
# Real-time logs
fly logs

# Metrics
fly dashboard
```

**Frontend:**
- Vercel Dashboard → Analytics
- Vercel Dashboard → Logs

## Support

For issues:
1. Check logs (Fly.io and Vercel dashboards)
2. Verify all environment variables are set
3. Test API endpoints directly with curl
4. Check Stripe dashboard for payment errors

