# Testing Guide - UnSaid

Complete testing checklist to validate your anonymous confession platform.

---

## 🧪 Unit Testing Setup

### Backend Testing (Optional)

Create `backend/test_main.py`:
```python
import pytest
from fastapi.testclient import TestClient
from main import app, SessionLocal, Base, engine

# Create tables for testing
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_create_order():
    response = client.post(
        "/api/orders",
        json={"amount": 49900, "plan": "anonymous"}
    )
    assert response.status_code == 200
    assert "id" in response.json()

# Run: pytest backend/test_main.py
```

---

## ✅ Manual Testing Checklist

### Phase 1: Setup Verification

- [ ] Backend starts without errors
  ```bash
  python main.py
  # Should show: "Uvicorn running on http://0.0.0.0:8000"
  ```

- [ ] Frontend starts without errors
  ```bash
  npm run dev
  # Should show: "✓ Ready in xxx ms"
  ```

- [ ] Environment variables loaded
  ```
  Backend: Check .env file exists
  Frontend: Check .env.local file exists
  ```

- [ ] Database created
  ```bash
  ls -la backend/confessions.db  # Should exist after first backend start
  ```

### Phase 2: UI/UX Testing

#### Landing Page
- [ ] Page loads without errors
- [ ] Title "UnSaid" visible
- [ ] Subtitle visible
- [ ] Two plan buttons visible
- [ ] Plan buttons are clickable

#### Plan Selection
- [ ] **Anonymous Plan** button
  - [ ] Shows ₹499 price
  - [ ] Shows description
  - [ ] Clicking navigates to form

- [ ] **Reveal Plan** button
  - [ ] Shows ₹999 price
  - [ ] Shows description
  - [ ] Clicking navigates to form

#### Confession Form
- [ ] **Message field**
  - [ ] Can type text
  - [ ] Character limit enforced (max 2000)
  - [ ] Validation error on empty submit
  - [ ] Validation error on <10 characters

- [ ] **Recipient Name field**
  - [ ] Can type name
  - [ ] Validation error on empty
  - [ ] Validation error on <2 characters

- [ ] **Delivery Method**
  - [ ] WhatsApp option visible
  - [ ] Email option visible
  - [ ] Can switch between them

- [ ] **Contact field (WhatsApp)**
  - [ ] Shows phone placeholder
  - [ ] Accepts phone numbers
  - [ ] Validates phone format

- [ ] **Contact field (Email)**
  - [ ] Shows email placeholder
  - [ ] Accepts email addresses
  - [ ] Validates email format

- [ ] **Form Submission**
  - [ ] "Continue to Payment" button works
  - [ ] Progresses to payment page
  - [ ] Preserves form data

#### Payment Page
- [ ] **Order Summary visible**
  - [ ] Plan name shown
  - [ ] Amount shown
  - [ ] Currency "₹" correct

- [ ] **Razorpay Button**
  - [ ] Button text correct ("Pay ₹XXX")
  - [ ] Button clickable
  - [ ] Opens Razorpay modal

- [ ] **Back Button**
  - [ ] Can go back to form
  - [ ] Data preserved when going back

### Phase 3: Payment Testing

#### Razorpay Payment Flow
- [ ] **Payment Modal Opens**
  - [ ] Modal appears after clicking "Pay"
  - [ ] Modal shows correct amount
  - [ ] Modal shows "UnSaid" as merchant

- [ ] **Test Card (Visa)**
  - [ ] Card: `4111 1111 1111 1111`
  - [ ] Expiry: Any future date (e.g., `12/25`)
  - [ ] CVV: Any 3 digits
  - [ ] Click Pay → Payment succeeds

- [ ] **Test Card (Mastercard)**
  - [ ] Card: `5555 5555 5555 4444`
  - [ ] Can test alternate card
  - [ ] Payment succeeds

- [ ] **Payment Validation**
  - [ ] Razorpay validates amount
  - [ ] Razorpay validates currency (INR)
  - [ ] Order ID received from backend

### Phase 4: Success Flow

#### Success Page
- [ ] **After successful payment**
  - [ ] Redirects to `/success`
  - [ ] Shows success message
  - [ ] Shows submission ID
  - [ ] "Send Another Confession" button visible

