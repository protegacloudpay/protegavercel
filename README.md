# Protega CloudPay™ MVP

**Pay with nothing but your fingerprint.**

A fully functional SaaS platform for biometric payment infrastructure, built with Next.js, TypeScript, and FastAPI.

## 🚀 Quick Start

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at http://localhost:3000

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
uvicorn main:app --reload
```

Backend API will be available at http://localhost:8000

API documentation: http://localhost:8000/docs

## 📁 Project Structure

```
Protega123/
├── frontend/              # Next.js + TypeScript + Tailwind
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── lib/              # Utilities
├── backend/              # FastAPI + PostgreSQL
│   ├── main.py          # API endpoints
│   └── requirements.txt # Python dependencies
└── README.md
```

## ✨ Features

### Frontend
- ✅ Landing page with hero, features, pricing
- ✅ Authentication (Login/Signup)
- ✅ Merchant Dashboard with analytics
- ✅ Transaction management with sorting/filtering
- ✅ Customer management
- ✅ Fingerprint enrollment UI (SDK placeholder)
- ✅ API Keys generation and documentation
- ✅ Settings & subscription management
- ✅ Responsive design (mobile-first)
- ✅ Clean fintech UI with Protega branding

### Backend
- ✅ RESTful API with FastAPI
- ✅ JWT authentication
- ✅ PostgreSQL/SQLite database
- ✅ Mock payment processing
- ✅ API endpoints for:
  - Customer enrollment
  - Payment processing
  - Fingerprint verification
  - Transaction history
  - Merchant analytics
  - API key generation

## 🎨 Branding

- **Primary Color**: #3CB6AD (Teal)
- **Font**: Inter / DM Sans
- **Style**: Clean, minimalist fintech design
- **Slogan**: "Pay with nothing but your fingerprint."

## 🔐 Security Features

- JWT token-based authentication
- Encrypted fingerprint storage (AES-256 placeholder)
- BIPA and GDPR compliance notices
- Secure API key generation
- Rate limiting ready

## 🛠 Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- React 19

**Backend:**
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL / SQLite
- JWT authentication
- Python 3.x

## 📊 Database Schema

- `users` - Merchant/admin accounts
- `customers` - Enrolled customers
- `transactions` - Payment history
- `merchants` - Merchant profiles

## 🔗 Integrations Ready

- **Stripe** - Payment processing
- **Plaid** - Bank account linking
- **AWS Lambda** - Biometric verification
- **Custom SDK** - Fingerprint hardware

## 📝 API Endpoints

```
POST   /api/token              - Authentication
POST   /api/enroll             - Enroll customer
POST   /api/pay                - Process payment
POST   /api/verify             - Verify fingerprint
GET    /api/transactions       - Get transactions
GET    /api/merchant/:id       - Merchant stats
POST   /api/keygen             - Generate API key
```

## 🚢 Deployment

### Frontend
Deploy to Vercel:
```bash
cd frontend
vercel deploy
```

### Backend
Deploy to Fly.io or AWS:
```bash
cd backend
fly deploy  # or aws ecs deploy
```

## 👥 Founders

- Dr. Melanio J. Rodriguez (CEO)
- Cristhian Rodriguez (CEO)

## 📄 License

Copyright © 2025 Protega CloudPay™

## 🎯 Demo Credentials

- Merchant: Any email / any password
- Admin: admin@protega.com / any password

---

**Built with ❤️ in Miami, Florida**




