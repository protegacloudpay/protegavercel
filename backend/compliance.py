"""
Compliance Layer - BIPA, GDPR, CCPA Compliance
Handles user consent, data deletion, and privacy rights
"""
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
from fastapi import HTTPException, status

from models import User, Customer, Fingerprint, PaymentMethod, Transaction, Consent

def record_user_consent(
    user_id: Optional[int],
    consent_type: str,
    consent_text: str,
    db: Session,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> None:
    """
    Record user consent for biometric data processing.
    Required for BIPA, GDPR, and CCPA compliance.
    
    Args:
        user_id: User ID
        consent_type: Type of consent ('BIPA', 'GDPR', 'CCPA')
        consent_text: Full text of consent agreement
        db: Database session
        ip_address: User's IP address (optional)
        user_agent: User's browser agent (optional)
    """
    if user_id is None:
        # Cannot record consent without user_id
        return
    
    consent = Consent(
        user_id=user_id,
        consent_type=consent_type,
        consent_text=consent_text,
        timestamp=datetime.utcnow(),
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(consent)
    db.commit()

def delete_biometric_data(user_id: int, db: Session) -> dict:
    """
    Delete all biometric data for a user.
    Required by BIPA (right to deletion) and GDPR (right to erasure).
    
    Args:
        user_id: User ID
        db: Database session
    
    Returns:
        Dictionary with deletion summary
    """
    deleted_items = {
        "fingerprints": 0,
        "payment_methods": 0,
        "customer_profile": False
    }
    
    # Delete fingerprint data (biometric templates)
    fingerprints = db.query(Fingerprint).filter(Fingerprint.user_id == user_id).all()
    for fp in fingerprints:
        db.delete(fp)
        deleted_items["fingerprints"] += 1
    
    # Delete payment methods (encrypted payment data)
    customer = db.query(Customer).filter(Customer.user_id == user_id).first()
    if customer:
        payment_methods = db.query(PaymentMethod).filter(
            PaymentMethod.customer_id == customer.id
        ).all()
        for pm in payment_methods:
            db.delete(pm)
            deleted_items["payment_methods"] += len(payment_methods)
    
    # Anonymize customer profile (keep for transaction history compliance)
    if customer:
        customer.fingerprint_hash = None
        customer.name = None
        customer.email = f"deleted_{customer.customer_id}@deleted.local"
        customer.phone = None
        customer.address = None
        customer.city = None
        customer.state = None
        customer.zip_code = None
        customer.is_active = False
        deleted_items["customer_profile"] = True
    
    db.commit()
    
    return {
        "status": "success",
        "message": "Biometric and payment data deleted",
        "deleted": deleted_items,
        "timestamp": datetime.utcnow().isoformat()
    }

def get_user_consent_history(user_id: int, db: Session) -> list:
    """
    Get user's consent history for transparency.
    Required for GDPR (right to access).
    
    Args:
        user_id: User ID
        db: Database session
    
    Returns:
        List of consent records
    """
    consents = db.query(Consent).filter(Consent.user_id == user_id).all()
    return [
        {
            "id": c.id,
            "type": c.consent_type,
            "text": c.consent_text,
            "timestamp": c.timestamp.isoformat(),
            "ip_address": c.ip_address,
        }
        for c in consents
    ]

def export_user_data(user_id: int, db: Session) -> dict:
    """
    Export all user data in a portable format.
    Required for GDPR (right to data portability).
    
    Args:
        user_id: User ID
        db: Database session
    
    Returns:
        Dictionary with user data
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    customer = db.query(Customer).filter(Customer.user_id == user_id).first()
    
    data = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at.isoformat(),
        "customer_data": None,
        "consents": get_user_consent_history(user_id, db),
        "transactions_count": 0
    }
    
    if customer:
        # Get transactions (amounts only, no sensitive data)
        transactions = db.query(Transaction).filter(
            Transaction.customer_id == customer.id
        ).all()
        
        data["customer_data"] = {
            "customer_id": customer.customer_id,
            "name": customer.name,
            "email": customer.email,
            "phone": customer.phone,
            "enrolled_at": customer.enrolled_at.isoformat(),
            "has_fingerprint": customer.fingerprint_hash is not None,
            # Note: Fingerprint template is NOT exported (biometric data)
        }
        
        data["transactions_count"] = len(transactions)
    
    return data

def verify_user_consent(user_id: int, consent_type: str, db: Session) -> bool:
    """
    Verify if user has given required consent.
    
    Args:
        user_id: User ID
        consent_type: Type of consent to check
        db: Database session
    
    Returns:
        True if consent exists, False otherwise
    """
    consent = db.query(Consent).filter(
        Consent.user_id == user_id,
        Consent.consent_type == consent_type
    ).first()
    
    return consent is not None

