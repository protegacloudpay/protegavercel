"""
Stripe Payment Processing Service
Handles PaymentIntent creation, confirmation, and webhook processing
"""
import stripe
import os
from typing import Dict, Optional
from decimal import Decimal

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def create_payment_intent(
    amount: float,
    currency: str = "usd",
    customer_email: Optional[str] = None,
    payment_method_id: Optional[str] = None,
    metadata: Optional[Dict] = None
) -> Dict:
    """
    Create a Stripe PaymentIntent
    
    Args:
        amount: Amount in dollars (will be converted to cents)
        currency: Currency code (default: usd)
        customer_email: Customer email for receipt
        payment_method_id: Stripe payment method ID
        metadata: Additional metadata
    
    Returns:
        PaymentIntent object with client_secret
    """
    if not stripe.api_key or stripe.api_key == "":
        raise ValueError("STRIPE_SECRET_KEY not configured")
    
    # Convert dollars to cents
    amount_cents = int(Decimal(str(amount)) * 100)
    
    intent_params = {
        "amount": amount_cents,
        "currency": currency,
        "automatic_payment_methods": {
            "enabled": True,
        },
    }
    
    if customer_email:
        intent_params["receipt_email"] = customer_email
    
    if payment_method_id:
        intent_params["payment_method"] = payment_method_id
        intent_params["confirmation_method"] = "automatic"
    
    if metadata:
        intent_params["metadata"] = metadata
    
    try:
        intent = stripe.PaymentIntent.create(**intent_params)
        return {
            "id": intent.id,
            "client_secret": intent.client_secret,
            "status": intent.status,
            "amount": intent.amount / 100,  # Convert back to dollars
            "currency": intent.currency
        }
    except stripe.error.StripeError as e:
        raise ValueError(f"Stripe error: {str(e)}")


def confirm_payment_intent(payment_intent_id: str, payment_method_id: Optional[str] = None) -> Dict:
    """
    Confirm a PaymentIntent
    
    Args:
        payment_intent_id: Stripe PaymentIntent ID
        payment_method_id: Payment method to attach (optional)
    
    Returns:
        Confirmed PaymentIntent
    """
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if payment_method_id:
            intent.payment_method = payment_method_id
        
        if intent.status == "requires_confirmation":
            intent = intent.confirm()
        
        return {
            "id": intent.id,
            "status": intent.status,
            "amount": intent.amount / 100,
            "currency": intent.currency
        }
    except stripe.error.StripeError as e:
        raise ValueError(f"Stripe confirmation error: {str(e)}")


def retrieve_payment_intent(payment_intent_id: str) -> Dict:
    """
    Retrieve a PaymentIntent status
    
    Args:
        payment_intent_id: Stripe PaymentIntent ID
    
    Returns:
        PaymentIntent details
    """
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return {
            "id": intent.id,
            "status": intent.status,
            "amount": intent.amount / 100,
            "currency": intent.currency,
            "payment_method": intent.payment_method
        }
    except stripe.error.StripeError as e:
        raise ValueError(f"Stripe retrieval error: {str(e)}")


def create_or_retrieve_customer(email: str, name: Optional[str] = None) -> str:
    """
    Create or retrieve a Stripe customer
    
    Args:
        email: Customer email
        name: Customer name (optional)
    
    Returns:
        Stripe customer ID
    """
    try:
        # Search for existing customer
        customers = stripe.Customer.list(email=email, limit=1)
        if customers.data:
            return customers.data[0].id
        
        # Create new customer
        customer = stripe.Customer.create(
            email=email,
            name=name
        )
        return customer.id
    except stripe.error.StripeError as e:
        raise ValueError(f"Stripe customer error: {str(e)}")


def attach_payment_method_to_customer(payment_method_id: str, customer_id: str) -> Dict:
    """
    Attach a payment method to a customer
    
    Args:
        payment_method_id: Stripe payment method ID
        customer_id: Stripe customer ID
    
    Returns:
        Attached payment method
    """
    try:
        payment_method = stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id
        )
        return {
            "id": payment_method.id,
            "type": payment_method.type,
            "card": payment_method.card if hasattr(payment_method, 'card') else None
        }
    except stripe.error.StripeError as e:
        raise ValueError(f"Stripe attach error: {str(e)}")



