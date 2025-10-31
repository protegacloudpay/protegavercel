"""Middleware orchestrator for POS integrations."""

from __future__ import annotations

from typing import Dict, Iterable

from .base import POSAdapter, POSAdapterError, POSPaymentRequest, POSPaymentResult


class POSMiddleware:
    """Registry and dispatcher for POS adapters."""

    def __init__(self) -> None:
        self._adapters: Dict[str, POSAdapter] = {}

    def register_adapter(self, adapter: POSAdapter) -> None:
        identifier = adapter.name.lower()
        if not identifier or identifier in {"base", ""}:
            raise POSAdapterError("Adapter must define a unique name")
        self._adapters[identifier] = adapter

    def get_adapter(self, provider: str) -> POSAdapter:
        adapter = self._adapters.get(provider.lower())
        if not adapter:
            available = ", ".join(sorted(self._adapters.keys())) or "none"
            raise POSAdapterError(
                f"POS adapter '{provider}' is not registered. Available adapters: {available}."
            )
        return adapter

    def process_payment(self, provider: str, request: POSPaymentRequest) -> POSPaymentResult:
        adapter = self.get_adapter(provider)
        return adapter.process(request)

    def available_adapters(self) -> Iterable[str]:
        return self._adapters.keys()


# Shared singleton used across the FastAPI application
pos_middleware = POSMiddleware()

# Register built-in adapters
try:
    from .adapters.stripe_adapter import StripePOSAdapter

    pos_middleware.register_adapter(StripePOSAdapter())
except Exception as exc:  # pragma: no cover - registration should not break app startup
    # Deferred error: adapter-specific errors will surface when invoked
    import logging

    logging.getLogger(__name__).warning("StripePOSAdapter registration failed: %s", exc)

try:
    from .adapters.square_adapter import SquarePOSAdapter

    pos_middleware.register_adapter(SquarePOSAdapter())
except Exception as exc:  # pragma: no cover
    import logging

    logging.getLogger(__name__).info("SquarePOSAdapter registered as template: %s", exc)


