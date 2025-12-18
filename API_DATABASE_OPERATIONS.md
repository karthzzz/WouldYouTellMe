# 🔌 API Endpoints & Database Operations

## Complete API Reference

### 🔐 Authentication Endpoints

#### 1. **Google OAuth Login**
```
POST /api/auth/[...nextauth]
Handled by: NextAuth.js (Frontend)

Flow:
1. User clicks "Sign in with Google"
2. NextAuth redirects to Google
3. Google returns token
4. NextAuth calls callback: /api/auth/callback/google
5. Backend validates & creates/updates user in USERS table

Database Operations:
├─ CHECK: SELECT * FROM users WHERE google_id = 'google_12345'
├─ IF EXISTS: Update name, profile_picture if changed
└─ IF NEW: INSERT into users (google_id, email, name, profile_picture, free_messages_remaining=1)

Returns: Session JWT token
```

---

### 💰 Payment Endpoints

#### 2. **Create Razorpay Order**
```
POST /api/orders
Headers: Authorization: Bearer <JWT>
Body: { "plan": "lifetime" | "premium" }

Database Operations:
├─ VERIFY: User exists & authenticated
├─ QUERY: SELECT from subscriptions WHERE user_id = ?
├─ LOGIC: Check if already has active subscription
└─ CREATE: Razorpay order in Razorpay system (not in DB yet)

Returns: 
{
  "id": "order_1DP5mmOlF5G0m4",
  "amount": 49900,  // in paise
  "currency": "INR"
}
```

#### 3. **Confirm Payment**
```
POST /api/subscriptions/confirm
Headers: Authorization: Bearer <JWT>
Body: {
  "payment_id": "pay_1DP5mmOlF5G0m4",
  "order_id": "order_1DP5mmOlF5G0m4",
  "plan": "lifetime"
}

Database Operations:
├─ VERIFY: Razorpay payment is legitimate
├─ INSERT: INTO subscriptions (
│   user_id = ?,
│   plan = 'lifetime',
│   paid_at = NOW(),
│   expires_at = NULL,
│   payment_id = 'pay_...',
│   status = 'active'
│ )
├─ UPDATE: users SET is_developer = false (reset if needed)
└─ LOG: Record payment in subscriptions table

Returns: { "status": "success", "subscription_id": 1 }
```

---

### 📝 Confession Endpoints

#### 4. **Submit Confession**
```
POST /api/confessions
Headers: Authorization: Bearer <JWT>
Body: {
  "message": "I never told you what I really think...",
  "recipient_name": "Sarah",
  "recipient_contact": "sarah@email.com",
  "contact_type": "email",
  "device_id": "device_abc123"
}

Validation:
├─ message: 10-2000 chars
├─ recipient_name: 2+ chars
├─ recipient_contact: valid email or phone
└─ contact_type: "email" | "whatsapp"

Authorization Check:
├─ IF free message: Check USERS.free_messages_remaining > 0
├─   AND device_id never used before
├─ ELSE: Query SUBSCRIPTIONS for active plan
└─ IF neither: REJECT with 402 Payment Required

Database Operations:
├─ GENERATE: submission_id = UUID()
├─ INSERT: INTO confessions (
│   user_id = ?,
│   submission_id = 'uuid-...',
│   message = '...',
│   recipient_name = '...',
│   recipient_contact = '...',
│   contact_type = 'email',
│   status = 'pending',
│   created_at = NOW(),
│   is_free = true/false,
│   device_id = '...',
│   revealed = false
│ )
├─ IF free message used:
│   UPDATE users SET 
│     free_messages_remaining = 0,
│     device_used_free_message = 'device_abc123'
│   WHERE user_id = ?
├─ SEND EMAIL via Brevo:
│   TO: sarah@email.com
│   SUBJECT: Someone sent you an anonymous message
│   BODY: [Confession text + reply form]
└─ UPDATE: confessions SET status = 'sent' (after email sent)

Returns:
{
  "submission_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Confession saved and being delivered..."
}
```

#### 5. **Get User's Confessions**
```
GET /api/confessions
Headers: Authorization: Bearer <JWT>

Database Operations:
└─ SELECT * FROM confessions 
   WHERE user_id = ? 
   ORDER BY created_at DESC

Returns:
[
  {
    "id": 1,
    "submission_id": "550e8400-...",
    "recipient_name": "Sarah",
    "status": "sent",
    "created_at": "2025-12-18T15:30:45"
  },
  ...
]
```

#### 6. **Get Confession Status**
```
GET /api/confessions/{submission_id}
Headers: Authorization: Bearer <JWT>

Database Operations:
└─ SELECT * FROM confessions 
   WHERE submission_id = ? 
   AND user_id = ?  (authorization check)

Returns:
{
  "submission_id": "550e8400-...",
  "status": "sent",
  "recipient_name": "Sarah",
  "created_at": "2025-12-18T15:30:45",
  "revealed": false
}
```

---

### 👤 User Endpoints

