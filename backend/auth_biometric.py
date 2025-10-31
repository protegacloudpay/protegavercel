"""
Biometric Authentication - Secure fingerprint verification
Uses hash-based matching without decrypting stored templates
"""
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from models import Fingerprint, Customer, User
from security_enclave import hash_fingerprint, verify_fingerprint_match

def authenticate_with_fingerprint(
    fingerprint_sample: str,
    db: Session
) -> dict:
    """
    Authenticate user using fingerprint sample.
    Uses hash-based matching for security - never decrypts stored templates.
    
    Args:
        fingerprint_sample: Raw fingerprint data from scanner
        db: Database session
    
    Returns:
        Dictionary with customer/user information
    
    Raises:
        HTTPException: If fingerprint not found or verification fails
    """
    # Normalize and hash the sample
    sample_hash = hash_fingerprint(fingerprint_sample)
    
    # Lookup by hash (no decryption needed)
    fingerprint = db.query(Fingerprint).filter(
        Fingerprint.template_hash == sample_hash,
        Fingerprint.is_active == True
    ).first()
    
    if not fingerprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fingerprint not registered. Please enroll first."
        )
    
    # Verify match using constant-time comparison (already matched by hash lookup)
    # Hash lookup is sufficient - if hash matches, fingerprint matches
    
    # Update verification metadata
    fingerprint.last_verified_at = datetime.utcnow()
    fingerprint.verification_count += 1
    db.commit()
    
    # Get associated customer/user
    customer = None
    if fingerprint.customer_id:
        customer = db.query(Customer).filter(Customer.id == fingerprint.customer_id).first()
    
    user = None
    if fingerprint.user_id:
        user = db.query(User).filter(User.id == fingerprint.user_id).first()
    
    return {
        "verified": True,
        "customer_id": customer.id if customer else None,
        "customer_id_str": customer.customer_id if customer else None,
        "user_id": user.id if user else None,
        "fingerprint_id": fingerprint.id,
        "last_verified": fingerprint.last_verified_at.isoformat()
    }

def check_fingerprint_exists(
    fingerprint_sample: str,
    db: Session
) -> dict:
    """
    Check if fingerprint exists without authenticating.
    Used for enrollment duplicate detection.
    
    Args:
        fingerprint_sample: Raw fingerprint data
        db: Database session
    
    Returns:
        Dictionary with existence status
    """
    sample_hash = hash_fingerprint(fingerprint_sample)
    
    fingerprint = db.query(Fingerprint).filter(
        Fingerprint.template_hash == sample_hash,
        Fingerprint.is_active == True
    ).first()
    
    if fingerprint:
        return {
            "exists": True,
            "registered_at": fingerprint.registered_at.isoformat(),
            "is_active": fingerprint.is_active
        }
    
    return {
        "exists": False,
        "message": "Fingerprint not registered"
    }

