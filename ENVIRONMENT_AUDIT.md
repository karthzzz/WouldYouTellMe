# 🔐 ENVIRONMENT VARIABLES AUDIT

## LOCAL DEVELOPMENT (.env files)

### Backend `.env`
```
RAZORPAY_KEY_ID=rzp_test_placeholder       ⚠️ PLACEHOLDER (needs real key)
RAZORPAY_KEY_SECRET=your-razorpay-secret   ⚠️ PLACEHOLDER (needs real key)
DATABASE_URL=sqlite:///./confessions.db    ✅ SQLite for local dev
FRONTEND_URL=https://would-you-tell-me.vercel.app  ✅ Production URL
ADMIN_SECRET=d8e1f2a3b4c...                ✅ Set (should be rotated)
JWT_SECRET=a7f9e2b5d1c3f8a6...             ✅ Set (should be rotated)
BREVO_API_KEY=xkeysib-e0a349...            ✅ CONFIGURED
```

### Frontend `.env.local`
```
NEXT_PUBLIC_RAZORPAY_KEY=rzp_test_placeholder       ⚠️ PLACEHOLDER
NEXT_PUBLIC_API_URL=http://localhost:8000          ✅ Local backend
NEXTAUTH_SECRET=a7f9e2b5d1c3f8a6...                ✅ Set
NEXTAUTH_URL=http://localhost:3000                 ✅ Local frontend
GOOGLE_CLIENT_ID=519706115078-8iekuuk...           ✅ CONFIGURED
GOOGLE_CLIENT_SECRET=GOCSPX-FR62t5zifC...          ✅ CONFIGURED
```

---

## PRODUCTION REQUIREMENTS (Railway)

### Backend Environment Variables Needed on Railway

| Variable | Current | Status | Priority |
|----------|---------|--------|----------|
| `RAZORPAY_KEY_ID` | `rzp_test_placeholder` | ⚠️ PLACEHOLDER | HIGH |
| `RAZORPAY_KEY_SECRET` | `your-razorpay-secret` | ⚠️ PLACEHOLDER | HIGH |
| `DATABASE_URL` | `sqlite:///./confessions.db` | ⚠️ WRONG FOR PROD | CRITICAL |
| `FRONTEND_URL` | `https://would-you-tell-me.vercel.app` | ✅ Correct | LOW |
| `JWT_SECRET` | Set | ⚠️ Should rotate | MEDIUM |
| `ADMIN_SECRET` | Set | ⚠️ Should rotate | MEDIUM |
| `BREVO_API_KEY` | `xkeysib-e0a34926...` | ✅ SET | LOW (working) |

### Frontend Environment Variables Needed on Vercel

| Variable | Current | Status | Priority |
|----------|---------|--------|----------|
| `NEXT_PUBLIC_RAZORPAY_KEY` | `rzp_test_placeholder` | ⚠️ PLACEHOLDER | HIGH |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | ⚠️ WRONG FOR PROD | CRITICAL |
| `NEXTAUTH_SECRET` | Set | ✅ Correct | LOW |
| `NEXTAUTH_URL` | `http://localhost:3000` | ⚠️ WRONG FOR PROD | CRITICAL |
| `GOOGLE_CLIENT_ID` | Set | ✅ Correct | LOW |
| `GOOGLE_CLIENT_SECRET` | Set | ✅ Correct | LOW |

---

## CRITICAL ISSUES ⚠️

### 1. FRONTEND API URL IS LOCALHOST (CRITICAL)
**Current**: `NEXT_PUBLIC_API_URL=http://localhost:8000`
**Should be**: Your Railway backend URL (e.g., `https://unsaid-backend.up.railway.app`)
**Impact**: Frontend won't be able to reach backend in production

**Fix for Vercel**:
```
NEXT_PUBLIC_API_URL=https://your-railway-backend-url
```

### 2. FRONTEND NEXTAUTH_URL IS LOCALHOST (CRITICAL)
**Current**: `NEXTAUTH_URL=http://localhost:3000`
**Should be**: `https://would-you-tell-me.vercel.app`
**Impact**: NextAuth callbacks won't work in production

**Fix for Vercel**:
```
NEXTAUTH_URL=https://would-you-tell-me.vercel.app
```

### 3. DATABASE IS SQLite (CRITICAL FOR PRODUCTION)
**Current**: `DATABASE_URL=sqlite:///./confessions.db`
**Should be**: PostgreSQL connection string
**Impact**: 
- SQLite doesn't work well on Railway (file-based)
- Data loss on redeploy
- Not scalable

