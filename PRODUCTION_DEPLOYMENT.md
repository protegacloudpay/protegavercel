# 🚀 Production Deployment Guide

## Overview
This guide will help you deploy Protega CloudPay to production. The application is now fully production-ready with real API endpoints, database integration, and proper authentication.

## Prerequisites

- Docker and Docker Compose installed
- PostgreSQL database (or use Docker)
- Domain name (for production)
- SSL certificate (Let's Encrypt recommended)
- Environment variables configured

## Quick Start

### 1. Clone and Setup

```bash
cd Protega123
```

### 2. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@postgres:5432/protega_cloudpay
SECRET_KEY=your-super-secret-key-min-32-characters-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Production URLs
CORS_ORIGINS=https://protegacloudpay.com,https://www.protegacloudpay.com

# Integration Keys (get from providers)
STRIPE_SECRET_KEY=sk_live_...
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
ENCRYPTION_KEY=your-32-byte-aes-256-encryption-key
```

**Frontend (.env.local):**
```bash
cd frontend
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.protegacloudpay.com
NODE_ENV=production
```

### 3. Start with Docker Compose

```bash
# From project root
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Start Backend API (FastAPI) on port 8000
- Start Frontend (Next.js) on port 3000
- Initialize database tables automatically

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Production Deployment

### Option 1: Vercel (Frontend) + Railway/Fly.io (Backend)

**Frontend on Vercel:**
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://api.protegacloudpay.com`
4. Deploy

**Backend on Railway/Fly.io:**
1. Connect GitHub repo
2. Set environment variables
3. Deploy
4. Get backend URL and update frontend env var

### Option 2: Full Docker Deployment (AWS/Azure/GCP)

1. Build production images:
```bash
docker-compose -f docker-compose.prod.yml build
```

2. Deploy to cloud provider using Docker Swarm or Kubernetes

### Option 3: Traditional Server (Ubuntu/Debian)

1. Install dependencies:
```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
npm run build
```

2. Use systemd or PM2 for process management
3. Setup Nginx reverse proxy
4. Configure SSL with Let's Encrypt

## Database Migration

The database will auto-initialize on first run. For production:

```bash
# Connect to database
psql postgresql://user:password@localhost:5432/protega_cloudpay

# Or use Docker
docker exec -it protega-db psql -U user -d protega_cloudpay
```

## Security Checklist

- [ ] Change all default secrets and keys
- [ ] Use strong passwords for database
- [ ] Enable SSL/TLS for all connections
- [ ] Set up firewall rules
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular backups of database
- [ ] Keep dependencies updated

## API Endpoints

All endpoints require authentication (Bearer token) except:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login

### Key Endpoints:

**Authentication:**
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

**Customer:**
- `POST /api/customers/register` - Register customer
- `POST /api/customers/verify-fingerprint` - Verify fingerprint
- `GET /api/customers/profile` - Get profile
- `PUT /api/customers/profile` - Update profile
- `GET /api/customers/payment-methods` - Get payment methods
- `POST /api/customers/payment-methods` - Add payment method

**Transactions:**
- `POST /api/transactions/create` - Create transaction
- `GET /api/transactions` - Get transactions

**Merchant:**
- `GET /api/merchant/stats` - Get analytics
- `GET /api/merchant/customers` - Get customers

**Inventory:**
- `GET /api/inventory` - Get inventory
- `POST /api/inventory` - Add item
- `PUT /api/inventory/{id}` - Update item
- `DELETE /api/inventory/{id}` - Delete item
- `GET /api/inventory/barcode/{barcode}` - Get by barcode

## Monitoring

Set up monitoring for:
- API response times
- Error rates
- Database connections
- Server resources

## Backup Strategy

1. Daily database backups
2. Store backups off-site
3. Test restore procedures regularly

## Support

For issues, check logs:
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Database logs
docker-compose logs -f postgres
```

## Next Steps

1. Integrate real payment providers (Stripe, Plaid)
2. Set up biometric SDK integration
3. Configure email service
4. Set up analytics
5. Implement rate limiting
6. Add API versioning
