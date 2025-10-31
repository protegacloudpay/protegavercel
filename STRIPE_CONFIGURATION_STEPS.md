# 🔧 Stripe Configuration - Step by Step

## ✅ Code is Deployed!

The Stripe integration code is live. Now you just need to add your Stripe keys.

---

## 📋 Configuration Checklist

### ✅ Step 1: Get Stripe API Keys

1. **Sign in** to Stripe: https://dashboard.stripe.com/login
2. **Go to**: https://dashboard.stripe.com/test/apikeys
3. **Copy these**:
   - **Publishable key**: `pk_test_51...`
   - **Secret key**: `sk_test_51...` (click "Reveal test key")

**⚠️ Important**: Make sure you're in **Test mode** (toggle in top right)

---

### ✅ Step 2: Add Secret Key to Backend (Fly.io)

```bash
export PATH="$HOME/.fly/bin:$PATH"

# Replace sk_test_... with your actual key
flyctl secrets set STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY -a protega-api
```

**Verify**:
```bash
flyctl secrets list -a protega-api | grep STRIPE
```

---

### ✅ Step 3: Set Up Stripe Webhook

1. **Go to**: https://dashboard.stripe.com/test/webhooks
2. **Click**: "Add endpoint" or "Add webhook endpoint"
3. **Endpoint URL**: 
   ```
   https://protega-api.fly.dev/api/webhooks/stripe
   ```
4. **Description**: "Protega CloudPay Payment Webhooks"
5. **Select events to listen to**:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
6. **Click**: "Add endpoint"
7. **Copy** the **Signing secret** (starts with `whsec_`)
8. **Add to Fly.io**:
   ```bash
   flyctl secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET -a protega-api
   ```

---

### ✅ Step 4: Add Publishable Key to Frontend (Vercel)

1. **Go to**: https://vercel.com/protegos-projects/frontend/settings/environment-variables
2. **Click**: "Add New"
3. **Enter**:
   - **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Value**: `pk_test_YOUR_ACTUAL_KEY` (your publishable key)
   - **Environment**: Select all (Production, Preview, Development)
4. **Click**: "Save"
5. **Redeploy**:
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

---

### ✅ Step 5: Restart Backend

```bash
export PATH="$HOME/.fly/bin:$PATH"
flyctl machine restart 865d32beed7578 -a protega-api
flyctl machine restart 287e750b0d22e8 -a protega-api
```

---

## 🧪 Test Your Integration

### Test Card (Success)
- **Card**: `4242 4242 4242 4242`
- **Expiry**: `12/34` (any future date)
- **CVC**: `123` (any 3 digits)
- **ZIP**: `12345` (any 5 digits)

### Test Card (Decline)
- **Card**: `4000 0000 0000 0002`
- **Expiry**: `12/34`
- **CVC**: `123`
- **ZIP**: `12345`

---

## ✅ Verify Everything Works

### 1. Check Stripe Dashboard
- **Payments**: https://dashboard.stripe.com/test/payments
  - Should show PaymentIntents when transactions created

- **Events**: https://dashboard.stripe.com/test/events
  - Should show webhook events

### 2. Check Backend Logs
```bash
flyctl logs -a protega-api
```
Look for:
- No errors about missing Stripe keys
- PaymentIntent creation logs

### 3. Test a Transaction
1. Create a transaction through your app
2. Complete payment with test card
3. Check transaction status in database
4. Verify payment appears in Stripe dashboard

---

## 📚 Documentation

- **Full Setup Guide**: `STRIPE_SETUP.md`
- **Quick Start**: `STRIPE_QUICK_START.md`
- **Stripe Testing**: https://stripe.com/docs/testing

---

## 🎯 Summary

You need to:
1. ✅ Get Stripe keys from dashboard
2. ✅ Set `STRIPE_SECRET_KEY` in Fly.io
3. ✅ Set `STRIPE_WEBHOOK_SECRET` in Fly.io
4. ✅ Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel
5. ✅ Restart backend
6. ✅ Test with test card

**Everything else is already configured!** 🚀



