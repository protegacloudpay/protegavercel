# Testing Guide - Protega CloudPay

## ✅ Registration & Login Working

Both registration and login APIs are working correctly. Here's how to test properly:

---

## 🧪 Test Merchant Registration

### Step 1: Register a New Merchant

1. Go to: **https://frontend-786abldzr-protegos-projects.vercel.app/merchant/register**

2. Fill out the form:
   ```
   Business Name: Test Business
   Email: test123@example.com
   Phone: 555-1234
   Business Type: Retail
   Address: 123 Main St
   Password: Password123!
   ```

3. Click **"Create Merchant Account"**

4. ✅ You should be redirected to `/merchant/dashboard`

5. ✅ You should see your dashboard (may be empty since no data yet)

**Important:** Remember the email and password you used!

---

## 🔐 Test Merchant Login

### Step 2: Log Out

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Refresh the page

### Step 3: Log In

1. Go to: **https://frontend-786abldzr-protegos-projects.vercel.app/merchant/login**

2. Enter **THE SAME** credentials you used during registration:
   ```
   Email: test123@example.com
   Password: Password123!
   ```

3. Click **"Sign In"**

4. ✅ You should be redirected to `/merchant/dashboard`

---

## ❌ Common Mistakes

### "Could not validate credentials" Error

This happens when:
- ❌ You used a different email than you registered with
- ❌ You used a different password than you registered with
- ❌ You tried to log in to an account that doesn't exist

**Solution:** Use the EXACT email and password you used during registration.

### "Failed to fetch" Error

This was the CORS issue we fixed. If you still see this:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Try again

---

## 🧹 Start Fresh

If you want to start over with a clean slate:

### Option 1: Use a New Email
Just register with a different email address (e.g., `test456@example.com`)

### Option 2: Clear Everything
1. Open DevTools (F12)
2. Console tab
3. Type: `localStorage.clear()`
4. Press Enter
5. Register again with the same or different email

---

## 📝 Full Test Flow

Here's a complete end-to-end test:

### 1. Register as Merchant
- URL: `/merchant/register`
- Credentials: `merchant@test.com` / `Pass123!`
- ✅ Should redirect to dashboard
- ✅ Should be logged in automatically

### 2. Add Inventory
- Navigate to **Inventory** from dashboard
- Add a product:
  ```
  Name: Coffee
  Price: 3.50
  Barcode: 123456
  Category: Beverage
  Stock: 100
  ```
- ✅ Product should appear in inventory list

### 3. Log Out & Log Back In
- DevTools Console: `localStorage.clear()`
- Refresh page
- Go to `/merchant/login`
- Login with: `merchant@test.com` / `Pass123!`
- ✅ Should see dashboard with inventory

### 4. Register as Customer (Different Browser/Incognito)
- Open **Incognito/Private window**
- Go to: `/customer/register`
- Complete registration:
  ```
  Name: John Doe
  Email: customer@test.com
  Password: Pass123!
  ```
- Complete fingerprint enrollment (simulated)
- ✅ Should redirect to customer dashboard

### 5. Add Payment Method
- Go to **Payment Methods**
- Click **Add New Card**
- Enter Stripe test card:
  ```
  Card Number: 4242 4242 4242 4242
  Expiry: 12/30
  CVC: 123
  Name: John Doe
  ```
- ✅ Card should be saved

### 6. Complete a Transaction
- **Merchant window:** Open POS (`/merchant/pos`)
- Copy customer terminal URL
- Add Coffee to cart
- **Customer window:** Open customer terminal
- Verify fingerprint
- Select payment method
- Complete payment
- ✅ Transaction should appear in merchant dashboard

---

## 🐛 Debugging Tips

### Check if Token is Stored
1. Open DevTools (F12)
2. Go to **Application** tab
3. Left sidebar: **Local Storage** → Your domain
4. Look for `auth_token`
5. ✅ Should exist if logged in
6. ❌ Missing if logged out

### Check API Calls
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Look for request to `/api/auth/login`
5. Check:
   - Request payload (should have email + password)
   - Response status (should be 200 for success, 401 for failure)
   - Response body (should have `access_token` for success)

### View Console Errors
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for red errors
4. Common errors:
   - **401 Unauthorized** = Wrong credentials or no token
   - **Failed to fetch** = CORS issue (should be fixed now)
   - **404 Not Found** = Wrong URL or endpoint doesn't exist

---

## 📞 Still Having Issues?

If you're still seeing errors:

1. **Take a screenshot** of:
   - The error message on the page
   - Browser console (F12 → Console tab)
   - Network tab showing the failed request

2. **Tell me**:
   - What credentials you used for registration
   - What credentials you used for login
   - What error message you see

3. I'll fix it immediately! 🚀

---

## ✅ What's Working

- ✅ Backend API (Fly.io)
- ✅ Frontend (Vercel)
- ✅ CORS configuration
- ✅ Registration endpoint
- ✅ Login endpoint
- ✅ Database (Neon PostgreSQL)
- ✅ Authentication (JWT tokens)
- ✅ Password hashing (bcrypt)

**Everything is deployed and working!** Just make sure to use the same credentials for registration and login.

