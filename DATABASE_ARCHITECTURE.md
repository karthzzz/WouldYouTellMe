# 🗄️ Database Architecture Visualization

## Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                          USERS TABLE                              │
├─────────────────────────────────────────────────────────────────┤
│ 🔑 id (PK)                                                       │
│ google_id (UNIQUE)                                              │
│ email (UNIQUE)                                                  │
│ name                                                            │
│ profile_picture                                                 │
│ created_at                                                      │
│ free_messages_remaining                                         │
│ device_used_free_message                                        │
│ is_developer                                                    │
└──────────────────────┬────────────────────────────────────────┬─┘
                       │                                        │
         (1:N)         │ (1:N)                      (1:N)        │
                       │                                        │
       ┌───────────────▼───────┐                ┌────────────────▼─────┐
       │  SUBSCRIPTIONS TABLE  │                │  CONFESSIONS TABLE    │
       ├───────────────────────┤                ├───────────────────────┤
       │ 🔑 id (PK)            │                │ 🔑 id (PK)            │
       │ user_id (FK→users.id) │                │ user_id (FK→users.id) │
       │ plan                  │                │ submission_id (UUID)  │
       │ paid_at               │                │ message               │
       │ expires_at            │                │ recipient_name        │
       │ payment_id (UNIQUE)   │                │ recipient_contact     │
       │ status                │                │ contact_type          │
       └───────────────────────┘                │ status                │
                                               │ created_at            │
                                               │ revealed              │
                                               │ device_id             │
                                               │ is_free               │
                                               └───────────────────────┘
```

## Data Flow: Confession Submission

```
┌──────────────────────────────────────────────────────────────────────┐
│                     CONFESSION SUBMISSION FLOW                        │
└──────────────────────────────────────────────────────────────────────┘

STEP 1: USER AUTHENTICATION
┌─────────────────────────┐
│ Google OAuth Login      │
│ (Frontend: page.tsx)    │
└────────┬────────────────┘
         │
         ▼
    CREATE/GET USER
    ┌────────────────────────────────────────────┐
    │ POST /api/auth/google                      │
    │ • Check if user exists in USERS table      │
    │ • If new: INSERT new user record           │
    │ • Generate JWT token                       │
    └────────────────────────────────────────────┘
         │
         ▼
    STORE IN USERS TABLE
    ┌────────────────────────────────────────────┐
    │ user_id: 1                                 │
    │ email: user@gmail.com                      │
    │ name: John Doe                             │
    │ google_id: 1234567890                      │
    │ free_messages_remaining: 1                 │
    └────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────

STEP 2: WRITE CONFESSION
┌──────────────────────────────────────────────────────────────────┐
│ User fills form on /confession page:                            │
│ • Message: "I never told you what I really think..."            │
│ • Recipient: "Sarah"                                            │
│ • Contact: "sarah@email.com"                                    │
│ • Method: "email"                                               │
│ • Device ID: auto-generated or from localStorage                │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
    VALIDATE & CHECK QUOTAS
    ┌────────────────────────────────────────────┐
    │ • Message length: 10-2000 chars ✓         │
    │ • Recipient name: min 2 chars ✓            │
    │ • Contact format: valid email ✓            │
    │ • Check subscription:                      │
    │   - Free message? Check device_id          │
    │   - Paid? Check subscriptions table        │
    └────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────

STEP 3: SUBMIT CONFESSION
┌──────────────────────────────────────────────────────────────────┐
│ POST /api/confessions                                           │
│ {                                                               │
│   "message": "I never told you what I really think...",        │
│   "recipient_name": "Sarah",                                   │
│   "recipient_contact": "sarah@email.com",                      │
│   "contact_type": "email",                                     │
│   "device_id": "device_abc123def456"                           │
│ }                                                               │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
    INSERT INTO CONFESSIONS TABLE
    ┌────────────────────────────────────────────┐
    │ id: 1                                      │
    │ user_id: 1 (FK)                            │
    │ submission_id: "550e8400-e29b-41d4..." │  │
    │ message: "I never told you..."             │
    │ recipient_name: "Sarah"                    │
    │ recipient_contact: "sarah@email.com"       │
    │ contact_type: "email"                      │
    │ status: "pending"                          │
    │ created_at: 2025-12-18 15:30:45            │
    │ is_free: true                              │
    │ device_id: "device_abc123def456"           │
    │ revealed: false                            │
    └────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────

STEP 4: UPDATE FREE MESSAGE QUOTA
┌────────────────────────────────────────────┐
│ UPDATE USERS table                         │
│ SET free_messages_remaining = 0            │
│ WHERE id = 1                               │
│                                            │
│ SET device_used_free_message =             │
│     "device_abc123def456"                  │
│ WHERE id = 1                               │
└────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────

STEP 5: SEND VIA BREVO EMAIL SERVICE
┌──────────────────────────────────────────────────────────────────┐
│ POST https://api.brevo.com/v3/smtp/email                        │
│ {                                                               │
│   "sender": "WouldYouTellMe <noreply@unsaid.com>",             │
│   "to": [{"email": "sarah@email.com"}],                        │
│   "subject": "Someone sent you an anonymous message",           │
│   "htmlContent": "✉️ You have a confession...\n\n              │
│                   [Message displayed here]\n\n                 │
│                   [Reply button]"                              │
│ }                                                               │
└──────────────────────────────────────────────────────────────────┘
         │
         ▼
    UPDATE STATUS TO "SENT"
    ┌────────────────────────────────────────────┐
    │ UPDATE CONFESSIONS table                   │
    │ SET status = "sent"                        │
    │ WHERE submission_id = "550e8400..."        │
    └────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────────

