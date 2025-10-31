from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import uuid

from database import get_db, init_db
from models import Base, User, Merchant, Customer, PaymentMethod, Transaction, Inventory, Fingerprint, Consent
from schemas import (
    Token, LoginRequest, RegisterRequest,
    CustomerCreate, CustomerResponse, CustomerProfile,
    PaymentMethodCreate, PaymentMethodResponse,
    TransactionCreate, TransactionResponse,
    MerchantStats, InventoryCreate, InventoryResponse,
    FingerprintVerify, FingerprintVerifyResponse
)
from auth import (
    verify_password, get_password_hash, create_access_token,
    get_current_user, get_current_merchant, get_current_customer
)
from security_enclave import encrypt_sensitive, hash_fingerprint
from auth_biometric import authenticate_with_fingerprint, check_fingerprint_exists
from compliance import (
    record_user_consent, delete_biometric_data, get_user_consent_history,
    export_user_data, verify_user_consent
)
from stripe_service import (
    create_payment_intent, confirm_payment_intent, retrieve_payment_intent,
    create_or_retrieve_customer, attach_payment_method_to_customer
)
from pos import POSAdapterError, POSLineItem, POSPaymentRequest, pos_middleware

load_dotenv()


def _map_provider_status(status: Optional[str]) -> str:
    if not status:
        return "processing"
    normalized = status.lower()
    if normalized in {"succeeded", "paid", "completed", "captured"}:
        return "completed"
    if normalized in {"processing", "pending", "requires_action", "requires_payment_method"}:
        return "processing"
    if normalized in {"canceled", "cancelled"}:
        return "cancelled"
    if normalized in {"failed", "declined", "refused"}:
        return "failed"
    return "processing"


app = FastAPI(
    title="Protega CloudPay API",
    version="2.0.0",
    description="Production API for Protega CloudPay biometric payment infrastructure"
)

# CORS configuration
# Support both environment variable and FRONTEND_URL
frontend_url = os.getenv("FRONTEND_URL", "")
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001")

# If FRONTEND_URL is set, add it to origins
if frontend_url:
    origins = [frontend_url] + cors_origins.split(",")
else:
    origins = cors_origins.split(",")

# Remove duplicates and empty strings
origins = list(set([o.strip() for o in origins if o.strip()]))

# Custom CORS middleware to handle Vercel preview deployments
from fastapi.middleware.cors import CORSMiddleware as BaseCORSMiddleware

@app.middleware("http")
async def custom_cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    
    # Check if origin matches any allowed pattern
    allowed = False
    if origin:
        # Allow configured origins
        if origin in origins:
            allowed = True
        # Allow all Vercel deployments for protegos-projects
        elif origin.endswith("-protegos-projects.vercel.app") or origin.endswith(".vercel.app"):
            allowed = True
    
    response = await call_next(request)
    
    if allowed and origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Protega CloudPay API", "version": "2.0.0", "status": "operational"}

