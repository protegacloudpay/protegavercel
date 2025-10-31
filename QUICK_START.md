# 🚀 Quick Start Guide - Protega CloudPay™

## Access Your Application

The Protega CloudPay MVP has been successfully built! Here's how to access it:

### Method 1: Start Fresh (Recommended)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open your browser to: **http://localhost:3000**

### Method 2: Production Build

```bash
# Navigate to frontend
cd frontend

# Build for production
npm run build

# Start production server
npm start
```

Then open your browser to: **http://localhost:3000**

---

## 📍 What You'll See

### Landing Page
- **Hero Section**: "Pay with nothing but your fingerprint"
- **Features**: How It Works, Why Protega CloudPay
- **Pricing**: 3 tiers (Starter, Professional, Enterprise)
- **Partners**: Stripe, Visa, AWS, Plaid

### Authentication
- Click "Sign Up" or "Login" in the navbar
- Use **any email and password** for demo purposes
- You'll be redirected to the dashboard

### Dashboard
- **Overview**: Analytics cards, recent transactions
- **Transactions**: Sortable/filterable payment history
- **Customers**: Enrolled users management
- **Fingerprints**: Enrollment UI
- **API Keys**: Generate integration keys
- **Settings**: Subscription management

---

## 🔧 Troubleshooting

### Port Already in Use

If port 3000 is busy:

```bash
# Find and kill existing process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Build Errors

If you see build errors:

```bash
cd frontend

# Clean and rebuild
rm -rf .next node_modules/.cache
npm install
npm run build
```

### Tailwind CSS Not Working

The app uses Tailwind CSS v3 with standard configuration. If styles don't load:

```bash
cd frontend

# Reinstall Tailwind
npm install -D tailwindcss@^3 postcss autoprefixer

# Verify tailwind.config.js exists
ls -la tailwind.config.js
```

---

## 📱 All Pages Available

Visit these URLs when your server is running:

- **/** - Landing page
- **/login** - Login page
- **/signup** - Signup page
- **/dashboard** - Dashboard overview
- **/dashboard/transactions** - Transaction management
- **/dashboard/customers** - Customer management
- **/dashboard/fingerprints** - Enrollment UI
- **/dashboard/api-keys** - API key generation
- **/dashboard/settings** - Settings
- **/developers** - API documentation
- **/legal/privacy** - Privacy policy
- **/legal/terms** - Terms of service
- **/legal/bipa** - BIPA compliance

---

## 🎯 Demo Walkthrough

1. **Start the server** (see Method 1 above)
2. **Open browser** to http://localhost:3000
3. **Browse landing page** - Check out features and pricing
4. **Sign up** - Use any email/password
5. **Explore dashboard** - View analytics and data
6. **Navigate sections** - Transactions, Customers, etc.
7. **Try enrollment** - Simulate fingerprint enrollment
8. **Generate API key** - See integration examples

---

## 🔌 Backend (Optional)

To run the full stack:

**Terminal 1 - Frontend:**
```bash
cd frontend && npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment
cp env.example .env

# Run server
uvicorn main:app --reload
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📞 Need Help?

### Common Issues

**Q: Page shows "500 Error"**  
A: Try Method 2 (production build), or check browser console for errors

**Q: Styles not loading**  
A: Ensure Tailwind CSS v3 is installed: `npm install -D tailwindcss@^3`

**Q: Can't find localhost:3000**  
A: Check firewall settings, or use a different port

### Getting Support

- Check **SETUP.md** for detailed instructions
- See **README.md** for project overview
- Review **DEPLOYMENT.md** for production setup

---

## ✅ Success Checklist

When everything is working, you should see:

- [x] Landing page loads with hero section
- [x] Navigation bar visible with logo
- [x] Can click "Sign Up" or "Login"
- [x] Dashboard shows analytics cards
- [x] Sidebar navigation works
- [x] All pages accessible
- [x] No console errors
- [x] Styles render correctly

---

**🎉 You're all set! Enjoy your Protega CloudPay MVP!**

*For more details, see PROJECT_SUMMARY.md*




