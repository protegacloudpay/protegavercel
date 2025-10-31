# 🔒 Secure Enclave Setup Guide

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Generate Master Key

```bash
# Generate secure 64-character hex key
openssl rand -hex 64

# Add to backend/.env
echo "PROTEGA_MASTER_KEY=$(openssl rand -hex 64)" >> backend/.env
```

### 3. Verify Setup

```bash
cd backend
python3 -c "from security_enclave import hash_fingerprint; print('✅ Secure Enclave ready')"
```

If you see an error about missing `cryptography`, install it:
```bash
pip install cryptography
```

---

## Production Deployment

### Fly.io

```bash
fly secrets set PROTEGA_MASTER_KEY=$(openssl rand -hex 64)
```

### AWS/KMS

```bash
aws secretsmanager create-secret \
  --name protega-master-key \
  --secret-string $(openssl rand -hex 64)
```

### Docker

```bash
# Add to docker-compose.yml environment
PROTEGA_MASTER_KEY: ${PROTEGA_MASTER_KEY}
```

---

## Security Checklist

- [ ] Master key is 64+ characters
- [ ] Master key stored in environment/secrets (not code)
- [ ] Different keys per environment (dev/staging/prod)
- [ ] Key rotation plan in place
- [ ] Never commit keys to git

---

## Test the Enclave

```python
from security_enclave import encrypt_sensitive, decrypt_sensitive, hash_fingerprint

# Test encryption
salt, encrypted = encrypt_sensitive("test_fingerprint_data")
print(f"Encrypted: {encrypted[:50]}...")

# Test decryption
decrypted = decrypt_sensitive(salt, encrypted)
print(f"Decrypted: {decrypted}")

# Test hashing
hash1 = hash_fingerprint("test_data")
hash2 = hash_fingerprint("test_data")
print(f"Hashes match: {hash1 == hash2}")
```

---

See `SECURE_ENCLAVE_COMPLETE.md` for full documentation.


