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
import httpx
import asyncio
import logging
import traceback
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure detailed logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
)
logger = logging.getLogger(__name__)

# Environment variables
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./confessions.db")
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_1DP5mmOlF5G0m4")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "XNjNWp2MmZX3jygOmXrmRd1K")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-key-change-in-production")
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")  # Get from https://www.brevo.com/
BREVO_API_URL = "https://api.brevo.com/v3"

# Log startup info
logger.info("🚀 Starting UnSaid Backend Server...")
logger.debug(f"Database URL: {os.getenv('DATABASE_URL', 'sqlite:///./confessions.db')}")
logger.debug(f"Frontend URL: {os.getenv('FRONTEND_URL', 'http://localhost:3000')}")
logger.debug(f"Brevo API configured: {'Yes' if os.getenv('BREVO_API_KEY') else 'No'}")
if JWT_SECRET:
    logger.debug(f"JWT Secret loaded: {JWT_SECRET[:20]}...")
else:
    logger.debug("JWT Secret: NOT CONFIGURED")

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

# Add global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for all unhandled errors"""
    logger.error(f"🔴 UNHANDLED EXCEPTION: {str(exc)}\n{traceback.format_exc()}")
    logger.error(f"   Request: {request.method} {request.url}")
    logger.error(f"   Client: {request.client.host if request.client else 'Unknown'}")
    
    return {
        "error": "Internal Server Error",
        "detail": str(exc),
        "type": type(exc).__name__,
        "path": str(request.url),
        "timestamp": datetime.utcnow().isoformat()
    }

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    """Log all incoming requests"""
    logger.debug(f"→ {request.method} {request.url.path} from {request.client.host if request.client else 'Unknown'}")
    try:
        response = await call_next(request)
        logger.debug(f"← {request.method} {request.url.path} - Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"❌ Request failed: {request.method} {request.url.path} - {str(e)}")
        raise

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

# Email delivery service
async def send_email_via_brevo(to_email: str, subject: str, html_content: str, sender_name: str = "WouldYouTellMe"):
    """Send email via Brevo (formerly Sendinblue)"""
    logger.info(f"📧 Sending email to {to_email} - Subject: {subject}")
    
    if not BREVO_API_KEY:
        logger.error(f"❌ Brevo API key not configured. Email NOT sent to {to_email}")
        logger.warning("⚠️  Set BREVO_API_KEY environment variable to enable email delivery")
        return False
    
    try:
        logger.debug(f"🔗 Connecting to Brevo API: {BREVO_API_URL}/smtp/email")
        async with httpx.AsyncClient() as client:
            payload = {
                "sender": {"name": sender_name, "email": "vksai17@gmail.com"},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content
            }
            logger.debug(f"📤 Payload: {json.dumps({'sender': payload['sender'], 'to': payload['to'], 'subject': payload['subject']})}")
            
            response = await client.post(
                f"{BREVO_API_URL}/smtp/email",
                headers={
                    "api-key": BREVO_API_KEY,  # Use full key
                    "Content-Type": "application/json"
                },
                json=payload,
                timeout=10.0
            )
            
            logger.debug(f"📬 Brevo Response Status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ Email successfully sent to {to_email}")
                return True
            else:
                logger.error(f"❌ Brevo API error ({response.status_code}): {response.text}")
                return False
    except httpx.TimeoutException:
        logger.error(f"❌ Timeout sending email to {to_email} (request took >10s)")
        return False
    except httpx.ConnectError as e:
        logger.error(f"❌ Connection error to Brevo API: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected email error for {to_email}: {str(e)}\n{traceback.format_exc()}")
        return False


async def send_whatsapp_via_twilio(phone: str, message: str):
    """Send WhatsApp message via Twilio"""
    # Placeholder - implement if needed
    print(f"📱 WhatsApp delivery to {phone}: {message}")
    return True


async def deliver_confession(confession, recipient_email: str, recipient_name: str):
    """Deliver confession to recipient and update status"""
    logger.info(f"📬 Starting delivery for confession {confession.submission_id}")
    logger.debug(f"   To: {recipient_name} ({recipient_email})")
    logger.debug(f"   Type: {confession.contact_type}")
    logger.debug(f"   Message length: {len(confession.message)} chars")
    
    try:
        subject = f"✨ Someone shared something with you on WouldYouTellMe"
        
        # Create professional HTML email with improved branding and emotional appeal
        html_content = f"""
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
                    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }}
                    .wrapper {{ background: #f8f9fa; padding: 40px 20px; }}
                    .container {{ background: white; padding: 0; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }}
                    .brand-header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }}
                    .brand-header h1 {{ font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px; }}
                    .brand-header p {{ font-size: 14px; opacity: 0.9; font-weight: 500; }}
                    .content {{ padding: 40px 30px; }}
                    .greeting {{ font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6; }}
                    .greeting strong {{ color: #667eea; }}
                    .confession-box {{ background: linear-gradient(to right, #f8f9ff, #ffffff); border: 2px solid #e8eaf6; border-left: 5px solid #667eea; padding: 25px; margin: 30px 0; border-radius: 8px; }}
                    .confession-box p {{ font-size: 16px; color: #222; line-height: 1.8; font-style: italic; }}
                    .highlight {{ color: #667eea; font-weight: 600; }}
                    .divider {{ height: 1px; background: #e8eaf6; margin: 30px 0; }}
                    .privacy-notice {{ background: #f0f4ff; padding: 15px; border-radius: 8px; font-size: 13px; color: #555; line-height: 1.6; }}
                    .privacy-notice strong {{ color: #667eea; }}
                    .cta-section {{ text-align: center; margin: 30px 0 0 0; }}
                    .cta-button {{ display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; transition: transform 0.2s; }}
                    .cta-button:hover {{ transform: translateY(-2px); }}
                    .footer {{ background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e8eaf6; }}
                    .footer p {{ font-size: 12px; color: #999; margin: 5px 0; }}
                    .footer-brand {{ font-size: 14px; color: #667eea; font-weight: 600; margin-top: 10px; }}
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="brand-header">
                            <h1>💌 WouldYouTellMe</h1>
                            <p>Someone just shared their truth with you</p>
                        </div>
                        
                        <div class="content">
                            <div class="greeting">
                                Hi <strong>{recipient_name}</strong>,
                                <p style="margin-top: 12px;">Someone you know trusted us with something they couldn't say out loud. They chose <span class="highlight">you</span> to receive their confession.</p>
                            </div>
                            
                            <div class="confession-box">
                                <p>"{confession.message}"</p>
                            </div>
                            
                            <p style="color: #555; line-height: 1.8; margin: 20px 0;">
                                This person took courage to share what's on their mind. Their identity is completely protected, but their words matter. What they needed you to know is above.
                            </p>
                            
                            <div class="divider"></div>
                            
                            <div class="privacy-notice">
                                <strong>🔒 Your Privacy Matters:</strong><br>
                                The sender's identity is completely hidden. We don't share personal information. This message comes from our secure system designed to protect both the sender and recipient.
                            </div>
                            
                            <div class="footer">
                                <p style="margin-top: 15px;">Sent via <span class="footer-brand">WouldYouTellMe</span></p>
                                <p>{{recipient_email}}</p>
                                <p>Questions? Visit <strong>wouldyoutellme.com</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
        """
        
        if confession.contact_type == "email":
            logger.info(f"📧 Routing to email delivery")
            success = await send_email_via_brevo(recipient_email, subject, html_content)
        else:  # whatsapp
            logger.info(f"📱 Routing to WhatsApp delivery")
            success = await send_whatsapp_via_twilio(recipient_email, confession.message)
        
        # Update confession status in database after delivery
        if success:
            logger.info(f"✅ Delivery successful, updating database...")
            db = SessionLocal()
            try:
                confession_db = db.query(Confession).filter(
                    Confession.id == confession.id
                ).first()
                if confession_db:
                    confession_db.status = "sent"
                    db.commit()
                    logger.info(f"✅ Confession {confession.submission_id} status updated to 'sent'")
                else:
                    logger.error(f"❌ Could not find confession in DB to update: {confession.submission_id}")
            except Exception as e:
                logger.error(f"❌ Error updating confession status: {str(e)}\n{traceback.format_exc()}")
            finally:
                db.close()
        else:
            logger.warning(f"⚠️  Delivery failed for {confession.submission_id}, status remains 'pending'")
        
        return success
    except Exception as e:
        logger.error(f"❌ Delivery error for {confession.submission_id}: {str(e)}\n{traceback.format_exc()}")
        return False

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Validate JWT token and return current user"""
    logger.debug(f"🔐 Validating token: {authorization[:50] if authorization else 'None'}...")
    logger.debug(f"🔑 Using JWT_SECRET: {JWT_SECRET[:20]}..." if JWT_SECRET else "🔑 JWT_SECRET NOT SET")
    
    if not authorization:
        logger.error("❌ Missing authorization header")
        raise HTTPException(status_code=401, detail="Missing authorization header. Expected: Authorization: Bearer <token>")
    
    try:
        token = authorization.replace("Bearer ", "")
        logger.debug(f"📝 Extracted token: {token[:50]}...")
        
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        logger.debug(f"✅ Token decoded successfully: {payload}")
        
        user_id = payload.get("user_id")
        
        if not user_id:
            logger.error("❌ Token missing user_id claim")
            raise HTTPException(status_code=401, detail="Invalid token: Missing user_id claim")
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"❌ User not found in database: user_id={user_id}")
            raise HTTPException(status_code=401, detail=f"User not found: user_id={user_id}")
        
        logger.debug(f"✅ User authenticated: {user.email} (ID: {user.id})")
        return user
        
    except jwt.ExpiredSignatureError:
        logger.error("❌ Token expired")
        raise HTTPException(status_code=401, detail="Token expired. Please sign in again.")
    except jwt.InvalidTokenError as e:
        logger.error(f"❌ Invalid token: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Unexpected error validating token: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

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
    logger.info(f"🔑 Google Auth Request - Email: {request.email}, Name: {request.name}")
    try:
        # Check if user exists
        user = db.query(User).filter(User.google_id == request.google_id).first()
        
        if not user:
            logger.info(f"📝 Creating new user: {request.email}")
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
            logger.info(f"✅ User created successfully: ID={user.id}, Email={user.email}")
        else:
            logger.info(f"👤 User already exists: ID={user.id}, Email={user.email}")
        
        # Check if user has active subscription
        subscription = db.query(Subscription).filter(
            Subscription.user_id == user.id,
            Subscription.status == "active"
        ).first()
        
        has_subscription = subscription is not None
        logger.debug(f"💳 Subscription status: {has_subscription}")
        
        # Generate JWT token
        token = create_jwt_token(user.id)
        logger.debug(f"🔐 JWT token generated: {token[:50]}...")
        
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
        logger.error(f"❌ Auth error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

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
    logger.info(f"📝 Confession submission from user {current_user.id} ({current_user.email})")
    logger.debug(f"   To: {submission.recipient_name}, Type: {submission.contact_type}, Message length: {len(submission.message)}")
    
    try:
        # Check if user is a developer (unlimited messages)
        if current_user.is_developer:
            logger.debug(f"👨‍💻 Developer mode active for user {current_user.id}")
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
            db.refresh(confession)
            logger.info(f"✅ Confession saved (developer): ID={submission_id}")
            
            # Send email asynchronously
            asyncio.create_task(deliver_confession(confession, submission.recipient_contact, submission.recipient_name))
            
            return {
                "submission_id": submission_id,
                "status": "submitted",
                "message": "Confession submitted successfully (developer mode)"
            }
        
        # Check if user has a free message available
        logger.debug(f"📊 User free messages available: {current_user.free_messages_remaining}")
        if current_user.free_messages_remaining > 0:
            logger.info(f"🎁 Using free message for user {current_user.id}")
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
            db.refresh(confession)
            logger.info(f"✅ Confession saved (free message): ID={submission_id}")
            
            # Send email asynchronously
            asyncio.create_task(deliver_confession(confession, submission.recipient_contact, submission.recipient_name))
            
            return {
                "submission_id": submission_id,
                "status": "submitted",
                "message": "Confession submitted successfully (free message used)",
                "free_messages_remaining": 0
            }
        
        # Check if user has active subscription
        logger.debug(f"💳 Checking subscription for user {current_user.id}")
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.status == "active"
        ).first()
        
        if not subscription:
            logger.warning(f"⚠️ No subscription/free messages for user {current_user.id}")
            raise HTTPException(
                status_code=403, 
                detail="No free messages or active subscription. Please purchase a plan."
            )
        
        # Check if premium subscription expired
        if subscription.expires_at and subscription.expires_at < datetime.utcnow():
            logger.warning(f"⏰ Subscription expired for user {current_user.id}")
            subscription.status = "expired"
            db.commit()
            raise HTTPException(status_code=403, detail="Subscription expired. Please renew.")
        
        logger.info(f"💳 Using subscription for user {current_user.id}")
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
        db.refresh(confession)
        logger.info(f"✅ Confession saved (subscription): ID={submission_id}")
        
        # Send email asynchronously
        asyncio.create_task(deliver_confession(confession, submission.recipient_contact, submission.recipient_name))
        
        return {
            "submission_id": submission_id,
            "status": "submitted",
            "message": "Confession submitted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Confession submission error: {str(e)}\n{traceback.format_exc()}")
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Submission failed: {str(e)}")

@app.get("/api/confessions")
async def get_user_confessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all confessions sent by current user"""
    logger.info(f"📋 Fetching confessions for user {current_user.id} ({current_user.email})")
    try:
        confessions = db.query(Confession).filter(
            Confession.user_id == current_user.id
        ).order_by(Confession.created_at.desc()).all()
        
        logger.info(f"✅ Found {len(confessions)} confessions for user {current_user.id}")
        logger.debug(f"   Statuses: {[c.status for c in confessions]}")
        
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
        logger.error(f"❌ Error fetching confessions: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=f"Failed to fetch confessions: {str(e)}")


@app.get("/api/confessions/{submission_id}/status")
async def get_confession_status(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get delivery status of a specific confession"""
    try:
        confession = db.query(Confession).filter(
            Confession.submission_id == submission_id,
            Confession.user_id == current_user.id
        ).first()
        
        if not confession:
            raise HTTPException(status_code=404, detail="Confession not found")
        
        return {
            "id": confession.submission_id,
            "status": confession.status,
            "recipient": confession.recipient_name,
            "contact_type": confession.contact_type,
            "is_free": confession.is_free,
            "created_at": confession.created_at.isoformat(),
            "delivery_status": "delivered" if confession.status == "sent" else "pending",
            "message": f"Confession {'delivered' if confession.status == 'sent' else 'pending delivery'}"
        }
    except HTTPException:
        raise
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
    logger.info(f"📊 Fetching user status for {current_user.email}")
    try:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.status == "active"
        ).first()
        
        user_status = {
            "user_id": current_user.id,
            "email": current_user.email,
            "name": current_user.name,
            "is_developer": current_user.is_developer,
            "free_messages_remaining": current_user.free_messages_remaining,
            "has_subscription": subscription is not None,
            "subscription_plan": subscription.plan if subscription else None,
            "can_send_message": current_user.free_messages_remaining > 0 or current_user.is_developer or subscription is not None
        }
        
        logger.debug(f"✅ User status: {json.dumps({k: v for k, v in user_status.items() if k != 'email'})}")
        return user_status
    except Exception as e:
        logger.error(f"❌ Error fetching user status: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user status: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