- [ ] **Back to Home**
  - [ ] Clicking button goes to `/`
  - [ ] Can start new confession

#### Database Verification
```bash
# Open SQLite to verify data
sqlite3 backend/confessions.db
```

```sql
-- Should show your submission
SELECT * FROM confessions;

-- Check columns
SELECT 
  submission_id,
  message,
  recipient_name,
  status,
  created_at
FROM confessions;
```

### Phase 5: Admin Dashboard Testing

#### Access Control
- [ ] **Wrong Password**
  - [ ] Try incorrect password
  - [ ] Shows error "Invalid password"
  - [ ] Doesn't grant access

- [ ] **Correct Password**
  - [ ] Use `test-admin-secret`
  - [ ] Grants access to dashboard
  - [ ] Redirects to submissions view

#### Submissions View
- [ ] **Submissions Table**
  - [ ] Shows all confessions
  - [ ] Displays submission ID
  - [ ] Shows recipient name
  - [ ] Shows contact info
  - [ ] Shows plan type
  - [ ] Shows status
  - [ ] Shows creation date

- [ ] **Filtering**
  - [ ] "All" button shows all submissions
  - [ ] "Pending" shows only pending
  - [ ] "Delivered" shows only delivered
  - [ ] "Failed" shows only failed
  - [ ] "Refresh" button updates list

#### Admin Actions
- [ ] **Mark as Delivered**
  - [ ] Click "Deliver" on pending submission
  - [ ] Status changes to "delivered"
  - [ ] "Deliver" button disappears
  - [ ] Shows "✓ Done" instead

- [ ] **Manual Reveal**
  - [ ] For "reveal" plan submissions
  - [ ] Click "Reveal" button
  - [ ] Status changes to "revealed"
  - [ ] Shows "✓ Revealed"

- [ ] **Logout**
  - [ ] Click "Logout" button
  - [ ] Redirects to login page
  - [ ] Requires password again

### Phase 6: API Testing

#### Using Postman or cURL

**Health Check**
```bash
curl http://localhost:8000/health
# Expected response: {"status":"ok","version":"0.1.0"}
```

**Create Order**
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"amount":49900,"plan":"anonymous"}'
# Expected: {"id":"order_xxx","amount":49900,"currency":"INR"}
```

**Get Submissions (Admin)**
```bash
curl http://localhost:8000/api/admin/submissions \
  -H "Authorization: Bearer test-admin-secret"
# Expected: List of submissions
```

**Mark as Delivered**
```bash
curl -X POST http://localhost:8000/api/admin/submissions/{id}/deliver \
  -H "Authorization: Bearer test-admin-secret"
# Expected: {"status":"delivered","id":"xxx"}
```

### Phase 7: Error Handling

#### Form Validation
- [ ] **Empty Message**
  - [ ] Shows error "Message is required"
  - [ ] Prevents submission

- [ ] **Short Message**
  - [ ] Shows error "Message must be at least 10 characters"
  - [ ] Prevents submission

- [ ] **Invalid Email**
  - [ ] Shows error "Invalid email address"
  - [ ] Prevents submission

- [ ] **Invalid Phone**
  - [ ] Shows error "Invalid phone number"
  - [ ] Prevents submission

#### Network Errors
- [ ] **Backend Offline**
  - [ ] Shows appropriate error message
  - [ ] Doesn't crash frontend

- [ ] **Payment Canceled**
  - [ ] User cancels Razorpay modal
  - [ ] Returns to payment page
  - [ ] Can retry payment

- [ ] **Webhook Timeout**
  - [ ] Submission still stores
  - [ ] Manual confirmation works

### Phase 8: Performance Testing

#### Frontend Performance
- [ ] **Page Load Time**
  - [ ] Landing page: <2 seconds
  - [ ] Form page: <1 second
  - [ ] Admin dashboard: <3 seconds

- [ ] **Form Responsiveness**
  - [ ] Form inputs respond instantly
  - [ ] Validation is smooth
  - [ ] No lag when typing

#### Backend Performance
- [ ] **API Response Time**
  - [ ] Health check: <100ms
  - [ ] Create order: <500ms
  - [ ] List submissions: <1000ms

- [ ] **Database Queries**
  - [ ] With 100 records: <500ms
  - [ ] With 1000 records: <1000ms

### Phase 9: Security Testing

#### Input Validation
- [ ] **XSS Prevention**
  - [ ] Try: `<script>alert('xss')</script>` in message
  - [ ] Page doesn't execute script
  - [ ] Data stored safely

- [ ] **SQL Injection Prevention**
  - [ ] Try: `'; DROP TABLE confessions; --`
  - [ ] Query executes safely
  - [ ] Table not dropped

