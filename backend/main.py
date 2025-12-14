from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship, Session
from datetime import datetime, timedelta
import os
from typing import Optional
import uuid
import jwt
import hashlib

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./confessions.db")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_1DP5mmOlF5G0m4")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "XNjNWp2MmZX3jygOmXrmRd1K")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")

# Database setup
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    profile_picture = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    free_messages_remaining = Column(Integer, default=1)  # 1 free message per user
    device_used_free_message = Column(String, nullable=True)  # Device ID where free message was used
    is_developer = Column(Boolean, default=False)  # Developer bypass for unlimited messages
    
    subscriptions = relationship("Subscription", back_populates="user")
    confessions = relationship("Confession", back_populates="user")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    plan = Column(String)  # "lifetime" or "premium"
    paid_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # NULL = lifetime
    payment_id = Column(String, unique=True, index=True)
    status = Column(String, default="active")  # "active" or "cancelled"
    
    user = relationship("User", back_populates="subscriptions")

class Confession(Base):
    __tablename__ = "confessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    submission_id = Column(String, unique=True, index=True)
    message = Column(String, nullable=False)
    recipient_name = Column(String, nullable=False)
    recipient_contact = Column(String, nullable=False)
    contact_type = Column(String, nullable=False)  # "email" or "whatsapp"
    status = Column(String, default="pending")  # "pending", "sent", "delivered"
    created_at = Column(DateTime, default=datetime.utcnow)
    revealed = Column(Boolean, default=False)
    device_id = Column(String, nullable=True)  # Device ID for free message tracking
    is_free = Column(Boolean, default=False)  # Whether this used the free message
    
    user = relationship("User", back_populates="confessions")

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class GoogleAuthRequest(BaseModel):
    google_id: str
    email: str
    name: str
    profile_picture: Optional[str] = None

class CreateOrderRequest(BaseModel):
    plan: str  # "lifetime" or "premium"

class ConfessionSubmission(BaseModel):
    message: str = Field(..., min_length=10, max_length=2000)
    recipient_name: str = Field(..., min_length=2)
    recipient_contact: str
    contact_type: str  # "email" or "whatsapp"
    device_id: Optional[str] = None  # For tracking free messages per device

class PaymentConfirmation(BaseModel):
    payment_id: str
    order_id: str
    plan: str

