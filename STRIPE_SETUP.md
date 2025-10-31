# 💳 Stripe Payment Integration Setup

## ✅ What's Been Implemented

1. **Stripe Service Module** (`backend/stripe_service.py`)
   - PaymentIntent creation
   - Payment confirmation
   - Customer management
   - Payment method attachment

2. **Backend Endpoints** (`backend/main.py`)
   - `/api/payments/create-intent` - Create Stripe PaymentIntent
   - `/api/payments/confirm` - Confirm payment
   - `/api/webhooks/stripe` - Handle Stripe webhooks
   - Updated `/api/transactions/create` to process payments via Stripe

3. **Transaction Processing**
   - Automatically creates Stripe PaymentIntent when transaction is created
   - Updates transaction status based on payment result
   - Stores Stripe transaction IDs

---

## 🔧 Configuration Steps

### Step 1: Get Stripe API Keys

1. **Go to**: https://dashboard.stripe.com/test/apikeys
2. **Copy**:
   - **Publishable Key**: `pk_test_...` (for frontend)
   - **Secret Key**: `sk_test_...` (for backend)
   - **Webhook Secret**: See Step 4 below

### Step 2: Set Backend Environment Variables (Fly.io)

```bash
export PATH="$HOME/.fly/bin:$PATH"

# Set Stripe secret key
flyctl secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY -a protega-api

# Set Stripe publishable key (optional, for reference)
flyctl secrets set STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY -a protega-api
```

**For Production** (when ready):
- Replace `sk_test_` with `sk_live_`
- Replace `pk_test_` with `pk_live_`

### Step 3: Set Frontend Environment Variables (Vercel)

1. **Go to**: https://vercel.com/protegos-projects/frontend/settings/environment-variables
2. **Add**:
   - **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Value**: `pk_test_YOUR_KEY` (from Step 1)
   - **Environment**: Production, Preview, Development
3. **Save** and **Redeploy**

### Step 4: Set Up Stripe Webhooks

1. **Go to**: https://dashboard.stripe.com/test/webhooks
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://protega-api.fly.dev/api/webhooks/stripe`
4. **Events to listen to**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. **Copy** the **Signing secret** (starts with `whsec_`)
6. **Set in Fly.io**:
   ```bash
   flyctl secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET -a protega-api
   ```

### Step 5: Restart Backend

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl machine restart 865d32beed7578 -a protega-api
flyctl machine restart 287e750b0d22e8 -a protega-api
```

---

## 🧪 Testing with Stripe Test Cards

### Success Cards
- **Card**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Decline Cards
- **Card**: `4000 0000 0000 0002` (Card declined)
- **Card**: `4000 0000 0000 9995` (Insufficient funds)

**More test cards**: https://stripe.com/docs/testing

---

## 📋 Payment Flow

### 1. Transaction Creation
```
Customer Terminal → Backend
- Creates transaction record
- Creates Stripe PaymentIntent
- Returns transaction_id
```

### 2. Payment Processing
```
Frontend → Stripe.js
- Uses client_secret from PaymentIntent
- Collects payment method
- Confirms payment
```

### 3. Webhook Processing
```
Stripe → Backend Webhook
- payment_intent.succeeded → Transaction "completed"
- payment_intent.payment_failed → Transaction "failed"
```

---

## 🔍 Verification

### Check Stripe Dashboard
1. **Payments**: https://dashboard.stripe.com/test/payments
   - Should see PaymentIntents when transactions created
   
2. **Events**: https://dashboard.stripe.com/test/events
   - Should see webhook events when payments process

### Check Backend Logs
```bash
flyctl logs -a protega-api
```
Look for:
- "PaymentIntent created"
- "Payment succeeded"
- "Webhook received"

---

## ⚠️ Important Notes

1. **Test Mode**: Currently using test keys (`sk_test_`, `pk_test_`)
   - No real money is charged
   - Use test cards only

2. **Production**: Before going live:
   - Switch to live keys (`sk_live_`, `pk_live_`)
   - Update webhook endpoint
   - Test thoroughly

3. **Security**:
   - Never expose `STRIPE_SECRET_KEY` in frontend
   - Always validate webhook signatures
   - Use HTTPS (automatic on Fly.io/Vercel)

---

## 🚀 Next Steps

1. ✅ Set Stripe keys in Fly.io
2. ✅ Set publishable key in Vercel
3. ✅ Set up webhook endpoint in Stripe
4. ✅ Test with test card
5. ⏳ Update frontend to use Stripe.js (if needed)

**Everything is ready! Just add your Stripe keys!** 💳