#### Authentication
- [ ] **CORS Headers**
  ```bash
  curl -H "Origin: http://example.com" \
       http://localhost:8000/health -v
  # Should reject if not allowed origin
  ```

- [ ] **Token Validation**
  - [ ] Wrong token rejected
  - [ ] Missing token rejected
  - [ ] Valid token accepted

### Phase 10: Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

Check:
- [ ] Layout responsive
- [ ] Forms work
- [ ] Payment modal opens
- [ ] No console errors

---

## 🧪 End-to-End Test Scenario

### Complete User Journey

1. **User visits app**
   ```
   ✓ Lands on home page
   ✓ Sees plan options
   ```

2. **User selects plan**
   ```
   ✓ Clicks "Anonymous Only"
   ✓ Form page loads
   ```

3. **User fills form**
   ```
   ✓ Enters message: "This is a test confession"
   ✓ Enters name: "Test Recipient"
   ✓ Selects WhatsApp
   ✓ Enters phone: +919876543210
   ✓ Clicks "Continue to Payment"
   ```

4. **Payment page loads**
   ```
   ✓ Shows order summary
   ✓ Shows ₹499 amount
   ```

5. **Payment flow**
   ```
   ✓ Clicks "Pay ₹499"
   ✓ Razorpay modal opens
   ✓ Enters test card
   ✓ Completes payment
   ```

6. **Success confirmation**
   ```
   ✓ Redirects to success page
   ✓ Shows submission ID
   ✓ Shows confirmation message
   ```

7. **Admin verification**
   ```
   ✓ Go to /admin
   ✓ Login with password
   ✓ See submission in list
   ✓ Status shows "pending"
   ✓ Can mark as delivered
   ```

8. **Verification**
   ```
   ✓ Check database: sqlite3 confessions.db
   ✓ SELECT * FROM confessions; shows entry
   ```

---

## 📋 Test Report Template

```markdown
# Test Report - UnSaid v0.1.0

**Date**: December 12, 2025
**Tester**: Your Name
**Browser**: Chrome
**OS**: Windows 10

## Summary
- Total Tests: XX
- Passed: XX
- Failed: XX
- Skipped: XX

## Detailed Results

### Phase 1: Setup
- [x] Backend starts
- [x] Frontend starts
- [ ] (Add your results)

### Phase 2: UI/UX
- [x] Landing page loads
- [x] Plans visible
- [ ] (Add your results)

... (continue for all phases)

## Issues Found
1. Issue: XXX
   Severity: High/Medium/Low
   Fix: XXX

## Sign-off
Tested by: Your Name
Date: XX/XX/XXXX
Status: ✓ Ready for Launch / ⚠ Needs Fixes
```

---

## 🚀 Pre-Launch Checklist

Before going live:

- [ ] All phases tested ✓
- [ ] No critical bugs ✓
- [ ] Payment flow works ✓
- [ ] Admin dashboard works ✓
- [ ] Database backs up ✓
- [ ] Error handling tested ✓
- [ ] Security validated ✓
- [ ] Performance acceptable ✓
- [ ] Documentation complete ✓
- [ ] Razorpay credentials secure ✓

---

## 🔧 Debugging Tips

### Frontend Debugging
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Use React DevTools extension
5. Check .env.local values

### Backend Debugging
1. Check terminal output for logs
2. Add `print()` statements
3. Use FastAPI docs: `http://localhost:8000/docs`
4. Check database directly: `sqlite3 confessions.db`
5. Review error messages carefully

### Razorpay Debugging
1. Check test vs. live mode
2. Verify credentials in .env
3. Check amount is in paise (₹999 = 99900)
4. Review webhook logs
5. Test with official test cards

---

**Happy Testing! 🎉**
