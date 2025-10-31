from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    company_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "merchant"

# Customer Schemas
class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    fingerprint_hash: str

class CustomerResponse(BaseModel):
    customer_id: str
    name: Optional[str]
    email: Optional[str]
    enrolled_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

class CustomerProfile(BaseModel):
    customer_id: str
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: Optional[str]
    enrolled_at: datetime
    
    class Config:
        from_attributes = True

# Payment Method Schemas
class PaymentMethodCreate(BaseModel):
    type: str  # credit_card, debit_card, checking, savings
    name: str
    last4: str
    encrypted_data: str
    is_default: bool = False

class PaymentMethodResponse(BaseModel):
    id: int
    type: str
    name: str
    last4: str
    is_default: bool
    
    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionItem(BaseModel):
    name: str
    price: float

class TransactionCreate(BaseModel):
    amount: float
    items: List[TransactionItem]
    fingerprint_hash: str
    payment_method_id: Optional[int] = None
    pos_provider: Optional[str] = "stripe"

class TransactionResponse(BaseModel):
    transaction_id: str
    customer_id: str
    amount: float
    total: float
    status: str
    items: List[dict]
    timestamp: datetime
    payment_provider: Optional[str] = None
    provider_transaction_id: Optional[str] = None
    client_secret: Optional[str] = None
    
    class Config:
        from_attributes = True

# Merchant Schemas
class MerchantStats(BaseModel):
    total_transactions: int
    revenue: float
    protega_fees: float
    customers: int
    avg_transaction: float
    fraud_attempts: int
    approval_rate: float

# Inventory Schemas
class InventoryCreate(BaseModel):
    name: str
    barcode: Optional[str] = None
    price: float
    category: Optional[str] = None
    stock: int = 0

class InventoryResponse(BaseModel):
    id: int
    name: str
    barcode: Optional[str]
    price: float
    category: Optional[str]
    stock: int
    
    class Config:
        from_attributes = True

# Fingerprint Verification
class FingerprintVerify(BaseModel):
    fingerprint_hash: str

class FingerprintVerifyResponse(BaseModel):
    verified: bool
    customer_id: Optional[str] = None
    is_new: bool = False