**Fix for Railway**:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

Get from Railway:
1. Go to Railway.app → UnSaid project
2. Click on Database plugin (or create one)
3. Copy the connection string

### 4. RAZORPAY KEYS ARE PLACEHOLDERS
**Current**: `rzp_test_placeholder`
**Should be**: Real Razorpay test/production keys
**Impact**: Payments won't work

**Where to get**:
1. Go to https://razorpay.com
2. Sign in to dashboard
3. Settings → API Keys
4. Copy Key ID and Secret

### 5. MISSING EMAIL CONFIGURATION
**Current**: Using Brevo API ✅ (working)
**Issue**: No SMTP fallback if API fails
**Optional Enhancement**: Add SMTP config as backup

---

## STEP-BY-STEP FIX FOR PRODUCTION

### Step 1: Get Railway Backend URL
1. Go to https://railway.app
2. Select UnSaid project
3. Select Backend service
4. Click "Connect" or look for domain
5. Copy the public URL (e.g., `https://unsaid-backend-production.up.railway.app`)

### Step 2: Configure Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add/Update:

```
NEXT_PUBLIC_API_URL=https://unsaid-backend-production.up.railway.app
NEXTAUTH_URL=https://would-you-tell-me.vercel.app
NEXT_PUBLIC_RAZORPAY_KEY=rzp_live_XXXXXX  (when ready)
NEXTAUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=existing-key
GOOGLE_CLIENT_SECRET=existing-key
```

### Step 3: Configure Railway Backend Environment Variables
1. Go to https://railway.app
2. Select UnSaid → Backend
3. Click "Variables" tab
4. Add/Update:

```
DATABASE_URL=postgresql://...  (from Railway PostgreSQL plugin)
FRONTEND_URL=https://would-you-tell-me.vercel.app
JWT_SECRET=your-secret-here
ADMIN_SECRET=your-secret-here
BREVO_API_KEY=xkeysib-e0a34926... (already set)
RAZORPAY_KEY_ID=rzp_test_XXXXXX
RAZORPAY_KEY_SECRET=your-secret-here
```

### Step 4: Create PostgreSQL Database on Railway
1. Go to Railway project
2. Click "Create" → Select "PostgreSQL"
3. Wait for deployment
4. Go to Variables tab, copy `DATABASE_URL`
5. Paste into Backend environment variables

### Step 5: Redeploy Both Services
1. Railway will auto-deploy backend
2. Vercel will auto-deploy frontend on env var change
3. Test with a live submission

---

## SECRETS THAT SHOULD BE ROTATED

These are visible in the codebase and should be changed before production:

- ✅ `JWT_SECRET` - Good, generate a new strong one
- ✅ `ADMIN_SECRET` - Good, generate a new strong one
- ✅ `NEXTAUTH_SECRET` - Good, generate a new strong one
- ✅ `BREVO_API_KEY` - Good, this is production ready

### Generate New Secrets
```bash
# Generate random 32-character secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## CHECKLIST FOR PRODUCTION

### Backend (Railway)
- [ ] Database URL set to PostgreSQL (not SQLite)
- [ ] BREVO_API_KEY configured ✅
- [ ] JWT_SECRET set to strong value
- [ ] ADMIN_SECRET set to strong value
- [ ] RAZORPAY keys configured (if using payments)
- [ ] FRONTEND_URL set correctly
- [ ] Deploy triggered

### Frontend (Vercel)
- [ ] NEXT_PUBLIC_API_URL points to Railway backend
- [ ] NEXTAUTH_URL points to production domain
- [ ] GOOGLE_CLIENT_ID configured
- [ ] GOOGLE_CLIENT_SECRET configured
- [ ] NEXTAUTH_SECRET set to strong value
- [ ] Deploy triggered

### Testing
- [ ] Submit confession on production
- [ ] Check email delivery
- [ ] Verify data in database
- [ ] Test Google login
- [ ] Check dashboard loads

---

## SUMMARY

**Missing/Wrong in Production Setup**:
1. ⚠️ **CRITICAL**: Frontend API URL is localhost
2. ⚠️ **CRITICAL**: Frontend NEXTAUTH_URL is localhost
3. ⚠️ **CRITICAL**: Database is SQLite (needs PostgreSQL)
4. ⚠️ **HIGH**: Razorpay keys are placeholders
5. ✅ Brevo API key is configured

**Everything else is set!**

Do you want me to help with any of these setup steps?
