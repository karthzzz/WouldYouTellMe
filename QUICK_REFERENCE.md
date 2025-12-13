# Development Quick Reference

## Quick Start (Copy-Paste Ready)

### Backend Setup (First Time)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Edit the .env file with your credentials
python main.py
```

### Frontend Setup (First Time)
```bash
cd frontend
npm install
copy .env.local.example .env.local  # Edit the .env.local file
npm run dev
```

## Running During Development

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate  # if not already active
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## File Structure Quick Reference

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with CSS
│   ├── page.tsx            # Landing page with multi-step form
│   ├── globals.css         # Global Tailwind CSS
│   ├── success/page.tsx    # Payment success page
│   ├── failure/page.tsx    # Payment failure page
│   └── admin/page.tsx      # Admin dashboard
├── components/
│   ├── PlanSelector.tsx    # Plan selection buttons
│   ├── ConfessionForm.tsx  # Form component
│   └── PaymentButton.tsx   # Razorpay integration
├── lib/
│   ├── api.ts              # API client
│   └── utils.ts            # Utility functions
└── package.json

backend/
├── main.py                 # FastAPI server with all routes
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── README.md
```

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/orders` | Create Razorpay order |
| `POST` | `/api/submissions` | Submit confession |
| `POST` | `/api/webhooks/razorpay` | Razorpay webhook |
| `GET` | `/api/submissions/{id}` | Get submission details |
| `GET` | `/api/admin/submissions` | List submissions (admin) |
| `POST` | `/api/admin/submissions/{id}/deliver` | Mark delivered |
| `POST` | `/api/admin/submissions/{id}/reveal` | Reveal submission |

## Common Tasks

### Add a New Form Field
1. Edit `frontend/components/ConfessionForm.tsx`
2. Add new input with `register()` from React Hook Form
3. Add validation rules
4. Update Pydantic model in `backend/main.py`

### Change Payment Amount
1. Edit plan prices in `frontend/components/PlanSelector.tsx`
2. Update backend validation (if needed)
3. Test with Razorpay test cards

### Add a New Database Column
1. Add column to `Confession` model in `backend/main.py`
2. Delete `confessions.db`
3. Restart backend (auto-creates new schema)

### Debug API Calls
**Frontend:**
- Open DevTools (F12) → Network tab
- Watch API calls and responses

**Backend:**
- Check terminal output for logs
- Add `print()` statements for debugging
- Use FastAPI automatic docs: `http://localhost:8000/docs`

## Testing Razorpay

### Test Cards
| Card | Number | Expiry | CVV |
|------|--------|--------|-----|
| Visa | 4111 1111 1111 1111 | Any future | Any 3 |
| Mastercard | 5555 5555 5555 4444 | Any future | Any 3 |

### Test Phone Numbers
- `+919999999999` (for WhatsApp)

### Test Emails
- Any valid email format

## Environment Variables Checklist

### Frontend (.env.local)
- [ ] `NEXT_PUBLIC_RAZORPAY_KEY` - Your Razorpay public key
- [ ] `NEXT_PUBLIC_API_URL` - Backend URL (default: http://localhost:8000)

### Backend (.env)
- [ ] `RAZORPAY_KEY_ID` - Your Razorpay key ID
- [ ] `RAZORPAY_KEY_SECRET` - Your Razorpay secret
- [ ] `DATABASE_URL` - Database connection string
- [ ] `FRONTEND_URL` - Frontend URL for CORS
- [ ] `ADMIN_SECRET` - Admin password for dashboard

## Useful Commands

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check code quality
```

### Backend
```bash
python main.py   # Start server
python -m pytest # Run tests (if added)
```

### Database
```bash
# View SQLite data
sqlite3 confessions.db
> SELECT * FROM confessions;

# Export data
sqlite3 confessions.db ".dump" > backup.sql

# Reset database
rm confessions.db  # Restart backend to recreate
```

## Error Troubleshooting

| Error | Solution |
|-------|----------|
| Port 8000 already in use | Change port in `main.py` or kill process using it |
| Module not found | Run `pip install -r requirements.txt` (backend) or `npm install` (frontend) |
| Razorpay order creation fails | Check credentials in `.env` and `.env.local` |
| CORS errors | Check `FRONTEND_URL` in backend `.env` matches actual URL |
| Database locked | Delete `confessions.db` and restart |
| 404 on routes | Check route definition in `main.py` or `app/` folder |

## Keyboard Shortcuts

**During Development:**
- `Ctrl+C` - Stop server
- `Ctrl+R` - Restart server
- `F12` - Open DevTools (frontend)
- `Ctrl+Shift+R` - Hard refresh (clears cache)

## Next Development Steps

1. **Email/WhatsApp Integration** - Add Twilio or SendGrid
2. **Admin Authentication** - Implement proper JWT tokens
3. **Analytics** - Track payments, delivery rates
4. **Automation** - Auto-reveal after 7 days
5. **More Payment Options** - Add PayPal, Stripe
6. **User Accounts** - Let users track their confessions
7. **Moderation** - Filter inappropriate content
8. **Analytics Dashboard** - Revenue tracking

## Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Razorpay API Docs](https://razorpay.com/docs/api/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
