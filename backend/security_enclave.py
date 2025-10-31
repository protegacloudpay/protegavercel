"""
Protega Cloud Enclave - Apple-grade biometric security system
Implements hardware-grade key hierarchy and encryption for biometric data
"""
import os
import base64
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes as hash_algorithms
from dotenv import load_dotenv
import secrets
import hashlib

load_dotenv()

# Master key stored only in environment secrets (Fly.io/KMS/AWS Secrets Manager)
MASTER_KEY = os.getenv("PROTEGA_MASTER_KEY")
if not MASTER_KEY:
    raise RuntimeError(
        "Missing PROTEGA_MASTER_KEY secret. "
        "Set via: fly secrets set PROTEGA_MASTER_KEY=$(openssl rand -hex 64)"
    )

if len(MASTER_KEY) < 64:
    raise RuntimeError("PROTEGA_MASTER_KEY must be at least 64 characters for security")

def derive_record_key(salt: bytes) -> bytes:
    """
    Derive a unique encryption key for each record using PBKDF2.
    This ensures each biometric template has its own encryption key.
    
    Args:
        salt: Unique salt per record (16 bytes)
    
    Returns:
        32-byte AES-256 key
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # AES-256 key length
        salt=salt,
        iterations=200_000,  # High iteration count for security
        backend=default_backend()
    )
    return kdf.derive(MASTER_KEY.encode())

def encrypt_sensitive(data: str) -> tuple[str, str]:
    """
    Encrypt sensitive data (biometric templates, payment info) using AES-256-GCM.
    Each encryption uses a unique salt and IV.
    
    Args:
        data: Plaintext string to encrypt
    
    Returns:
        Tuple of (salt_base64, encrypted_payload_base64)
        - salt: Used for key derivation
        - payload: Contains IV + tag + ciphertext
    """
    if not data:
        raise ValueError("Cannot encrypt empty data")
    
    # Generate unique salt for this record
    salt = secrets.token_bytes(16)
    
    # Derive key for this specific record
    key = derive_record_key(salt)
    
    # Generate unique IV (nonce) for this encryption
    iv = secrets.token_bytes(12)  # 12 bytes for GCM
    
    # Encrypt with AES-256-GCM
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(iv, data.encode('utf-8'), None)
    
    # Combine IV + ciphertext for storage
    payload = iv + ciphertext
    
    # Return base64-encoded salt and payload
    salt_b64 = base64.b64encode(salt).decode('utf-8')
    payload_b64 = base64.b64encode(payload).decode('utf-8')
    
    return salt_b64, payload_b64

def decrypt_sensitive(salt_b64: str, payload_b64: str) -> str:
    """
    Decrypt sensitive data using the stored salt and encrypted payload.
    
    Args:
        salt_b64: Base64-encoded salt used for key derivation
        payload_b64: Base64-encoded encrypted payload (IV + ciphertext)
    
    Returns:
        Decrypted plaintext string
    
    Raises:
        ValueError: If decryption fails (tampered data or wrong key)
    """
    try:
        # Decode base64
        salt = base64.b64decode(salt_b64)
        payload = base64.b64decode(payload_b64)
        
        # Extract IV and ciphertext
        iv = payload[:12]
        ciphertext = payload[12:]
        
        # Derive the same key using the salt
        key = derive_record_key(salt)
        
        # Decrypt with AES-256-GCM
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(iv, ciphertext, None)
        
        return plaintext.decode('utf-8')
    except Exception as e:
        raise ValueError(f"Decryption failed: {str(e)}. Data may be tampered or key is incorrect.")

def hash_fingerprint(fingerprint_data: str) -> str:
    """
    Create a SHA-256 hash of normalized fingerprint data.
    Used for duplicate detection without decrypting stored templates.
    
    Args:
        fingerprint_data: Raw fingerprint sample
    
    Returns:
        Hex-encoded SHA-256 hash
    """
    # Normalize input
    normalized = fingerprint_data.strip().upper()
    
    # Create SHA-256 hash
    hash_obj = hashlib.sha256(normalized.encode('utf-8'))
    return hash_obj.hexdigest()

def hash_payment_data(payment_data: str) -> str:
    """
    Hash payment information for duplicate detection.
    
    Args:
        payment_data: Payment method identifier
    
    Returns:
        Hex-encoded SHA-256 hash
    """
    normalized = payment_data.strip().upper()
    hash_obj = hashlib.sha256(normalized.encode('utf-8'))
    return hash_obj.hexdigest()

def verify_fingerprint_match(sample: str, stored_hash: str) -> bool:
    """
    Verify if a fingerprint sample matches a stored hash.
    Used for authentication without decrypting stored templates.
    
    Args:
        sample: Fingerprint sample to verify
        stored_hash: Stored hash to compare against
    
    Returns:
        True if hash matches, False otherwise
    """
    sample_hash = hash_fingerprint(sample)
    return secrets.compare_digest(sample_hash, stored_hash)  # Constant-time comparison

def generate_secure_token(length: int = 32) -> str:
    """
    Generate a cryptographically secure random token.
    
    Args:
        length: Token length in bytes
    
    Returns:
        Hex-encoded token
    """
    return secrets.token_hex(length)

def mask_sensitive_string(data: str, visible_chars: int = 4) -> str:
    """
    Mask sensitive strings for logging/display (e.g., "****1234").
    
    Args:
        data: String to mask
        visible_chars: Number of characters to show at end
    
    Returns:
        Masked string
    """
    if len(data) <= visible_chars:
        return "*" * len(data)
    return "*" * (len(data) - visible_chars) + data[-visible_chars:]




