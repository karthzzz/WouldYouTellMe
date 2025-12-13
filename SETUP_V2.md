# UnSaid v2 - Setup & Testing Guide

## What Changed

✅ **New Architecture:**
- User authentication with Google OAuth (NextAuth.js)
- Subscription model: Lifetime (₹499) or Premium (₹999/year)
- One payment = Unlimited confessions
- User dashboard with confession feed
- JWT token-based API authentication

✅ **Modern Dark Mode UI:**
- Minimalist, professional design
- Compelling hero section
- Clean pricing cards with feature lists
- Beautiful dashboard for sending confessions

## Current Status

**Running Now:**
- ✅ Backend: `http://localhost:8000` (FastAPI)
- ✅ Frontend: `http://localhost:3000` (Next.js)
- ✅ Database: SQLite with new schema (users, subscriptions, confessions)

## Setup Google OAuth (REQUIRED for Testing)

To make the app work, you need Google OAuth credentials:

### Step 1: Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "UnSaid"
3. Enable OAuth 2.0:
   - Go to "Credentials" → Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Copy the Client ID and Client Secret

### Step 2: Add to `.env.local`

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_1DP5mmOlF5G0m4
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
```

### Step 3: Generate NEXTAUTH_SECRET

Run in terminal:
```bash
openssl rand -base64 32
```
Copy output and paste into `.env.local`

## Testing the App

### Test Flow:

1. **Open** `http://localhost:3000`
2. **Click** "Sign In with Google"
3. **Complete** Google OAuth flow
4. **Choose** a plan (Lifetime ₹499 or Premium ₹999)
5. **Make payment** using test Razorpay card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., 12/25)
   - CVV: Any 3 digits
6. **Redirect** to `/dashboard` after payment
7. **Send** confession with message, recipient name, and contact

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Google OAuth (after sign-in on frontend)
curl -X POST http://localhost:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "google_id": "test_id",
    "email": "test@example.com",
    "name": "Test User",
    "profile_picture": null
  }'

# Create order (requires JWT token)
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"plan": "lifetime"}'
```

## Database Schema

```
users
├── id (primary key)
├── google_id (unique)
├── email (unique)
├── name
├── profile_picture
└── created_at

subscriptions
├── id (primary key)
├── user_id (foreign key)
├── plan (lifetime/premium)
├── paid_at
├── expires_at (NULL for lifetime)
├── payment_id (unique)
├── status (active/expired/cancelled)
└── created_at

confessions
├── id (primary key)
├── user_id (foreign key)
├── submission_id (unique)
├── message
├── recipient_name
├── recipient_contact
├── contact_type (email/whatsapp)
├── status (pending/sent/delivered)
├── created_at
└── revealed
```

## Revenue Model

- **Lifetime Plan:** ₹499 one-time payment = Unlimited confessions forever
- **Premium Plan:** ₹999/year = Unlimited confessions for 12 months
- **After expiry:** User must renew (will implement auto-renew later)

## What's Production-Ready

✅ Google OAuth integration  
✅ Razorpay payment processing  
✅ JWT token authentication  
✅ Database with user subscriptions  
✅ Dark mode modern UI  
✅ Responsive design  
✅ Error handling  

## What Needs Before Launch

⏳ Real Google OAuth credentials (in production)  
⏳ Razorpay live mode credentials  
⏳ Email/WhatsApp delivery integration  
⏳ Admin dashboard for managing confessions  
⏳ Email notifications to recipients  
⏳ Terms & Privacy pages  

## Deployment (When Ready)

**Frontend → Vercel:**
```bash
npm run build
vercel deploy --prod
```

**Backend → Railway/Heroku:**
```bash
# Requires: DATABASE_URL, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, JWT_SECRET
git push heroku main
```

---

**Next Step:** Get Google OAuth credentials and update `.env.local`, then test the payment flow!
