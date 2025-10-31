"""Template Square POS adapter implementation."""

from __future__ import annotations

import os
from typing import Dict

import requests

from ..base import POSAdapter, POSAdapterError, POSPaymentRequest, POSPaymentResult


class SquarePOSAdapter(POSAdapter):
    """Example adapter demonstrating how to integrate Square."""

    name = "square"

    def __init__(self, config: Dict[str, str] | None = None) -> None:
        default_config = {
            "access_token": os.getenv("SQUARE_ACCESS_TOKEN"),
            "location_id": os.getenv("SQUARE_LOCATION_ID"),
            "api_base": "https://connect.squareupsandbox.com",
        }
        merged = {**default_config, **(config or {})}
        self._configured = False
        super().__init__(merged)

    def validate_configuration(self) -> None:
        access_token = self.config.get("access_token")
        location_id = self.config.get("location_id")
        self._configured = bool(access_token and location_id)
        if not self._configured:
            import logging

            logging.getLogger(__name__).info(
                "Square adapter running in template mode. Set SQUARE_ACCESS_TOKEN and "
                "SQUARE_LOCATION_ID to enable real payments."
            )

    def prepare_payload(self, request: POSPaymentRequest) -> Dict[str, object]:
        line_items = [
            {
                "name": item.name,
                "base_price_money": {
                    "amount": int(item.price * 100),
                    "currency": request.currency.upper(),
                },
                "quantity": str(item.quantity),
            }
            for item in request.items
        ]

        return {
            "idempotency_key": request.metadata.get("transaction_id"),
            "source_id": request.payment_method_token,
            "amount_money": {
                "amount": int(request.total * 100),
                "currency": request.currency.upper(),
            },
            "autocomplete": True,
            "customer_id": request.metadata.get("square_customer_id"),
            "line_items": line_items,
        }

    def send_payment(self, payload: Dict[str, object]) -> Dict[str, object]:
        if not self._configured:
            raise POSAdapterError(
                "Square adapter is not configured. Update environment variables to enable it."
            )

        headers = {
            "Square-Version": "2023-12-13",
            "Authorization": f"Bearer {self.config['access_token']}",
            "Content-Type": "application/json",
        }

        response = requests.post(
            f"{self.config['api_base']}/v2/payments",
            json=payload,
            headers=headers,
            timeout=30,
        )

        if response.status_code >= 400:
            raise POSAdapterError(
                f"Square payment error ({response.status_code}): {response.text}"
            )

        return response.json()

    def parse_response(self, response: Dict[str, object]) -> POSPaymentResult:
        payment = response.get("payment", {})
        return POSPaymentResult(
            status=payment.get("status", "pending"),
            transaction_reference=payment.get("id"),
            client_secret=None,
            raw_response=response,
        )


