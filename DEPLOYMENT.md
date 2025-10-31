# Deployment Guide - Protega CloudPay™

## 🚀 Production Deployment Checklist

### Frontend Deployment (Vercel)

#### Prerequisites
- Vercel account
- GitHub repository connected

#### Steps

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Navigate to frontend:**
```bash
cd frontend
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Environment Variables:**
   - Add to Vercel dashboard → Settings → Environment Variables:
     - `NEXT_PUBLIC_API_URL` (optional, if connecting to backend)

5. **Custom Domain:**
   - Add domain in Vercel dashboard
   - Update DNS records as instructed

---

### Backend Deployment (Fly.io)

#### Prerequisites
- Fly.io account
- Docker installed

#### Steps

1. **Install Fly CLI:**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Navigate to backend:**
```bash
cd backend
```

3. **Initialize Fly:**
```bash
fly launch
```

4. **Create Database:**
```bash
fly postgres create
fly postgres attach --app <app-name>
```

5. **Set Environment Variables:**
```bash
fly secrets set SECRET_KEY=your-production-secret-key
fly secrets set ALGORITHM=HS256
fly secrets set ACCESS_TOKEN_EXPIRE_MINUTES=30
```

6. **Deploy:**
```bash
fly deploy
```

---

### Backend Deployment (AWS ECS/Fargate)

#### Steps

1. **Create ECR Repository:**
```bash
aws ecr create-repository --repository-name protega-cloudpay-backend
```

2. **Build and Push Docker Image:**
```bash
docker build -t protega-backend .
docker tag protega-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/protega-cloudpay-backend:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/protega-cloudpay-backend:latest
```

3. **Create Fargate Task Definition**
4. **Create ECS Cluster**
5. **Create Load Balancer**
6. **Configure Auto-scaling**

---

### Database Setup (PostgreSQL)

#### Using AWS RDS

1. **Create RDS PostgreSQL Instance**
   - Engine: PostgreSQL 15.x
   - Instance class: db.t3.medium (for MVP)
   - Storage: 100GB GP2
   - Multi-AZ: Enabled (for production)

2. **Configure Security Groups**
   - Allow inbound from backend servers
   - Port: 5432

3. **Create Database:**
```sql
CREATE DATABASE protega_cloudpay;
```

4. **Migrate Tables:**
   - Tables are auto-created by SQLAlchemy on first run

---

### SSL/TLS Certificates

#### Using Let's Encrypt (Frontend)

1. **Vercel automatically provides SSL**
2. **Add custom domain**
3. **Certificate auto-generated**

#### Using AWS Certificate Manager (Backend)

1. **Request certificate in ACM**
2. **Validate domain**
3. **Attach to Load Balancer**

---

### CDN Setup (Cloudflare)

1. **Add site to Cloudflare**
2. **Update nameservers**
3. **Enable SSL/TLS → Full (strict)**
4. **Enable Auto Minify**
5. **Enable Brotli compression**
6. **Set up caching rules**

---

### Monitoring & Logging

#### Application Monitoring

**Frontend:**
- Vercel Analytics (built-in)
- Sentry for error tracking:
```bash
npm install @sentry/nextjs
```

**Backend:**
- AWS CloudWatch
- Datadog
- New Relic

#### Log Aggregation

**Backend:**
```python
# Add to requirements.txt
structlog==23.1.0
```

```python
# Configure logging
import logging
logging.basicConfig(level=logging.INFO)
```

---

### Environment Variables

#### Frontend (.env.production)

```env
NEXT_PUBLIC_API_URL=https://api.protega.cloud
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_PLAID_ENV=production
```

#### Backend (Fly.io Secrets)

```bash
DATABASE_URL=postgresql://...
SECRET_KEY=<generate-strong-secret>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
STRIPE_SECRET_KEY=sk_live_...
PLAID_CLIENT_ID=...
PLAID_SECRET=...
AWS_LAMBDA_FUNCTION_URL=...
ENCRYPTION_KEY=<32-byte-key>
```

---

### Security Hardening

#### Backend

1. **Rate Limiting:**
```bash
pip install slowapi
```

2. **CORS Configuration:**
```python
allow_origins=["https://protega.cloud"]
```

3. **Enable Helmet.js (Frontend):**
```bash
npm install next-secure-headers
```

4. **Input Validation:**
   - Already using Pydantic models

5. **SQL Injection Prevention:**
   - Using SQLAlchemy ORM

6. **XSS Prevention:**
   - Next.js automatic escaping

---

### Database Backups

#### Automated Backups

**AWS RDS:**
- Enable automated backups
- Retention: 30 days
- Backup window: 03:00-04:00 UTC

**Manual Export:**
```bash
pg_dump protega_cloudpay > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
psql protega_cloudpay < backup_20250115.sql
```

---

### Performance Optimization

#### Frontend

1. **Image Optimization:**
   - Use Next.js Image component
   - Enable WebP format

2. **Code Splitting:**
   - Next.js automatic
   - Lazy load routes

3. **Caching:**
   - Static page generation where possible
   - ISR for dynamic content

#### Backend

1. **Database Indexing:**
```python
# Add indexes in models
email = Column(String, unique=True, index=True)
```

2. **Connection Pooling:**
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=40
)
```

3. **Redis Caching:**
```bash
pip install redis
```

---

### CI/CD Pipeline

#### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Fly.io
        run: fly deploy --remote-only
```

---

### Disaster Recovery

#### Backup Strategy

1. **Database:** Daily automated backups
2. **Code:** Version control (Git)
3. **Media:** AWS S3 with versioning

#### Recovery Plan

1. **Identify failure point**
2. **Restore from latest backup**
3. **Re-sync data if needed**
4. **Verify system health**
5. **Update DNS if needed**

---

### Cost Estimation

#### AWS (Backend + Database)

**RDS (PostgreSQL):**
- db.t3.medium: ~$60/month
- Storage: ~$10/month
- Backups: ~$5/month

**EC2/Fargate:**
- t3.small: ~$15/month
- Load Balancer: ~$25/month

**CloudWatch:**
- Logs: ~$10/month

**Total Backend:** ~$125/month

#### Vercel (Frontend)

**Pro Plan:**
- $20/month per user
- 100GB bandwidth included
- Unlimited requests

#### Total MVP Cost: ~$150-200/month

---

### Post-Deployment Checklist

- [ ] Verify SSL certificates active
- [ ] Test all API endpoints
- [ ] Check database connections
- [ ] Monitor error logs
- [ ] Set up alerts
- [ ] Update DNS records
- [ ] Configure backups
- [ ] Load testing complete
- [ ] Security scan passed
- [ ] Documentation updated

---

## 🆘 Troubleshooting

### Common Issues

**502 Bad Gateway:**
- Check backend is running
- Verify health check endpoint
- Check load balancer configuration

**Database Connection Errors:**
- Verify security groups
- Check database credentials
- Ensure database is accessible

**CORS Errors:**
- Update allowed origins
- Check preflight requests
- Verify headers configuration

---

**Need Help?** Contact devops@protega.cloud


