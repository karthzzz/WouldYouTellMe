# UnSaid Backend - Anonymous Confession Platform

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with:
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
DATABASE_URL=sqlite:///./confessions.db
FRONTEND_URL=http://localhost:3000
```

4. Run the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

- `GET /health` - Health check
- `POST /api/orders` - Create Razorpay order
- `POST /api/submissions` - Submit confession after payment
- `POST /api/webhooks/razorpay` - Razorpay webhook handler
- `GET /api/submissions/{submission_id}` - Get submission details

## Environment Variables

- `RAZORPAY_KEY_ID`: Your Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Your Razorpay API key secret
- `DATABASE_URL`: Database connection string (default: SQLite)
- `FRONTEND_URL`: Frontend URL for CORS
