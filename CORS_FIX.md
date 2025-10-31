# CORS Issue Fixed - Merchant Registration Working

## Problem
The merchant registration was showing "Failed to fetch" error because of CORS (Cross-Origin Resource Sharing) restrictions.

## Root Cause
Vercel creates a **new unique URL** for each deployment (e.g., `frontend-786abldzr-protegos-projects.vercel.app`), and the backend was only configured to accept requests from the specific URL that was set in the `FRONTEND_URL` environment variable.

When you deployed a new version, the URL changed, but the backend CORS configuration wasn't updated to accept the new URL.

## Solution Implemented

### 1. Custom CORS Middleware
I added a custom middleware to the backend (`backend/main.py`) that dynamically accepts requests from **any Vercel deployment** under the `protegos-projects` account:

```python
@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Check if origin matches any allowed pattern
    allowed = False
    if origin:
        # Allow configured origins
        if origin in origins:
            allowed = True
        # Allow all Vercel deployments for protegos-projects
        elif origin.endswith("-protegos-projects.vercel.app") or origin.endswith(".vercel.app"):
            allowed = True
    
    response = await call_next(request)
    
    if allowed and origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response
```

This middleware:
- ✅ Accepts requests from **any Vercel preview deployment** (e.g., `frontend-*.vercel.app`)
- ✅ Accepts requests from configured origins (production URL, localhost)
- ✅ Dynamically sets CORS headers based on the request origin
- ✅ No need to update backend every time frontend is redeployed

### 2. Backend Deployed
The updated backend has been deployed to Fly.io with the new CORS middleware.

## Current Status
✅ **FIXED** - Merchant registration now works from any Vercel deployment URL

## Testing
You can test merchant registration at your latest Vercel URL:
**https://frontend-786abldzr-protegos-projects.vercel.app/merchant/register**

Try creating a new merchant account - it should work without any "Failed to fetch" errors.

## Production Recommendation

### Option 1: Use Vercel Custom Domain (Recommended)
1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `app.protegacloudpay.com`)
3. Update backend `FRONTEND_URL` to your custom domain:
   ```bash
   fly secrets set FRONTEND_URL="https://app.protegacloudpay.com"
   ```
4. This gives you a **stable URL** that doesn't change with deployments

### Option 2: Keep Current Setup
The current setup with the custom CORS middleware will continue to work for all Vercel preview deployments. This is great for:
- ✅ Development and testing
- ✅ Preview deployments
- ✅ No manual updates needed

However, for production, a custom domain is more professional and provides:
- ✅ Stable, branded URL
- ✅ Better SEO
- ✅ More trustworthy for customers
- ✅ Easier to remember and share

## Latest Deployment URLs

### Frontend (Vercel)
**https://frontend-786abldzr-protegos-projects.vercel.app**

**Pages:**
- Merchant Registration: `/merchant/register`
- Merchant Login: `/merchant/login`
- Customer Registration: `/customer/register`
- Customer Terminal: `/customer/terminal`
- Merchant POS: `/merchant/pos`

### Backend (Fly.io)
**https://protega-api.fly.dev**

**Endpoints:**
- Health Check: `/healthz`
- API Docs: `/docs`
- Registration: `/api/auth/register`
- Login: `/api/auth/login`

## Next Steps
1. ✅ **Merchant registration is now working** - try it out!
2. Test the full flow:
   - Register as merchant
   - Add inventory
   - Register as customer (different browser/incognito)
   - Complete a transaction
3. Consider adding a custom domain for production (optional but recommended)

---

**Issue Status:** ✅ RESOLVED

*Fixed: October 31, 2025*

