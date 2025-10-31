"""Stripe adapter implementing the POS integration contract."""

from __future__ import annotations

import os
from typing import Dict

from ..base import POSAdapter, POSAdapterError, POSPaymentRequest, POSPaymentResult
from ...stripe_service import (
    confirm_payment_intent,
    create_or_retrieve_customer,
    create_payment_intent,
)


class StripePOSAdapter(POSAdapter):
    name = "stripe"

    def __init__(self, config: Dict[str, str] | None = None) -> None:
        super().__init__(config)

    def validate_configuration(self) -> None:
        secret = os.getenv("STRIPE_SECRET_KEY")
        if not secret:
            raise POSAdapterError("STRIPE_SECRET_KEY not configured. Set the key before processing payments.")

    def prepare_payload(self, request: POSPaymentRequest) -> Dict[str, object]:
        metadata = {**request.metadata}
        if request.customer_reference:
            metadata.setdefault("protega_customer_id", request.customer_reference)
        if request.merchant_reference:
            metadata.setdefault("protega_merchant_id", request.merchant_reference)
        if request.fingerprint_hash:
            metadata.setdefault("fingerprint_hash", request.fingerprint_hash[:16])

        return {
            "amount": request.total,
            "currency": request.currency,
            "customer_email": request.customer_email,
            "customer_name": request.customer_name,
            "payment_method_id": request.payment_method_token,
            "metadata": metadata,
        }

    def send_payment(self, payload: Dict[str, object]) -> Dict[str, object]:
        try:
            customer_id = create_or_retrieve_customer(
                email=payload.get("customer_email") or "anonymous@protega.cloud",
                name=payload.get("customer_name"),
            )
        except ValueError as exc:  # pragma: no cover - direct Stripe errors
            raise POSAdapterError(str(exc)) from exc

        metadata = dict(payload.get("metadata", {}))
        metadata.setdefault("stripe_customer_id", customer_id)

        try:
            payment_intent = create_payment_intent(
                amount=payload["amount"],
                currency=payload.get("currency", "usd"),
                customer_email=payload.get("customer_email"),
                payment_method_id=payload.get("payment_method_id"),
                metadata=metadata,
            )
        except ValueError as exc:  # pragma: no cover
            raise POSAdapterError(str(exc)) from exc

        payment_method_id = payload.get("payment_method_id")
        if payment_method_id:
            try:
                confirmation = confirm_payment_intent(
                    payment_intent_id=payment_intent["id"],
                    payment_method_id=payment_method_id,
                )
                payment_intent["status"] = confirmation.get("status", payment_intent["status"])
            except ValueError as exc:  # pragma: no cover
                raise POSAdapterError(str(exc)) from exc

        payment_intent["stripe_customer_id"] = customer_id
        return payment_intent

    def parse_response(self, response: Dict[str, object]) -> POSPaymentResult:
        return POSPaymentResult(
            status=str(response.get("status", "processing")),
            transaction_reference=str(response.get("id")) if response.get("id") else None,
            client_secret=response.get("client_secret"),
            raw_response=response,
        )


