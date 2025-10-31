# 💳 Stripe Integration - Quick Setup

## ✅ Code is Ready!

All Stripe integration code has been added and pushed to GitHub.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Stripe Keys

1. **Go to**: https://dashboard.stripe.com/test/apikeys
2. **Copy**:
   - **Secret Key**: `sk_test_...`
   - **Publishable Key**: `pk_test_...`

### Step 2: Add to Backend (Fly.io)

```bash
export PATH="$HOME/.fly/bin:$PATH"

# Set Stripe secret key
flyctl secrets set STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY -a protega-api

# Optional: Store publishable key for reference
flyctl secrets set STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY -a protega-api
```

### Step 3: Set Up Webhook

1. **Go to**: https://dashboard.stripe.com/test/webhooks
2. **Click**: "Add endpoint"
3. **URL**: `https://protega-api.fly.dev/api/webhooks/stripe`
4. **Events**: Select:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. **Copy** the **Signing secret** (`whsec_...`)
6. **Set in Fly.io**:
   ```bash
   flyctl secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET -a protega-api
   ```

### Step 4: Add to Frontend (Vercel)

1. **Go to**: https://vercel.com/protegos-projects/frontend/settings/environment-variables
2. **Add**:
   - **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Value**: `pk_test_YOUR_ACTUAL_KEY`
3. **Redeploy**

### Step 5: Deploy Backend Changes

```bash
cd backend
flyctl deploy -a protega-api
```

---

## ✅ That's It!

Your app now processes real payments through Stripe!

---

## 🧪 Test

**Test Card**: `4242 4242 4242 4242`
- Any expiry date
- Any CVC
- Any ZIP

**More test cards**: https://stripe.com/docs/testing

---

See `STRIPE_SETUP.md` for detailed documentation.

