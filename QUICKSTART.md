# 🚀 Quick Start - Testing UnSaid v2

## Current Status
✅ Backend running: `http://localhost:8000`  
✅ Frontend running: `http://localhost:3000`  
✅ Database created: `confessions.db`  

## What You Need to Do NOW (15 minutes)

### 1. Get Google OAuth Credentials (5 mins)
```
1. Go to: https://console.cloud.google.com/
2. Create new project: "UnSaid"
3. APIs & Services → Credentials
4. Create OAuth 2.0 Client ID
   - Type: Web application
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
5. Copy Client ID and Secret
```

### 2. Update Frontend Config (2 mins)
Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_1DP5mmOlF5G0m4
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=my-super-secret-nextauth-key-12345
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_FROM_GOOGLE
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_FROM_GOOGLE
```

### 3. Restart Frontend (1 min)
```bash
# Kill old frontend
taskkill /F /IM node.exe

# Restart
cd c:\Users\vksai\pythonStuff\UnSaid\frontend
npm run dev
```

### 4. Test the Flow (7 mins)
```
1. Open: http://localhost:3000
2. Click: "Sign In with Google"
3. Complete: Google OAuth flow
4. Choose: "Lifetime" (₹499) or "Premium" (₹999)
5. Pay with test card:
   Card: 4111 1111 1111 1111
   Expiry: 12/25
   CVV: 123
6. Verify: You land on /dashboard
7. Send: A test confession
8. Check: It appears in your history
```

## API Endpoints (for testing)

```bash
# Health
curl http://localhost:8000/health

# You'll get JWT token from Google sign-in on frontend
# Then use it for these:

# Get your confessions
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/confessions

# Create order
curl -X POST http://localhost:8000/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "lifetime"}'

# Confirm subscription (after payment)
curl -X POST http://localhost:8000/api/subscriptions/confirm \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_id": "pay_xxx",
    "order_id": "order_xxx",
    "plan": "lifetime"
  }'
```

## Expected User Journey

```
Landing Page
     ↓
Sign In with Google (NEW)
     ↓
Choose Plan (₹499 or ₹999)
     ↓
Make Payment (Razorpay)
     ↓
Dashboard ← Subscription activated
     ↓
Send Confessions (UNLIMITED)
     ↓
View Confession History
```

## What's Different from v1

| Feature | v1 | v2 |
|---------|----|----|
| Payment Model | Per confession ❌ | One payment, unlimited ✅ |
| User Accounts | No ❌ | Google OAuth ✅ |
| Auth | None ❌ | JWT tokens ✅ |
| Subscriptions | None ❌ | Lifetime + Annual ✅ |
| UI | Minimal | Modern dark mode ✅ |
| Revenue | Bad | Good ✅ |

## If Something Breaks

**Frontend not loading?**
```bash
cd frontend
npm install  # Reinstall deps
npm run dev  # Restart
```

**Backend errors?**
```bash
cd backend
pip install -r requirements.txt  # Reinstall
python main.py  # Restart
```

**Database issues?**
```bash
# Delete old database
rm confessions.db
# It will auto-recreate with new schema
```

## Goal: ₹50,000 in One Week

**Math:**
- 100 users × ₹499 (lifetime) = ₹49,900 ✓
- 50 users × ₹999 (premium) = ₹49,950 ✓

**Your job now:** Test, make sure it works perfectly, then LAUNCH!

---

**Questions?** Check these files:
- `REBUILD_SUMMARY.md` - Full technical details
- `SETUP_V2.md` - Detailed setup guide
- `backend/main.py` - API code
- `frontend/app/page.tsx` - UI code

**Next milestone:** Launch to 100 users by end of week! 🎯
