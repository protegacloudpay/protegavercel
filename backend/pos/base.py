"""Base classes and data contracts for POS integrations."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


class POSAdapterError(Exception):
    """Raised when a POS adapter fails to process a request."""


@dataclass
class POSLineItem:
    """Normalized line-item structure shared across adapters."""

    name: str
    price: float
    quantity: int = 1
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_payload(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "price": self.price,
            "quantity": self.quantity,
            "metadata": self.metadata,
        }


@dataclass
class POSPaymentRequest:
    """Normalized payment request forwarded to POS adapters."""

    amount: float
    total: float
    currency: str = "usd"
    customer_email: Optional[str] = None
    customer_name: Optional[str] = None
    customer_reference: Optional[str] = None
    merchant_reference: Optional[str] = None
    payment_method_token: Optional[str] = None
    fingerprint_hash: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    items: List[POSLineItem] = field(default_factory=list)


@dataclass
class POSPaymentResult:
    """Normalized payment result returned by adapters."""

    status: str
    transaction_reference: Optional[str]
    client_secret: Optional[str] = None
    raw_response: Dict[str, Any] = field(default_factory=dict)


class POSAdapter(ABC):
    """Abstract base class for POS integrations."""

    name: str = "base"

    def __init__(self, config: Optional[Dict[str, Any]] = None) -> None:
        self.config = config or {}
        self.validate_configuration()

    def validate_configuration(self) -> None:
        """Hook for adapter-specific configuration validation."""

    @abstractmethod
    def prepare_payload(self, request: POSPaymentRequest) -> Dict[str, Any]:
        """Transform normalized request into provider-specific payload."""

    @abstractmethod
    def send_payment(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute the provider API call and return the raw response."""

    @abstractmethod
    def parse_response(self, response: Dict[str, Any]) -> POSPaymentResult:
        """Translate provider response into middleware result."""

    def process(self, request: POSPaymentRequest) -> POSPaymentResult:
        payload = self.prepare_payload(request)
        response = self.send_payment(payload)
        return self.parse_response(response)


