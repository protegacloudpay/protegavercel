from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="merchant")  # merchant, customer, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Merchant(Base):
    __tablename__ = "merchants"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(String, unique=True, index=True, default=lambda: f"MERCH-{uuid.uuid4().hex[:8].upper()}")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    company_name = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String)
    api_key = Column(String, unique=True, index=True)
    subscription_tier = Column(String, default="Enterprise")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="merchant")

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(String, unique=True, index=True, default=lambda: f"CUST-{uuid.uuid4().hex[:8].upper()}")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    address = Column(Text)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="customer")
    payment_methods = relationship("PaymentMethod", back_populates="customer")
    transactions = relationship("Transaction", back_populates="customer")
    fingerprint = relationship("Fingerprint", back_populates="customer", uselist=False)

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    type = Column(String, nullable=False)  # credit_card, debit_card, checking, savings
    name = Column(String, nullable=False)
    last4 = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)
    encrypted_data = Column(Text)  # AES-256 encrypted payment details
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="payment_methods")
    transactions = relationship("Transaction", back_populates="payment_method")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String, unique=True, index=True, default=lambda: f"TXN-{uuid.uuid4().hex[:8].upper()}")
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"), nullable=True)
    amount = Column(Float, nullable=False)
    tax = Column(Float, default=0.0)
    total = Column(Float, nullable=False)
    status = Column(String, default="pending")  # pending, processing, completed, failed, cancelled
    items = Column(JSON)  # Store transaction items as JSON
    payment_provider = Column(String, default="stripe")  # stripe, plaid, etc.
    provider_transaction_id = Column(String)
    template_hash = Column(String, nullable=False)  # SHA-256 hash for verification (not encrypted template)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="transactions")
    merchant = relationship("Merchant")
    payment_method = relationship("PaymentMethod", back_populates="transactions")

class Fingerprint(Base):
    """
    Secure Enclave: Encrypted biometric fingerprint storage
    Uses AES-256-GCM encryption with per-record key derivation
    """
    __tablename__ = "fingerprints"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=True)
    
    # Encryption fields
    salt_b64 = Column(String, nullable=False)  # Base64-encoded salt for key derivation
    encrypted_template = Column(Text, nullable=False)  # AES-256-GCM encrypted fingerprint template
    
    # Hash for duplicate detection (without decryption)
    template_hash = Column(String, unique=True, index=True, nullable=False)  # SHA-256 hash
    
    # Metadata
    registered_at = Column(DateTime, default=datetime.utcnow)
    last_verified_at = Column(DateTime, nullable=True)
    verification_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    customer = relationship("Customer", back_populates="fingerprint")
    user = relationship("User", backref="fingerprint")

class Consent(Base):
    """
    Compliance: User consent records for BIPA, GDPR, CCPA
    """
    __tablename__ = "consents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    consent_type = Column(String, nullable=False)  # 'BIPA', 'GDPR', 'CCPA'
    consent_text = Column(Text, nullable=False)  # Full text of consent
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    user = relationship("User", backref="consents")

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    name = Column(String, nullable=False)
    barcode = Column(String, index=True)
    price = Column(Float, nullable=False)
    category = Column(String)
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    merchant = relationship("Merchant")