STEP 6: USER SEES SUCCESS
┌──────────────────────────────────────────────────────────────────┐
│ Frontend redirects to /success page                             │
│ Shows:                                                          │
│ ✅ "Confession sent! 🎉"                                       │
│ ⏱️ "Email: instantly | WhatsApp: within 5 minutes"             │
│ 🔒 "The recipient won't see your identity..."                  │
│ 💭 "Check your profile for replies"                            │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Details

### USERS Table
```
Column                   | Type     | Constraints  | Purpose
─────────────────────────┼──────────┼──────────────┼──────────────────
id                       | INTEGER  | PK, AUTO     | Unique user ID
google_id                | VARCHAR  | UNIQUE, IDX  | OAuth identifier
email                    | VARCHAR  | UNIQUE, IDX  | Account email
name                     | VARCHAR  | -            | Display name
profile_picture          | VARCHAR  | -            | Avatar URL
created_at               | DATETIME | -            | Signup timestamp
free_messages_remaining  | INTEGER  | DEF: 1       | Free quota (0 or 1)
device_used_free_message | VARCHAR  | -            | Which device used free
is_developer             | BOOLEAN  | DEF: FALSE   | Bypass limits (testing)
```

### SUBSCRIPTIONS Table
```
Column     | Type     | Constraints       | Purpose
───────────┼──────────┼───────────────────┼─────────────────────────
id         | INTEGER  | PK, AUTO          | Subscription ID
user_id    | INTEGER  | FK→users.id, IDX  | Who owns this
plan       | VARCHAR  | -                 | "lifetime" or "premium"
paid_at    | DATETIME | -                 | Purchase timestamp
expires_at | DATETIME | NULLABLE          | NULL=lifetime
payment_id | VARCHAR  | UNIQUE, IDX       | Razorpay ID
status     | VARCHAR  | DEF: "active"     | "active" or "cancelled"
```

### CONFESSIONS Table
```
Column          | Type     | Constraints       | Purpose
────────────────┼──────────┼───────────────────┼──────────────────
id              | INTEGER  | PK, AUTO          | Internal ID
user_id         | INTEGER  | FK→users.id, IDX  | Sender (anonymous)
submission_id   | VARCHAR  | UNIQUE, IDX       | Public UUID
message         | VARCHAR  | NOT NULL          | The confession
recipient_name  | VARCHAR  | NOT NULL          | "Sarah" or "Boss"
recipient_contact| VARCHAR | NOT NULL          | Email or phone
contact_type    | VARCHAR  | NOT NULL          | "email" or "whatsapp"
status          | VARCHAR  | DEF: "pending"    | pending/sent/delivered
created_at      | DATETIME | -                 | Submitted when
revealed        | BOOLEAN  | DEF: FALSE        | Sender identity shown?
device_id       | VARCHAR  | -                 | For free quota tracking
is_free         | BOOLEAN  | DEF: FALSE        | Used free message?
```

---

## Query Examples

### Find all confessions by a user
```sql
SELECT * FROM confessions 
WHERE user_id = 1 
ORDER BY created_at DESC;
```

### Check if user has active subscription
```sql
SELECT * FROM subscriptions 
WHERE user_id = 1 
AND status = 'active' 
AND (expires_at IS NULL OR expires_at > NOW());
```

### Get confessions pending delivery
```sql
SELECT * FROM confessions 
WHERE status = 'pending' 
ORDER BY created_at ASC;
```

### Find free messages used by device
```sql
SELECT COUNT(*) FROM confessions 
WHERE device_id = 'device_abc123' 
AND is_free = 1;
```

### Get revenue from subscriptions
```sql
SELECT plan, COUNT(*) as count, COUNT(*) * 
CASE 
    WHEN plan = 'lifetime' THEN 499
    WHEN plan = 'premium' THEN 149
END as revenue
FROM subscriptions 
GROUP BY plan;
```

---

## Performance Considerations

### Indexed Columns (For Fast Queries)
- ✅ `users.google_id` - OAuth login lookup
- ✅ `users.email` - Email-based lookup
- ✅ `confessions.user_id` - Find user's confessions
- ✅ `confessions.submission_id` - Find specific confession
- ✅ `subscriptions.user_id` - Check subscription
- ✅ `subscriptions.payment_id` - Verify payment

### Unindexed (But Small, So OK)
- `confessions.status` - Few distinct values, table small
- `subscriptions.plan` - Few distinct values
- `users.is_developer` - Boolean, mostly FALSE

### When to Add More Indexes:
- When `confessions` table exceeds 100,000 rows → Add index on `contact_type`
- When `users` table exceeds 50,000 rows → Add index on `created_at`

---

## Scalability Path

```
Phase 1: Current (SQLite)
├─ Development mode
├─ 1-2 concurrent users
├─ Perfect for MVP
└─ Max ~50K confessions

       ↓

Phase 2: PostgreSQL (Recommended)
├─ Production ready
├─ 1000+ concurrent users
├─ Connection pooling needed
└─ Max ~10M confessions

       ↓

Phase 3: Sharding (If Needed)
├─ Shard by user_id
├─ Multiple PostgreSQL instances
├─ Load balancer
└─ Max ~1B confessions
```

---

✅ **Architecture is PRODUCTION-READY!** Just migrate to PostgreSQL when scaling.
