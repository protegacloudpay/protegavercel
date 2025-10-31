# Protega CloudPay™ - Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- Git installed

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

**Demo Credentials:**
- Any email / any password (creates account automatically)

### Backend Setup (Optional)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
uvicorn main:app --reload
```

Backend API will be at http://localhost:8000

API documentation: http://localhost:8000/docs

## 📁 What's Included

### Frontend Pages
- ✅ Landing page with features and pricing
- ✅ Login / Signup pages
- ✅ Dashboard Overview
- ✅ Transactions page with sorting/filtering
- ✅ Customer management
- ✅ Fingerprint enrollment UI
- ✅ API Keys generation
- ✅ Settings & Subscription
- ✅ Developer API documentation
- ✅ Legal pages (Privacy, Terms, BIPA)

### Backend API Endpoints
- ✅ `/api/token` - Authentication
- ✅ `/api/enroll` - Enroll customer
- ✅ `/api/pay` - Process payment
- ✅ `/api/verify` - Verify fingerprint
- ✅ `/api/transactions` - Get transactions
- ✅ `/api/merchant/:id` - Merchant stats
- ✅ `/api/keygen` - Generate API key

## 🎨 Key Features

- **Fully responsive** design (mobile, tablet, desktop)
- **Fintech-style UI** with clean aesthetics
- **Mock data** for immediate testing
- **JWT authentication** ready
- **PostgreSQL** or SQLite support
- **Ready for SDK integration** (placeholder UI)
- **Compliance-ready** (BIPA, GDPR)

## 🔗 Navigation Flow

1. **Landing Page** → Learn about the product
2. **Sign Up** → Create merchant account
3. **Dashboard** → View analytics and manage payments
4. **Enroll Customers** → Add fingerprint data
5. **Process Transactions** → See payment history
6. **API Keys** → Get integration credentials

## 📊 Database

By default, uses SQLite for simplicity. To use PostgreSQL:

1. Install PostgreSQL
2. Update `backend/.env` with your database URL
3. Tables are created automatically

## 🎯 Demo Workflow

1. Visit http://localhost:3000
2. Click "Sign Up" or "Login"
3. Enter any credentials
4. Explore the dashboard
5. Navigate through:
   - Overview (stats and recent transactions)
   - Transactions (sortable table)
   - Customers (enrolled users)
   - Fingerprints (enrollment UI)
   - API Keys (generate test keys)
   - Settings (manage subscription)

## 🔧 Customization

- **Brand colors**: Edit `frontend/app/globals.css`
- **Content**: Update text in each page component
- **Database**: Modify models in `backend/main.py`
- **API**: Add endpoints in `backend/main.py`

## 🚢 Deployment

### Frontend to Vercel

```bash
cd frontend
vercel
```

### Backend to Fly.io

```bash
cd backend
fly init
fly deploy
```

## 📞 Support

For issues or questions:
- Email: support@protega.cloud
- Founders: Dr. Melanio J. Rodriguez & Cristhian Rodriguez

---

**Built for Protega CloudPay™ in Miami, Florida**


