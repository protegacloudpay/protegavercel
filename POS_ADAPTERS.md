# Protega POS Adapter Architecture

This guide explains how the new middleware layer enables Protega CloudPay to
integrate with multiple POS providers using lightweight adapter modules.

## Overview

- `backend/pos/base.py` defines shared contracts (`POSPaymentRequest`,
  `POSPaymentResult`, `POSAdapter`).
- `backend/pos/middleware.py` registers adapters and dispatches payment requests.
- Adapters live in `backend/pos/adapters/` and implement provider-specific logic.

The FastAPI transaction endpoint now converts each payment into a normalized
`POSPaymentRequest` and calls `pos_middleware.process_payment(...)`. The
middleware selects the requested provider, executes it, and returns a unified
`POSPaymentResult` that the API converts into a `TransactionResponse`.

## Adding a New Adapter

1. **Create an adapter file** under `backend/pos/adapters/`, e.g.
   `acme_adapter.py`.
2. **Subclass `POSAdapter`** and implement:
   - `prepare_payload` – map the normalized request to the provider’s REST body
   - `send_payment` – call the provider API and return raw JSON
   - `parse_response` – convert the provider response into `POSPaymentResult`
3. **Expose the adapter** in `backend/pos/adapters/__init__.py` (optional but
   recommended).
4. **Register the adapter** inside `backend/pos/middleware.py` (or dynamically
   on startup) with `pos_middleware.register_adapter(NewAdapter())`.
5. **Configure credentials** via environment variables. Perform validation in
   `validate_configuration` and raise/flag errors early.

## Example Skeleton

```
from pos.base import POSAdapter, POSPaymentRequest, POSPaymentResult, POSAdapterError


class AcmePOSAdapter(POSAdapter):
    name = "acme"

    def validate_configuration(self) -> None:
        self.api_key = os.getenv("ACME_API_KEY")
        if not self.api_key:
            raise POSAdapterError("ACME_API_KEY not set")

    def prepare_payload(self, request: POSPaymentRequest) -> dict:
        return {
            "amount": int(request.total * 100),
            "currency": request.currency.upper(),
            "items": [item.to_payload() for item in request.items],
            "metadata": request.metadata,
        }

    def send_payment(self, payload: dict) -> dict:
        response = requests.post("https://api.acmepos.com/payments", json=payload)
        if response.status_code >= 400:
            raise POSAdapterError(f"Acme error: {response.text}")
        return response.json()

    def parse_response(self, response: dict) -> POSPaymentResult:
        return POSPaymentResult(
            status=response.get("status"),
            transaction_reference=response.get("payment_id"),
            raw_response=response,
        )
```

With the adapter registered, merchants (or the middleware) can request it by
setting `pos_provider` on the transaction payload.

## Runtime Selection

- API clients can specify `pos_provider` in `/api/transactions/create`.
- If omitted, Protega defaults to `stripe` (see `DEFAULT_POS_PROVIDER`).
- The middleware throws `POSAdapterError` when a provider is missing or
  misconfigured, and the FastAPI endpoint returns an HTTP 402 error.

## Built-in Adapters

- `StripePOSAdapter` – wraps existing Stripe PaymentIntent logic and falls back
  to simulation mode if keys are absent (useful for local development).
- `SquarePOSAdapter` – template implementation showing how to integrate Square’s
  Payments API. It requires `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID` to
  run live requests; otherwise it raises a configuration error when invoked.

## Testing Tips

- Call `curl -X POST /api/transactions/create ... -d '{"pos_provider": "stripe"}'`
  to exercise the Stripe adapter.
- Use environment variables or merchant settings to control default providers.
- Capture `client_secret` from the response if the provider requires frontend
  confirmation (e.g., Stripe).


