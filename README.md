# UnSaid - Anonymous Confession Platform

A full-stack web application that allows users to send anonymous confessions or timed-reveal messages to someone they know, with Razorpay payment integration.

## 📋 Project Structure

```
UnSaid/
├── frontend/              # Next.js 15 React application
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Landing page with form
│   │   ├── success/      # Payment success page
│   │   ├── failure/      # Payment failure page
│   │   └── admin/        # Admin dashboard
│   ├── components/       # Reusable React components
│   │   ├── ConfessionForm.tsx      # Form for confession details
│   │   ├── PlanSelector.tsx        # Plan selection buttons
│   │   └── PaymentButton.tsx       # Razorpay integration
│   ├── lib/             # Utilities and helpers
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── backend/              # FastAPI Python application
    ├── main.py          # FastAPI server & routes
    ├── requirements.txt # Python dependencies
    ├── README.md
    └── .env.example
```

## 🎯 Features

### MVP (Current)
- ✅ Landing page with confession form
- ✅ Two pricing plans:
  - **₹499**: Anonymous only (sender identity stays hidden)
  - **₹999**: Reveal after 7 days (identity reveals automatically after 7 days)
- ✅ Form validation with React Hook Form
- ✅ Razorpay payment integration
- ✅ SQLite database for storing submissions
- ✅ Payment webhook handling
- ✅ Admin dashboard to view and manage submissions
- ✅ Responsive design with Tailwind CSS

### Future Enhancements
- [ ] Automated WhatsApp delivery (Twilio integration)
- [ ] Automated email delivery (SendGrid/Gmail integration)
- [ ] Scheduled reveal system for 7-day plan
- [ ] User authentication for admin access
- [ ] Analytics dashboard
- [ ] Message templates
- [ ] PostgreSQL migration for production

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.8+ (for backend)
- Razorpay account (for payments)

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

4. Update with your Razorpay public key:
```
NEXT_PUBLIC_RAZORPAY_KEY=your_razorpay_public_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

5. Run development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Update with your Razorpay credentials:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
DATABASE_URL=sqlite:///./confessions.db
FRONTEND_URL=http://localhost:3000
```

6. Run the server:
```bash
python main.py
```

Backend API will be available at `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Create Order
```
POST /api/orders
Content-Type: application/json

{
  "amount": 49900,  // in paise (₹499)
  "plan": "anonymous"  // or "reveal"
}
```
Returns Razorpay order ID.

### Submit Confession
```
POST /api/submissions
Content-Type: application/json

{
  "message": "Your confession text...",
  "recipient_name": "John",
  "recipient_contact": "+91 98765 43210",
  "contact_type": "whatsapp",  // or "email"
  "plan": "anonymous",
  "payment_id": "pay_xxxxx"
}
```
Creates a new submission and triggers delivery.

### Razorpay Webhook
```
POST /api/webhooks/razorpay
```
Handles Razorpay payment events.

### Get Submission (Admin)
```
GET /api/submissions/{submission_id}
Authorization: Bearer admin_token
```
Retrieves submission details.

## 💳 Payment Flow

1. User selects a plan (Anonymous or Reveal)
2. User fills in confession details and recipient info
3. Backend creates Razorpay order
4. Razorpay checkout modal opens
5. User completes payment
6. Razorpay sends webhook confirmation
7. Submission is stored and marked for delivery
8. Admin can manually send message or automate later
9. (For Reveal plan) After 7 days, identity is revealed automatically

## 🗄️ Database Schema

### Confessions Table
```sql
CREATE TABLE confessions (
    id INTEGER PRIMARY KEY,
    submission_id VARCHAR UNIQUE,
    message VARCHAR,
    recipient_name VARCHAR,
    recipient_contact VARCHAR,
    contact_type VARCHAR,  -- 'whatsapp' or 'email'
    plan VARCHAR,  -- 'anonymous' or 'reveal'
    payment_id VARCHAR UNIQUE,
    order_id VARCHAR UNIQUE,
    status VARCHAR,  -- 'pending', 'delivered', 'revealed', 'failed'
    created_at DATETIME,
    scheduled_reveal DATETIME,  -- For 7-day reveal
    revealed BOOLEAN
);
```

## 🔐 Security Notes

- All payments handled by Razorpay (PCI-DSS compliant)
- CORS configured to accept requests only from your frontend
- Environment variables used for sensitive data (API keys)
- Database queries parameterized to prevent SQL injection
- Input validation on both frontend and backend

## 📝 Admin Dashboard

Access admin dashboard at `/admin` (requires authentication in production).

Features:
- View all submissions
- Filter by status (pending, delivered, failed)
- Mark confessions as delivered
- View submission details and payment info
- Track revenue

## 🛠️ Development

### Running Both Services

In terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### Making Changes

**Frontend changes**: Automatically reload on `http://localhost:3000`

**Backend changes**: Restart the server (may need to restart uvicorn)

## 📦 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_RAZORPAY_KEY=your_public_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
DATABASE_URL=sqlite:///./confessions.db
FRONTEND_URL=http://localhost:3000
```

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Backend (Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway or Render
3. Set environment variables
4. Deploy

## 📚 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, React Hook Form
- **Backend**: FastAPI, SQLAlchemy, SQLite (MVP)
- **Payments**: Razorpay
- **Deployment**: Vercel (frontend), Railway/Render (backend)

## 📞 Support

For payment-related issues, refer to [Razorpay Documentation](https://razorpay.com/docs)

## 📄 License

MIT

---

**Note**: This is an MVP. For production, consider:
- Database: PostgreSQL
- Message Delivery: Twilio (SMS/WhatsApp), SendGrid (Email)
- Authentication: JWT tokens
- Monitoring: Sentry, LogRocket
- Analytics: Mixpanel, Google Analytics
