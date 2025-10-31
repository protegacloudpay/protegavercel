# 🗄️ Neon Database Setup for Fly.io

## Current Issue

The `DATABASE_URL` secret in Fly.io is pointing to a Neon database with invalid credentials:
```
ERROR: password authentication failed for user 'neondb_owner'
```

---

## How to Fix

### Step 1: Get Your Neon Connection String

1. **Go to Neon Dashboard**: https://console.neon.tech
2. **Select your project** (or create a new one)
3. **Go to**: Connection Details / Connection String
4. **Copy the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Update Fly.io Secret

Once you have the connection string, I'll update it for you. The format should be:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Important**: Make sure the connection string:
- ✅ Has the correct password
- ✅ Includes `?sslmode=require` for SSL
- ✅ Points to the correct database name

---

### Step 3: I'll Update It

Once you provide the connection string, I'll run:

```bash
flyctl secrets set DATABASE_URL="your-neon-connection-string" -a protega-api
flyctl restart -a protega-api
```

---

## Quick Options

**Option A**: Share your Neon connection string here, and I'll update it immediately.

**Option B**: I can guide you through creating a new Neon database if needed.

**Option C**: If you already have the connection string, just paste it and I'll set it up.

---

## Neon Connection String Format

```
postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

Example:
```
postgresql://neondb_owner:your-password@ep-twilight-frost-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```



