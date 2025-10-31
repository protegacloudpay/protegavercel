# Protega CloudPay Backend

FastAPI backend for the Protega CloudPay biometric payment platform.

## Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Copy environment variables:
```bash
cp env.example .env
```

4. Edit `.env` with your configuration

## Running

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

API documentation: http://localhost:8000/docs

## Endpoints

- `POST /api/token` - Authentication
- `POST /api/enroll` - Enroll customer fingerprint
- `POST /api/pay` - Process payment
- `POST /api/verify` - Verify fingerprint
- `GET /api/transactions` - Get transaction history
- `GET /api/merchant/{id}` - Get merchant stats
- `POST /api/keygen` - Generate API key

## Database

By default, uses SQLite for development. For production, configure PostgreSQL in `.env`.

## Integration

Ready for integration with:
- Stripe (payment processing)
- Plaid (bank account linking)
- AWS Lambda (biometric verification)
- Custom biometric SDKs




