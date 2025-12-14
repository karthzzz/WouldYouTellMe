# WouldYouTellMe - Production Setup Guide

## 🚀 Quick Overview

**Frontend:** https://would-you-tell-me.vercel.app/  
**Backend:** https://wouldyoutellme-production.up.railway.app  
**Stack:** Next.js 15 + FastAPI + SQLite + Brevo Email Service

---

## 📋 Pre-requisites

- ✅ Frontend deployed on Vercel
- ✅ Backend deployed on Railway
- ✅ Google OAuth configured
- ⏳ Email service (Brevo) configured
- ⏳ Razorpay payment gateway setup

---

## 🔧 Backend Configuration

### Step 1: Set Up Email Service (Brevo)

1. **Sign up** at https://www.brevo.com/ (free account)
2. **Get your API key:**
   - Go to Settings → API Keys
   - Create a new API key
   - Copy the key

3. **Add to Railway environment variables:**
   ```
   BREVO_API_KEY=your_api_key_here
   ```

4. **Verify sender email:**
   - In Brevo, add `noreply@wouldyoutellme.com` as a verified sender
   - Or update the sender email in `backend/main.py` line ~155

### Step 2: Verify Railway Environment Variables

Go to Railway Dashboard → Your Project → Variables

Required variables:
```
DATABASE_URL=sqlite:///./confessions.db
FRONTEND_URL=https://would-you-tell-me.vercel.app
JWT_SECRET=your-secret-key
ADMIN_SECRET=your-secret-key
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-secret
BREVO_API_KEY=your-brevo-api-key
```

---

## 🌐 Frontend Configuration

### Step 1: Set Up Vercel Environment Variables

Go to Vercel → Project Settings → Environment Variables

Add these variables (with values from Railway):
```
NEXTAUTH_SECRET=<generate-new-random-string>
NEXTAUTH_URL=https://would-you-tell-me.vercel.app
NEXT_PUBLIC_API_URL=https://wouldyoutellme-production.up.railway.app
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
NEXT_PUBLIC_RAZORPAY_KEY=<your-razorpay-test-key>
```

**To generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# or in Python:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 2: Update Google OAuth

Go to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs

**Update these URLs:**
- **Authorized JavaScript origins:**
  - https://would-you-tell-me.vercel.app

- **Authorized redirect URIs:**
  - https://would-you-tell-me.vercel.app/api/auth/callback/google

### Step 3: Redeploy Frontend

After adding environment variables:
1. Go to Vercel Deployments
2. Click the latest deployment
3. Click **Redeploy** button
4. Wait for build to complete

---

## 💰 Payment Gateway Setup (Optional - Not Required for Testing)

### Razorpay Configuration

1. **Sign up** at https://razorpay.com/
2. **Get test credentials:**
   - Go to Account Settings → API Keys
   - Copy Test Key ID and Test Secret
3. **Add to Railway:**
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxx
   RAZORPAY_KEY_SECRET=xxxx
   ```
4. **Test payment:**
   - Use card: `4111 1111 1111 1111`
   - Any future date and any CVV

---

## ✅ Testing the System

### Test Free Message Flow

1. **Go to:** https://would-you-tell-me.vercel.app/
2. **Click:** "Send a Confession"
3. **Sign in** with Google
4. **Fill form:**
   - Message: "Test confession"
   - Recipient: "John Doe"
   - Email: your-test-email@gmail.com
   - Click: "Send Confession"
5. **Check:**
   - ✅ Success message shows submission ID
   - ✅ Email received in recipient's inbox (5-10 seconds)

### Test Developer Mode (Unlimited Messages)

1. **Get your JWT token** from browser:
   ```javascript
   // In browser console after sign-in:
   console.log(sessionStorage.getItem('token'))
   ```

2. **Enable developer mode:**
   ```bash
   curl -X POST "https://wouldyoutellme-production.up.railway.app/api/dev/enable-testing" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Send unlimited messages** without using free message or subscription

### Test Subscription Flow

1. **Sign in** with new account
2. **Use free message** (should succeed)
3. **Try to send 2nd message** without subscription (should be blocked)
4. **Click "Upgrade"** to see payment flow

---

## 🔍 Monitoring & Debugging

### Check Backend Logs

```bash
# Railway logs
railway logs --service main

# Or from Railway Dashboard → Logs tab
```

### Check Email Status

- **Brevo Dashboard:** https://app.brevo.com/
  - Go to Emails → Transactional Emails
  - See delivery status, bounces, etc.

### Common Issues

**Email not delivered:**
- ✓ Check BREVO_API_KEY is correct
- ✓ Check sender email is verified in Brevo
- ✓ Check recipient email is valid
- ✓ Check Brevo logs for error details

**Free message not working:**
- ✓ Clear browser localStorage: `localStorage.clear()`
- ✓ Check database has `free_messages_remaining` column
- ✓ Check backend logs for errors

**Google OAuth failing:**
- ✓ Verify redirect URI matches exactly
- ✓ Check credentials are in Vercel env vars
- ✓ Try incognito mode

---

## 📊 Key Endpoints

### Public Endpoints
- `POST /api/auth/google` - Google OAuth
- `POST /api/orders` - Create Razorpay order

### Authenticated Endpoints
- `POST /api/confessions` - Submit confession
- `GET /api/confessions` - List user's confessions
- `GET /api/confessions/{id}/status` - Check delivery status
- `GET /api/user/status` - Check if user can send message
- `POST /api/dev/enable-testing` - Enable developer mode
- `POST /api/subscriptions/confirm` - Confirm payment

---

## 🔐 Security Notes

1. **Never commit .env files** - Already in .gitignore
2. **API keys should be in Railway variables**, not code
3. **JWT tokens expire** - Refresh on sign-out
4. **CORS is configured** for Vercel domains only
5. **Database is SQLite** (development only) - upgrade for production

---

## 📈 Next Steps

1. ✅ Email delivery working
2. ⏳ Setup analytics (Google Analytics, Mixpanel)
3. ⏳ Implement SMS delivery (Twilio)
4. ⏳ Add admin dashboard to view all confessions
5. ⏳ Implement message editing/deletion
6. ⏳ Add rate limiting to prevent abuse

---

## 🆘 Support

**Issues?** Check:
1. Backend logs: `railway logs`
2. Brevo logs: https://app.brevo.com/emails
3. Frontend console: F12 → Console tab
4. Vercel build logs: https://vercel.com/dashboard