# Health check endpoint for Fly.io/Vercel
@app.get("/healthz")
@app.get("/health")
async def healthz():
    """Health check endpoint for deployment monitoring"""
    try:
        # Check database connection
        from database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        return {"status": "ok", "database": "connected", "version": "2.0.0"}
    except Exception as e:
        return {"status": "ok", "database": "disconnected", "error": str(e), "version": "2.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

# ==================== AUTHENTICATION ====================

@app.post("/api/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new merchant or customer"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    role = request.role or "merchant"
    if role not in {"merchant", "customer"}:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    # Create user
    user = User(
        email=request.email,
        hashed_password=get_password_hash(request.password),
        role=role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    if role == "merchant":
        if not request.company_name:
            raise HTTPException(status_code=400, detail="company_name is required for merchant registration")
        merchant = Merchant(
            user_id=user.id,
            name=request.name,
            company_name=request.company_name,
            email=request.email,
            phone=request.phone,
            api_key=f"pk_live_{uuid.uuid4().hex[:32]}"
        )
        db.add(merchant)
        db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is inactive")
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active
    }

# ==================== CUSTOMER ENDPOINTS ====================

@app.post("/api/customers/register", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def register_customer(
    request: CustomerCreate,
    db: Session = Depends(get_db),
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """
    Register a new customer with fingerprint using Secure Enclave.
    Encrypts biometric template with AES-256-GCM before storage.
    """
    # Normalize fingerprint sample
    normalized_sample = request.fingerprint_hash.strip().upper()
    
    # Create hash for duplicate detection
    template_hash = hash_fingerprint(normalized_sample)
    
    # Check for duplicate using hash (no decryption needed)
    existing = db.query(Fingerprint).filter(Fingerprint.template_hash == template_hash).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Fingerprint already registered"
        )
    
    # Encrypt fingerprint template
    salt_b64, encrypted_template = encrypt_sensitive(normalized_sample)
    
    # Create or update customer record
    customer = db.query(Customer).filter(Customer.email == request.email).first()
    if customer:
        if customer.fingerprint:
            raise HTTPException(status_code=409, detail="Customer already enrolled with fingerprint")
        customer.name = request.name
        customer.phone = request.phone
    else:
        customer = Customer(
            name=request.name,
            email=request.email,
            phone=request.phone
        )
        db.add(customer)
        db.flush()

    # Link customer to existing user account if available
    user = db.query(User).filter(User.email == request.email).first()
    if user and not customer.user_id:
        customer.user_id = user.id
    
    # Create encrypted fingerprint record in Secure Enclave
    fingerprint = Fingerprint(
        customer_id=customer.id,
        salt_b64=salt_b64,
        encrypted_template=encrypted_template,
        template_hash=template_hash
    )
    db.add(fingerprint)
    
    # Record BIPA consent (required for biometric data)
    # Note: In production, get consent_text from request or predefined templates
    consent_text = "I consent to the collection and storage of my biometric identifier for payment processing purposes in accordance with BIPA, GDPR, and CCPA regulations."
    
    # Create a temporary user for consent if needed, or use customer_id
    # For now, we'll create consent record without user_id (can be linked later)
    try:
        record_user_consent(
            user_id=None,  # Will be set when user account is created
            consent_type="BIPA",
            consent_text=consent_text,
            db=db,
            ip_address=ip_address,
            user_agent=user_agent
        )
    except Exception:
        # Consent recording is optional for initial registration
        pass
    
    db.commit()
    db.refresh(customer)
    
    return CustomerResponse(
        customer_id=customer.customer_id,
        name=customer.name,
        email=customer.email,
        enrolled_at=customer.enrolled_at,
        is_active=customer.is_active
    )

@app.post("/api/customers/verify-fingerprint", response_model=FingerprintVerifyResponse)
async def verify_fingerprint(
    request: FingerprintVerify,
    db: Session = Depends(get_db)
):
    """
    Verify fingerprint using Secure Enclave.
    Uses hash-based matching without decrypting stored templates.
    """
    # Check if fingerprint exists
    check_result = check_fingerprint_exists(request.fingerprint_hash, db)
    
    if check_result["exists"]:
        # Authenticate and get customer info
        try:
            auth_result = authenticate_with_fingerprint(request.fingerprint_hash, db)
            
            return FingerprintVerifyResponse(
                verified=True,
                customer_id=auth_result.get("customer_id_str"),
                is_new=False
            )
        except HTTPException:
            return FingerprintVerifyResponse(
                verified=False,
                is_new=True
            )
    else:
        return FingerprintVerifyResponse(
            verified=False,
            is_new=True
        )

@app.get("/api/customers/profile", response_model=CustomerProfile)
async def get_customer_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current customer profile"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    return CustomerProfile(
        customer_id=customer.customer_id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address,
        city=customer.city,
        state=customer.state,
        zip_code=customer.zip_code,
        enrolled_at=customer.enrolled_at
    )

@app.put("/api/customers/profile", response_model=CustomerProfile)
async def update_customer_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update customer profile"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    for key, value in profile_data.items():
        if hasattr(customer, key) and value is not None:
            setattr(customer, key, value)
    
    customer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(customer)
    
    return CustomerProfile(
        customer_id=customer.customer_id,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address=customer.address,
        city=customer.city,
        state=customer.state,
        zip_code=customer.zip_code,
        enrolled_at=customer.enrolled_at
    )

@app.get("/api/customers/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get customer payment methods"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    methods = db.query(PaymentMethod).filter(
        PaymentMethod.customer_id == customer.id,
        PaymentMethod.is_active == True
    ).all()
    
    return [PaymentMethodResponse(
        id=m.id,
        type=m.type,
        name=m.name,
        last4=m.last4,
        is_default=m.is_default
    ) for m in methods]

@app.post("/api/customers/payment-methods", response_model=PaymentMethodResponse, status_code=status.HTTP_201_CREATED)
async def add_payment_method(
    request: PaymentMethodCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a payment method for customer"""
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    
    stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
    if not stripe_secret_key:
        raise HTTPException(status_code=500, detail="Stripe configuration missing")

    if not request.encrypted_data or not request.encrypted_data.startswith("pm_"):
        raise HTTPException(status_code=400, detail="Invalid Stripe payment method token")

    stripe_customer_id = create_or_retrieve_customer(
        email=customer.email or f"customer_{customer.customer_id}@protega.cloud",
        name=customer.name
    )

    try:
        attach_payment_method_to_customer(request.encrypted_data, stripe_customer_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # If setting as default, unset other defaults
    if request.is_default:
        db.query(PaymentMethod).filter(
            PaymentMethod.customer_id == customer.id
        ).update({"is_default": False})

    payment_method = PaymentMethod(
        customer_id=customer.id,
        type=request.type,
        name=request.name,
        last4=request.last4,
        encrypted_data=request.encrypted_data,
        is_default=request.is_default
    )
    db.add(payment_method)
    db.commit()
    db.refresh(payment_method)
    
    return PaymentMethodResponse(
        id=payment_method.id,
        type=payment_method.type,
        name=payment_method.name,
        last4=payment_method.last4,
        is_default=payment_method.is_default
    )

# ==================== TRANSACTION ENDPOINTS ====================

@app.post("/api/transactions/create", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    request: TransactionCreate,
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """
    Create a new transaction using Secure Enclave fingerprint verification.
    Verifies fingerprint hash without decrypting stored template.
    """
    # Authenticate using fingerprint (Secure Enclave)
    try:
        auth_result = authenticate_with_fingerprint(request.fingerprint_hash, db)
    except HTTPException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Fingerprint verification failed. Please register first."
        )
    
    # Get customer from authentication result
    customer_id = auth_result.get("customer_id")
    if not customer_id:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Get hash for transaction record (not encrypted template)
    template_hash = hash_fingerprint(request.fingerprint_hash)
    
    # Calculate totals
    tax = request.amount * 0.08  # 8% tax
    total = request.amount + tax
    
    # Create transaction
    transaction = Transaction(
        customer_id=customer.id,
        merchant_id=current_merchant.id,
        payment_method_id=request.payment_method_id,
        amount=request.amount,
        tax=tax,
        total=total,
        items=[item.dict() for item in request.items],
        template_hash=template_hash,  # Store hash, not encrypted template
        status="processing"
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    # Process payment through the POS middleware
    metadata = {
        "transaction_id": transaction.transaction_id,
        "customer_id": customer.customer_id,
        "merchant_id": current_merchant.merchant_id,
        "fingerprint_hash": template_hash[:16],
    }

    payment_method_token = None
    if request.payment_method_id:
        payment_method = db.query(PaymentMethod).filter(
            PaymentMethod.id == request.payment_method_id,
            PaymentMethod.customer_id == customer.id
        ).first()
        if payment_method and payment_method.encrypted_data:
            payment_method_token = payment_method.encrypted_data

    provider = (request.pos_provider or os.getenv("DEFAULT_POS_PROVIDER", "stripe")).lower()
    currency = os.getenv("PAYMENT_CURRENCY", "usd")

    pos_request = POSPaymentRequest(
        amount=request.amount,
        total=total,
        currency=currency,
        customer_email=customer.email,
        customer_name=customer.name,
        customer_reference=customer.customer_id,
        merchant_reference=current_merchant.merchant_id,
        payment_method_token=payment_method_token,
        fingerprint_hash=template_hash,
        metadata=metadata,
        items=[POSLineItem(name=item.name, price=item.price) for item in request.items],
    )

    pos_result = None
    try:
        pos_result = pos_middleware.process_payment(provider, pos_request)
        transaction.payment_provider = provider
        transaction.provider_transaction_id = pos_result.transaction_reference
        transaction.status = _map_provider_status(pos_result.status)
        transaction.updated_at = datetime.utcnow()
        db.commit()
    except POSAdapterError as exc:
        transaction.status = "failed"
        transaction.updated_at = datetime.utcnow()
        db.commit()
        raise HTTPException(
            status_code=402,
            detail=f"Payment processing failed via '{provider}': {str(exc)}"
        )
    except Exception as exc:
        transaction.status = "failed"
        transaction.updated_at = datetime.utcnow()
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected payment processing error: {str(exc)}"
        )
    
    return TransactionResponse(
        transaction_id=transaction.transaction_id,
        customer_id=customer.customer_id,
        amount=transaction.amount,
        total=transaction.total,
        status=transaction.status,
        items=transaction.items,
        timestamp=transaction.created_at,
        payment_provider=transaction.payment_provider,
        provider_transaction_id=transaction.provider_transaction_id,
        client_secret=pos_result.client_secret if pos_result else None,
    )

@app.get("/api/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get transaction history"""
    # Get merchant or customer
    merchant = db.query(Merchant).filter(Merchant.user_id == current_user.id).first()
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    
    query = db.query(Transaction)
    
    if merchant:
        query = query.filter(Transaction.merchant_id == merchant.id)
    elif customer:
        query = query.filter(Transaction.customer_id == customer.id)
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    transactions = query.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    
    return [TransactionResponse(
        transaction_id=t.transaction_id,
        customer_id=t.customer.customer_id,
        amount=t.amount,
        total=t.total,
        status=t.status,
        items=t.items or [],
        timestamp=t.created_at
    ) for t in transactions]

# ==================== MERCHANT ENDPOINTS ====================

@app.get("/api/merchant/stats", response_model=MerchantStats)
async def get_merchant_stats(
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """Get merchant analytics and statistics"""
    transactions = db.query(Transaction).filter(Transaction.merchant_id == current_merchant.id).all()
    
    completed = [t for t in transactions if t.status == "completed"]
    total_transactions = len(completed)
    revenue = sum(t.total for t in completed)
    protega_fees = revenue * 0.01  # 1% fee
    avg_transaction = revenue / total_transactions if total_transactions > 0 else 0
    
    # Get unique customers
    customer_ids = set(t.customer_id for t in completed)
    customers = len(customer_ids)
    
    # Mock fraud attempts and approval rate
    fraud_attempts = len([t for t in transactions if t.status == "failed"])
    approval_rate = (total_transactions / len(transactions) * 100) if transactions else 0
    
    return MerchantStats(
        total_transactions=total_transactions,
        revenue=revenue,
        protega_fees=protega_fees,
        customers=customers,
        avg_transaction=avg_transaction,
        fraud_attempts=fraud_attempts,
        approval_rate=round(approval_rate, 2)
    )

@app.get("/api/merchant/customers")
async def get_merchant_customers(
    skip: int = 0,
    limit: int = 100,
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """Get customers who have transacted with this merchant"""
    # Get unique customers from transactions
    transactions = db.query(Transaction).filter(
        Transaction.merchant_id == current_merchant.id
    ).all()
    
    customer_ids = set(t.customer_id for t in transactions)
    customers = db.query(Customer).filter(Customer.id.in_(customer_ids)).all()
    
    # Calculate stats per customer
    result = []
    for customer in customers:
        customer_txns = [t for t in transactions if t.customer_id == customer.id]
        completed_txns = [t for t in customer_txns if t.status == "completed"]
        
        result.append({
            "customer_id": customer.customer_id,
            "name": f"Customer #{customer.customer_id[-3:]}",  # Anonymous
            "date_added": customer.enrolled_at,
            "transaction_count": len(completed_txns),
            "total_spent": sum(t.total for t in completed_txns)
        })
    
    return {"customers": result[skip:skip+limit], "total": len(result)}

# ==================== INVENTORY ENDPOINTS ====================

@app.get("/api/inventory", response_model=List[InventoryResponse])
async def get_inventory(
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """Get merchant inventory"""
    items = db.query(Inventory).filter(
        Inventory.merchant_id == current_merchant.id,
        Inventory.is_active == True
    ).all()
    
    return [InventoryResponse(
        id=item.id,
        name=item.name,
        barcode=item.barcode,
        price=item.price,
        category=item.category,
        stock=item.stock
    ) for item in items]

@app.post("/api/inventory", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_inventory_item(
    request: InventoryCreate,
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """Add item to merchant inventory"""
    item = Inventory(
        merchant_id=current_merchant.id,
        name=request.name,
        barcode=request.barcode,
        price=request.price,
        category=request.category,
        stock=request.stock
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return InventoryResponse(
        id=item.id,
        name=item.name,
        barcode=item.barcode,
        price=item.price,
        category=item.category,
        stock=item.stock
    )

@app.put("/api/inventory/{item_id}", response_model=InventoryResponse)
async def update_inventory_item(
    item_id: int,
    request: InventoryCreate,
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """Update inventory item"""
    item = db.query(Inventory).filter(
        Inventory.id == item_id,
        Inventory.merchant_id == current_merchant.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.name = request.name
    item.barcode = request.barcode
    item.price = request.price
    item.category = request.category
    item.stock = request.stock
    item.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(item)
    
    return InventoryResponse(
        id=item.id,
        name=item.name,
        barcode=item.barcode,
        price=item.price,
        category=item.category,
        stock=item.stock
    )

@app.delete("/api/inventory/{item_id}")
async def delete_inventory_item(
    item_id: int,
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """Delete inventory item"""
    item = db.query(Inventory).filter(
        Inventory.id == item_id,
        Inventory.merchant_id == current_merchant.id
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.is_active = False
    db.commit()
    
    return {"message": "Item deleted successfully"}

@app.get("/api/inventory/barcode/{barcode}", response_model=InventoryResponse)
async def get_inventory_by_barcode(
    barcode: str,
    current_merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    """Get inventory item by barcode"""
    item = db.query(Inventory).filter(
        Inventory.barcode == barcode,
        Inventory.merchant_id == current_merchant.id,
        Inventory.is_active == True
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return InventoryResponse(
        id=item.id,
        name=item.name,
        barcode=item.barcode,
        price=item.price,
        category=item.category,
        stock=item.stock
    )

# ==================== SECURE ENCLAVE ENDPOINTS ====================

@app.post("/api/biometric/enroll", status_code=status.HTTP_201_CREATED)
async def enroll_fingerprint(
    request: dict,  # {"fingerprint_sample": "...", "customer_id": 1}
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enroll fingerprint in Secure Enclave.
    Encrypts template with AES-256-GCM and stores hash for duplicate detection.
    """
    fingerprint_sample = request.get("fingerprint_sample")
    customer_id = request.get("customer_id")
    
    if not fingerprint_sample:
        raise HTTPException(status_code=400, detail="fingerprint_sample required")
    if not customer_id:
        raise HTTPException(status_code=400, detail="customer_id required")
    
    # Normalize sample
    normalized = fingerprint_sample.strip().upper()
    
    # Hash for duplicate detection
    template_hash = hash_fingerprint(normalized)
    
    # Check for duplicates
    existing = db.query(Fingerprint).filter(Fingerprint.template_hash == template_hash).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Fingerprint already registered"
        )
    
    # Encrypt template
    salt_b64, encrypted_template = encrypt_sensitive(normalized)
    
    # Store in Secure Enclave
    fingerprint = Fingerprint(
        customer_id=customer_id,
        user_id=current_user.id,
        salt_b64=salt_b64,
        encrypted_template=encrypted_template,
        template_hash=template_hash
    )
    db.add(fingerprint)
    db.commit()
    
    return {
        "status": "enrolled",
        "fingerprint_id": fingerprint.id,
        "message": "Fingerprint encrypted and stored securely in Secure Enclave"
    }

@app.post("/api/biometric/authenticate")
async def authenticate_biometric(
    request: dict,  # {"fingerprint_sample": "..."}
    db: Session = Depends(get_db)
):
    """
    Authenticate using Secure Enclave fingerprint verification.
    Uses hash-based matching - never decrypts stored templates.
    """
    fingerprint_sample = request.get("fingerprint_sample")
    if not fingerprint_sample:
        raise HTTPException(status_code=400, detail="fingerprint_sample required")
    
    try:
        result = authenticate_with_fingerprint(fingerprint_sample, db)
        return result
    except HTTPException as e:
        raise e

# ==================== COMPLIANCE ENDPOINTS ====================

@app.post("/api/privacy/consent", status_code=status.HTTP_201_CREATED)
async def record_consent(
    consent_type: str,
    consent_text: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """
    Record user consent for biometric data processing.
    Required for BIPA, GDPR, CCPA compliance.
    """
    if consent_type not in ["BIPA", "GDPR", "CCPA"]:
        raise HTTPException(status_code=400, detail="Invalid consent type")
    
    record_user_consent(
        user_id=current_user.id,
        consent_type=consent_type,
        consent_text=consent_text,
        db=db,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return {"status": "success", "message": "Consent recorded"}

@app.get("/api/privacy/consents")
async def get_consents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's consent history (GDPR right to access)"""
    consents = get_user_consent_history(current_user.id, db)
    return {"consents": consents}

@app.delete("/api/privacy/delete")
async def delete_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete all biometric and payment data (BIPA, GDPR, CCPA right to deletion).
    This is a permanent action and cannot be undone.
    """
    result = delete_biometric_data(current_user.id, db)
    return result

@app.get("/api/privacy/export")
async def export_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all user data (GDPR right to data portability).
    Note: Biometric templates are NOT exported for security.
    """
    data = export_user_data(current_user.id, db)
    return data

# ==================== STRIPE PAYMENT ENDPOINTS ====================

@app.post("/api/payments/create-intent")
async def create_payment_intent_endpoint(
    amount: float,
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe PaymentIntent for a transaction.
    Returns client_secret for frontend confirmation.
    """
    # Get transaction
    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Verify user owns this transaction
    customer = db.query(Customer).filter(Customer.id == transaction.customer_id).first()
    if customer and customer.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Get customer email
        customer_email = customer.email if customer else None
        
        # Create PaymentIntent
        payment_intent = create_payment_intent(
            amount=transaction.total,
            customer_email=customer_email,
            metadata={
                "transaction_id": transaction.transaction_id,
                "customer_id": customer.customer_id if customer else "unknown"
            }
        )
        
        # Update transaction with Stripe PaymentIntent ID
        transaction.provider_transaction_id = payment_intent["id"]
        transaction.payment_provider = "stripe"
        transaction.status = "processing"
        db.commit()
        
        return {
            "client_secret": payment_intent["client_secret"],
            "payment_intent_id": payment_intent["id"],
            "amount": payment_intent["amount"],
            "currency": payment_intent["currency"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create payment intent: {str(e)}"
        )


@app.post("/api/payments/confirm")
async def confirm_payment(
    payment_intent_id: str,
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Confirm a Stripe PaymentIntent and update transaction status.
    """
    # Get transaction
    transaction = db.query(Transaction).filter(
        Transaction.transaction_id == transaction_id,
        Transaction.provider_transaction_id == payment_intent_id
    ).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    try:
        # Check PaymentIntent status
        intent_status = retrieve_payment_intent(payment_intent_id)
        
        if intent_status["status"] == "succeeded":
            transaction.status = "completed"
            transaction.updated_at = datetime.utcnow()
            db.commit()
            return {"status": "completed", "message": "Payment successful"}
        elif intent_status["status"] in ["processing", "requires_action"]:
            transaction.status = "processing"
            db.commit()
            return {"status": "processing", "message": "Payment processing"}
        else:
            transaction.status = "failed"
            transaction.updated_at = datetime.utcnow()
            db.commit()
            return {"status": "failed", "message": f"Payment {intent_status['status']}"}
    except Exception as e:
        transaction.status = "failed"
        db.commit()
        raise HTTPException(
            status_code=500,
            detail=f"Payment confirmation failed: {str(e)}"
        )


@app.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Stripe webhook events.
    Updates transaction status based on PaymentIntent events.
    """
    import stripe
    
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not webhook_secret:
        raise HTTPException(status_code=400, detail="Webhook secret not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "payment_intent.succeeded":
        payment_intent = event["data"]["object"]
        # Update transaction
        transaction = db.query(Transaction).filter(
            Transaction.provider_transaction_id == payment_intent["id"]
        ).first()
        if transaction:
            transaction.status = "completed"
            transaction.updated_at = datetime.utcnow()
            db.commit()
    
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        transaction = db.query(Transaction).filter(
            Transaction.provider_transaction_id == payment_intent["id"]
        ).first()
        if transaction:
            transaction.status = "failed"
            transaction.updated_at = datetime.utcnow()
            db.commit()
    
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
