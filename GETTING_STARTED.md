# Getting Started Guide - UnSaid

This guide will help you set up and run the UnSaid application locally.

## Prerequisites

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Python 3.8+** - Download from [python.org](https://www.python.org)
- **Git** - Download from [git-scm.com](https://git-scm.com)
- **Razorpay Account** - Sign up at [razorpay.com](https://razorpay.com)

## Step 1: Get Your Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Copy your **Key ID** and **Key Secret** (keep these safe!)
5. Also note your **Publishable Key** (starts with `rzp_test_` or `rzp_live_`)

## Step 2: Backend Setup

### 2.1 Navigate to backend directory
```bash
cd backend
```

### 2.2 Create virtual environment
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

### 2.3 Install dependencies
```bash
pip install -r requirements.txt
```

### 2.4 Create `.env` file
**Windows:**
```bash
copy .env.example .env
```

**macOS/Linux:**
```bash
cp .env.example .env
```

### 2.5 Edit `.env` with your credentials
Open `backend/.env` and update:
```
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
DATABASE_URL=sqlite:///./confessions.db
FRONTEND_URL=http://localhost:3000
ADMIN_SECRET=your_secure_admin_password
```

### 2.6 Run the backend server
```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

✅ **Backend is running at** `http://localhost:8000`

## Step 3: Frontend Setup

### 3.1 Open a new terminal and navigate to frontend directory
```bash
cd frontend
```

### 3.2 Install dependencies
```bash
npm install
```

### 3.3 Create `.env.local` file
**Windows:**
```bash
copy .env.local.example .env.local
```

**macOS/Linux:**
```bash
cp .env.local.example .env.local
```

### 3.4 Edit `.env.local` with your Razorpay public key
Open `frontend/.env.local` and update:
```
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_public_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3.5 Run the frontend development server
```bash
npm run dev
```

You should see:
```
✓ Ready in xxx ms
```

✅ **Frontend is running at** `http://localhost:3000`

## Step 4: Test the Application

### 4.1 Visit the landing page
Open your browser and go to `http://localhost:3000`

You should see:
- UnSaid landing page with form
- Plan selection buttons (₹499 and ₹999)

### 4.2 Test the form
1. Click on "Anonymous Only" plan
2. Fill in the form:
   - Message: "This is a test confession"
   - Recipient Name: "John"
   - Recipient Contact: "+91 9876543210" (or your email)
   - Contact Type: WhatsApp or Email
3. Click "Continue to Payment"

### 4.3 Test Razorpay payment (Test Mode)
In test mode, you can use these test cards:
- Card: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

Complete the payment and you should be redirected to the success page.

### 4.4 Access Admin Dashboard
Go to `http://localhost:3000/admin`
- Click "Sign In"
- Password: `test-admin-secret` (as defined in `.env`)
- You'll see your submitted confession in the admin panel

## Step 5: Make Changes

### For Frontend Changes
- Edit files in `frontend/app/` or `frontend/components/`
- The dev server will auto-refresh on save
- No restart needed

### For Backend Changes
- Edit `backend/main.py`
- Stop the server (Ctrl+C)
- Run `python main.py` again

## Troubleshooting

### Backend won't start
```
ERROR: Unable to bind to port 8000
```
**Solution:** Port 8000 is already in use. Change in `main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8001)  # Use 8001 instead
```

### Frontend won't start
```
Module not found: 'react'
```
**Solution:** Run `npm install` again

### Database errors
```
ERROR: Database is locked
```
**Solution:** Delete `confessions.db` and restart backend

### Razorpay errors
```
Failed to create order
```
**Solution:** Check your Razorpay credentials in `.env`

## Next Steps

Once you've tested locally:

1. **Switch to Live Mode** - Update Razorpay credentials from test to live keys
2. **Deploy Backend** - Use Railway, Render, or AWS
3. **Deploy Frontend** - Use Vercel (recommended for Next.js)
4. **Set up Email/WhatsApp** - Integrate Twilio or SendGrid
5. **Add Authentication** - Implement JWT for admin access

See `DEPLOYMENT.md` for detailed deployment instructions.