# FastAPI app
app = FastAPI(title="UnSaid Backend", version="0.2.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "https://would-you-tell-me.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Validate JWT token and return current user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def create_jwt_token(user_id: int):
    """Create JWT token for user"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# API Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "version": "0.2.0"}

@app.post("/api/auth/google")
async def google_auth(request: GoogleAuthRequest, db: Session = Depends(get_db)):
    """Authenticate with Google OAuth"""
    try:
        # Check if user exists
        user = db.query(User).filter(User.google_id == request.google_id).first()
        
        if not user:
            # Create new user
            user = User(
                google_id=request.google_id,
                email=request.email,
                name=request.name,
                profile_picture=request.profile_picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        # Check if user has active subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).first()
        
        has_subscription = subscription is not None
        
        # Generate JWT token
        token = create_jwt_token(user.id)
        
        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "has_subscription": has_subscription
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/orders")
async def create_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a Razorpay order for subscription"""
    try:
        # Set amount based on plan
        amount_map = {
            "lifetime": 49900,  # ₹499 in paise
            "premium": 99900    # ₹999 in paise
        }
        
        amount = amount_map.get(request.plan, 49900)
        
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        
        order_response = client.order.create({
            "amount": amount,
            "currency": "INR",
            "receipt": f"subscription_{current_user.id}_{int(datetime.utcnow().timestamp())}",
            "payment_capture": 1,
        })
        
        return {
            "id": order_response["id"],
            "amount": order_response["amount"],
            "currency": order_response["currency"],
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed: {str(e)}")

@app.post("/api/subscriptions/confirm")
async def confirm_subscription(
    request: PaymentConfirmation,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Confirm subscription after payment"""
    try:
        # Check if subscription already exists for this payment
        existing = db.query(Subscription).filter(
            Subscription.payment_id == request.payment_id
        ).first()
        
        if existing:
            return {"status": "already_subscribed"}
        
        # Create subscription
        expires_at = None
        if request.plan == "premium":
            expires_at = datetime.utcnow() + timedelta(days=365)
        
        subscription = Subscription(
            user_id=current_user.id,
            plan=request.plan,
            payment_id=request.payment_id,
            expires_at=expires_at,
            status="active"
        )
        
        db.add(subscription)
        db.commit()
        
        return {
            "status": "success",
            "subscription": {
                "id": subscription.id,
                "plan": subscription.plan,
                "expires_at": subscription.expires_at.isoformat() if subscription.expires_at else None
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/confessions")
async def submit_confession(
    submission: ConfessionSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a confession - free for first message, then requires subscription"""
    try:
        # Check if user is a developer (unlimited messages)
        if current_user.is_developer:
            submission_id = str(uuid.uuid4())
            confession = Confession(
                user_id=current_user.id,
                submission_id=submission_id,
                message=submission.message,
                recipient_name=submission.recipient_name,
                recipient_contact=submission.recipient_contact,
                contact_type=submission.contact_type,
                status="pending",
                device_id=submission.device_id,
                is_free=False
            )
            db.add(confession)
            db.commit()
            return {
                "id": submission_id,
                "status": "submitted",
                "message": "Confession submitted successfully (developer mode)"
            }
        
        # Check if user has a free message available
        if current_user.free_messages_remaining > 0:
            submission_id = str(uuid.uuid4())
            confession = Confession(
                user_id=current_user.id,
                submission_id=submission_id,
                message=submission.message,
                recipient_name=submission.recipient_name,
                recipient_contact=submission.recipient_contact,
                contact_type=submission.contact_type,
                status="pending",
                device_id=submission.device_id,
                is_free=True
            )
            current_user.free_messages_remaining = 0
            current_user.device_used_free_message = submission.device_id
            db.add(confession)
            db.commit()
            return {
                "id": submission_id,
                "status": "submitted",
                "message": "Confession submitted successfully (free message used)",
                "free_messages_remaining": 0
            }
        
        # Check if user has active subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.status == "active"
        ).first()
        
        if not subscription:
            raise HTTPException(status_code=403, detail="No free messages or active subscription. Please purchase a plan.")
        
        # Check if premium subscription expired
        if subscription.expires_at and subscription.expires_at < datetime.utcnow():
            subscription.status = "expired"
            db.commit()
            raise HTTPException(status_code=403, detail="Subscription expired. Please renew.")
        
        # Create confession for subscribed user
        submission_id = str(uuid.uuid4())
        confession = Confession(
            user_id=current_user.id,
            submission_id=submission_id,
            message=submission.message,
            recipient_name=submission.recipient_name,
            recipient_contact=submission.recipient_contact,
            contact_type=submission.contact_type,
            status="pending",
            device_id=submission.device_id,
            is_free=False
        )
        
        db.add(confession)
        db.commit()
        
        return {
            "id": submission_id,
            "status": "submitted",
            "message": "Confession submitted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/confessions")
async def get_user_confessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all confessions sent by current user"""
    try:
        confessions = db.query(Confession).filter(
            Confession.user_id == current_user.id
        ).order_by(Confession.created_at.desc()).all()
        
        return {
            "confessions": [
                {
                    "id": c.submission_id,
                    "message": c.message,
                    "recipient": c.recipient_name,
                    "contact": c.recipient_contact,
                    "contact_type": c.contact_type,
                    "status": c.status,
                    "created_at": c.created_at.isoformat(),
                    "revealed": c.revealed
                }
                for c in confessions
            ],
            "total": len(confessions)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/webhooks/razorpay")
async def razorpay_webhook(payload: dict, db: Session = Depends(get_db)):
    """Handle Razorpay payment webhooks"""
    try:
        event_type = payload.get("event")
        
        if event_type == "payment.authorized":
            payment_data = payload.get("payload", {}).get("payment", {}).get("entity", {})
            payment_id = payment_data.get("id")
            
            print(f"Payment authorized: {payment_id}")
        
        return {"status": "received"}
    except Exception as e:
        print(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}


@app.post("/api/dev/enable-testing")
async def enable_developer_mode(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable developer mode for unlimited free testing (ONLY for authenticated user)"""
    # You can add additional checks here like email whitelist
    current_user.is_developer = True
    db.commit()
    return {
        "status": "success",
        "message": f"Developer mode enabled for {current_user.email}",
        "unlimited_messages": True
    }


@app.get("/api/user/status")
async def get_user_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's subscription and free message status"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "is_developer": current_user.is_developer,
        "free_messages_remaining": current_user.free_messages_remaining,
        "has_subscription": subscription is not None,
        "subscription_plan": subscription.plan if subscription else None,
        "can_send_message": current_user.free_messages_remaining > 0 or current_user.is_developer or subscription is not None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