#### 7. **Get User Profile**
```
GET /api/users/me
Headers: Authorization: Bearer <JWT>

Database Operations:
├─ SELECT from users WHERE id = ?
├─ SELECT from subscriptions 
│  WHERE user_id = ? 
│  AND status = 'active'
│  AND (expires_at IS NULL OR expires_at > NOW())
└─ SELECT COUNT(*) from confessions 
   WHERE user_id = ?

Returns:
{
  "id": 1,
  "email": "user@gmail.com",
  "name": "John Doe",
  "profile_picture": "https://...",
  "subscription": {
    "plan": "lifetime",
    "status": "active"
  },
  "stats": {
    "total_confessions": 5,
    "free_messages_remaining": 0
  }
}
```

#### 8. **Update User Profile**
```
PATCH /api/users/me
Headers: Authorization: Bearer <JWT>
Body: {
  "name": "John Smith",
  "settings": { ... }
}

Database Operations:
└─ UPDATE users 
   SET name = 'John Smith', updated_at = NOW()
   WHERE id = ?

Returns: Updated user object
```

---

### 🔔 Received Confessions (For Recipients)

#### 9. **Get Received Confessions** (Future: For recipients to reply)
```
GET /api/confessions/received
Headers: Authorization: Bearer <JWT>
Query: ?recipient_contact=sarah@email.com

Database Operations:
└─ SELECT * FROM confessions 
   WHERE recipient_contact = ? 
   AND status = 'sent'
   ORDER BY created_at DESC

Returns:
[
  {
    "submission_id": "550e8400-...",
    "message": "I never told you what I really think...",
    "from_date": "2025-12-18T15:30:45"
  }
]
```

---

## 📊 Database Query Summary

### User Registration Flow
```
Google OAuth ──→ Check USERS table ──→ If new: INSERT ──→ Return JWT
```

### Confession Submission Flow
```
Validate Input 
   ↓
Check Authorization (free or paid)
   ↓
INSERT into CONFESSIONS (status='pending')
   ↓
UPDATE USERS (if free message used)
   ↓
Send Email via Brevo
   ↓
UPDATE CONFESSIONS (status='sent')
```

### Subscription Flow
```
Create Razorpay Order 
   ↓
Razorpay processes payment
   ↓
Webhook: Confirm Payment
   ↓
INSERT into SUBSCRIPTIONS
   ↓
User gets unlimited confessions
```

---

## 🎯 Critical Operations

### Operation 1: Check User Has Paid
```sql
-- Used before allowing confession submission
SELECT COUNT(*) > 0 as has_paid
FROM subscriptions 
WHERE user_id = ? 
AND status = 'active' 
AND (expires_at IS NULL OR expires_at > datetime('now'));
```

### Operation 2: Check Free Message Available
```sql
-- Used for free confession (before paid message)
SELECT free_messages_remaining > 0 
AND device_used_free_message != ?
FROM users 
WHERE id = ?;
```

### Operation 3: Get All Pending Confessions (For Email Service)
```sql
-- Background job runs every minute
SELECT * FROM confessions 
WHERE status = 'pending' 
ORDER BY created_at ASC 
LIMIT 10;
```

### Operation 4: Find Confessions Ready to Deliver
```sql
-- For Brevo delivery status check
SELECT * FROM confessions 
WHERE status = 'sent' 
AND created_at > datetime('now', '-30 minutes')
AND revealed = false;
```

---

## 🔒 Data Security in Queries

### ❌ NEVER expose:
```sql
❌ SELECT message FROM confessions WHERE recipient_contact = 'sarah@email.com'
❌ SELECT * FROM confessions WHERE user_id = 1 (if user_id != authenticated user)
❌ SELECT email FROM users WHERE name LIKE '%John%'
```

### ✅ ALWAYS check:
```sql
✅ SELECT * FROM confessions 
   WHERE submission_id = ? 
   AND user_id = ? /* Authorization check */

✅ SELECT * FROM subscriptions 
   WHERE user_id = ? /* Only own subscription */
```

---

## 📈 Caching Opportunities (Future)

```
Cache Layer (Redis):
├─ User profile (5 min TTL)
├─ Subscription status (1 hour TTL)
├─ Confession list (1 min TTL)
└─ Free message quota (1 hour TTL)

Invalidate cache when:
├─ New confession submitted
├─ Payment confirmed
├─ User profile updated
└─ Subscription status changes
```

---

## ⚡ Performance Tips

### Indexes to Add:
```sql
CREATE INDEX idx_confessions_user_created 
ON confessions(user_id, created_at DESC);

CREATE INDEX idx_confessions_status 
ON confessions(status);

CREATE INDEX idx_subscriptions_user_status 
ON subscriptions(user_id, status, expires_at);
```

### Queries to Optimize:
```
Slow: SELECT * FROM confessions -- Loads all data
Fast: SELECT id, submission_id, status FROM confessions -- Load what needed

Slow: SELECT user.*, confessions.* FROM users JOIN confessions... -- N+1 problem
Fast: Use batch queries or pagination
```

---

Generated: 2025-12-18 | UnSaid Backend v0.2.0
