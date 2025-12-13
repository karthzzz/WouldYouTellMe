# Deployment Guide - UnSaid

This guide covers deploying UnSaid to production.

## Architecture Overview

```
┌─────────────────┐
│   Users/Browsers│
└────────┬────────┘
         │ HTTPS
    ┌────▼─────────────────┐
    │ Frontend (Vercel)    │
    │ Next.js 15           │
    └────┬─────────────────┘
         │ API Calls
    ┌────▼──────────────────┐
    │ Backend (Railway)     │
    │ FastAPI              │
    └────┬──────────────────┘
         │ SQL
    ┌────▼──────────────────┐
    │ Database             │
    │ PostgreSQL           │
    └──────────────────────┘
```

## Prerequisites for Deployment

1. **GitHub Account** - For version control
2. **Vercel Account** - For frontend (free tier available)
3. **Railway Account** - For backend (free tier with limitations)
4. **PostgreSQL Database** - Use Railway's built-in PostgreSQL
5. **Razorpay Live Keys** - From your Razorpay account (not test keys)

## Step 1: Prepare Your Code

### 1.1 Initialize Git Repository
```bash
cd UnSaid
git init
git add .
git commit -m "Initial commit: UnSaid MVP"
```

### 1.2 Create GitHub Repository
1. Go to [github.com/new](https://github.com/new)
2. Create a repository named `unsaid`
3. Follow instructions to push your code:
```bash
git remote add origin https://github.com/yourusername/unsaid.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend on Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up (GitHub recommended)
3. Click "Create a new project"

### 2.2 Set Up PostgreSQL Database
1. Click "Add Services" → "Database" → "PostgreSQL"
2. Note the connection string from the plugin settings

### 2.3 Deploy FastAPI Backend
1. Click "Add Services" → "GitHub Repo"
2. Select your `unsaid` repository
3. Railway will auto-detect it's a Python project

### 2.4 Configure Environment Variables
In Railway project settings, add:
```
RAZORPAY_KEY_ID=your_live_key_id
RAZORPAY_KEY_SECRET=your_live_key_secret
DATABASE_URL=postgres://user:password@host:5432/railway
FRONTEND_URL=https://your-frontend-domain.vercel.app
ADMIN_SECRET=your_super_secure_password
```

### 2.5 Update Backend for Production
Edit `backend/main.py` before committing:

**Change SQLite to PostgreSQL:**
```python
# Before
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./confessions.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

# After
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/unsaid")
engine = create_engine(DATABASE_URL)
```

**Add SSL requirement for production:**
```python
if "postgresql" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        connect_args={"sslmode": "require"}
    )
```

### 2.6 Deploy
1. Commit your changes:
```bash
git add .
git commit -m "Update for production deployment"
git push
```
2. Railway will auto-deploy on push
3. Get your backend URL from Railway dashboard (e.g., `https://unsaid-backend.up.railway.app`)

## Step 3: Deploy Frontend on Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Import Your Project
1. Click "New Project"
2. Select your GitHub repository
3. Vercel auto-detects Next.js configuration

### 3.3 Configure Environment Variables
1. In Vercel project settings, go to "Environment Variables"
2. Add:
```
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_public_live_key
NEXT_PUBLIC_API_URL=https://your-backend-railway-url.com
```

### 3.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Your frontend URL will be something like `https://unsaid.vercel.app`

## Step 4: Connect Everything

### 4.1 Update Backend Frontend URL
1. Go to Railway dashboard
2. Update `FRONTEND_URL` to your Vercel URL
3. Redeploy

### 4.2 Test the Flow
1. Visit your Vercel URL
2. Go through the complete payment flow
3. Check admin dashboard
4. Monitor Railway logs for errors

## Step 5: Custom Domain (Optional)

### For Frontend (Vercel)
1. In Vercel project settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel provides instructions)

### For Backend (Railway)
1. In Railway project settings → Domains
2. Add your custom domain
3. Configure DNS CNAME record

## Step 6: Monitoring and Maintenance

### Railway Backend Logs
1. Go to Railway dashboard
2. Select your FastAPI service
3. Click "Logs" tab
4. Monitor for errors

### Vercel Frontend Logs
1. Go to Vercel project
2. Click "Deployments" tab
3. View build logs and function logs

### Database Backups
Railway PostgreSQL includes automatic backups. To create manual backups:
```bash
pg_dump $DATABASE_URL > backup.sql
```

## Step 7: Payment Testing in Production

### Important: Never Test with Real Money!
Before going live with real payments:

1. **Keep Razorpay in Test Mode** until you're ready
2. Use test card: `4111 1111 1111 1111`
3. Thoroughly test the entire flow
4. Once confident, get approval from Razorpay
5. Switch to live keys

### Enable Razorpay Live Mode
1. Go to Razorpay dashboard
2. Settings → API Keys
3. Switch toggle to "Live Mode"
4. Update environment variables with live keys
5. Redeploy both frontend and backend

## Database Migration (SQLite → PostgreSQL)

If you need to migrate existing data:

```bash
# Export from SQLite
sqlite3 confessions.db ".dump confessions" > confessions.sql

# Import to PostgreSQL
psql $DATABASE_URL < confessions.sql
```

## Troubleshooting

### Backend not connecting to database
```
Error: could not connect to server
```
**Solution:** 
- Check DATABASE_URL is correct in Railway
- Ensure PostgreSQL service is running
- Check network policy allows connections

### Payment webhook not working
```
Webhook failed with 403
```
**Solution:**
- Update Razorpay webhook URL in dashboard: `https://your-backend-url/api/webhooks/razorpay`
- Verify CORS settings in backend

### Frontend cannot reach backend
```
Failed to fetch from API
```
**Solution:**
- Check NEXT_PUBLIC_API_URL in Vercel environment
- Verify backend is running (check Railway logs)
- Test API directly: `curl https://your-backend-url/health`

## Performance Optimization

### Frontend
- Images are automatically optimized by Next.js
- Use Vercel's built-in CDN for fast global delivery
- Monitor Core Web Vitals in Vercel Analytics

### Backend
- Use Railway's auto-scaling (requires paid plan)
- Monitor database query performance
- Use connection pooling for PostgreSQL

## Security Checklist

- [ ] Razorpay keys in environment variables (not in code)
- [ ] HTTPS enforced on all endpoints
- [ ] CORS configured to specific domains
- [ ] Admin password is strong (20+ characters)
- [ ] Database backups enabled
- [ ] Rate limiting enabled (optional)
- [ ] SQL injection protection verified
- [ ] XSS protection enabled (Next.js default)

## Cost Estimation (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | 3 deployments/day | $20/month (optional) |
| Railway | $5 free credits | 20¢/hour (backend) + 30¢/hour (DB) |
| Razorpay | No monthly fee | 2% + ₹3 per transaction |
| Domain | - | $10-15/year |
| **Total** | - | ~$30-50/month |

## Next Steps

1. Monitor analytics and user feedback
2. Implement automated WhatsApp/Email delivery
3. Add more payment options (PayPal, Stripe)
4. Implement proper user authentication
5. Add subscription plans for creators
6. Scale infrastructure as needed
