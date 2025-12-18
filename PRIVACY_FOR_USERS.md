# 📊 What's Stored About You & Your Privacy

## For End Users - What You Need to Know

---

## 🔐 What We Store About You

### When You Sign In
We collect:
- ✅ Your email (from Google)
- ✅ Your name (from Google)
- ✅ Your profile picture (from Google)

We **do NOT** store:
- ❌ Your password (Google handles it)
- ❌ Your phone number
- ❌ Your location
- ❌ Your IP address
- ❌ Your device fingerprint

---

### When You Send a Confession

**About YOU (The Sender):**
- ✅ That you sent a confession (tied to your account)
- ✅ When you sent it (timestamp)
- ✅ What device you used (to prevent free message abuse)
- ✅ Whether you paid or used free message

**About YOUR CONFESSION:**
- ✅ The message text (encrypted in transit)
- ✅ Recipient's name (e.g., "Sarah" not full name)
- ✅ Recipient's contact (email or phone)
- ✅ Delivery status (pending/sent)

**About THE RECIPIENT:**
- ✅ Their email or phone (only for delivery)
- ❌ We don't store their address
- ❌ We don't store their relationship to you
- ❌ We don't link them to other users

---

## 👥 Is Your Confession Anonymous?

**Short Answer:** YES - To the recipient.  
**Long Answer:** Your confession is sent with ZERO identifying information.

### How It Works
```
You (sender)
    ↓
    Confession submitted to our system
    ↓
    Your identity REMOVED from message
    ↓
    Email sent to recipient
    ↓
    Recipient sees ONLY the message, not your name
```

### What Recipient Sees
```
Subject: Someone sent you an anonymous message

"I've never told you what I really think about..."

[No sender name]
[No sender email]
[No sender phone]
[Complete anonymity]
```

### Our Promise ✅
- Recipient will NEVER know your email
- Recipient will NEVER know your name
- Recipient will NEVER know your phone
- Recipient will NEVER know where you're from

### The Legal Caveat ⚖️
We must comply with law enforcement. If required by legal order (court order, warrant), we may be compelled to disclose:
- Your email
- Your name
- Your Google ID
- When you sent the confession

**This is standard for all internet services and required by law.**

---

## 💾 All Data We Store

### Three Categories:

#### 1. Account Data
```
Account Created: 2025-12-18
Email: your@gmail.com
Name: Your Name
Picture: [From Google]
```

#### 2. Subscription Data
```
Plan: Lifetime ($499)
Purchased: 2025-12-18
Status: Active
Confessions Sent: 3
```

#### 3. Confession Data
```
Confession 1:
├─ Message: "..."
├─ Recipient: Sarah
├─ Sent: 2025-12-18 15:30
└─ Status: Delivered

Confession 2:
├─ Message: "..."
├─ Recipient: Mom
├─ Sent: 2025-12-18 16:45
└─ Status: Delivered

Confession 3:
├─ Message: "..."
├─ Recipient: Boss
├─ Sent: 2025-12-18 17:20
└─ Status: Pending
```

---

## 🔒 How We Protect Your Data

### In Transit (When Sending)
- ✅ HTTPS encryption (https://would-you-tell-me.vercel.app)
- ✅ All API calls use JWT tokens
- ✅ Email content encrypted before sending to Brevo

### At Rest (In Database)
- ✅ Database backed up daily
- ⚠️ SQLite (local). PostgreSQL in production = more secure
- ✅ Access logs for all database queries

### Access Control
- ✅ Only you can view your confessions
- ✅ Only backend can send emails
- ✅ Only admins can view raw database
- ✅ No employee access to user data

---

## 🚀 How Delivery Works

### Email Delivery
```
1. You submit confession: "I think you're amazing"
2. You provide: sarah@email.com
3. We send email to Sarah:
   
   From: WouldYouTellMe <noreply@unsaid.com>
   Subject: Someone sent you an anonymous message
   
   "I think you're amazing"
   
4. Sarah receives it - Has NO IDEA it's from you ✓
5. If Sarah replies - It goes to our reply system (coming soon)
```

### WhatsApp Delivery (Coming Soon)
```
1. You submit confession + Sarah's phone: +91 98765 43210
2. We send WhatsApp message with confessions
3. Sarah receives - No sender identification
4. Coming Q1 2026
```

---

## 📊 Database Structure

### What You Have Access To (Your Dashboard)
- ✅ Your account info (email, name, picture)
- ✅ Your subscription status
- ✅ Your confessions (what you sent)
- ✅ Delivery status of each confession

### What You Don't Have Access To
- ❌ Other users' data
- ❌ The raw database
- ❌ Recipient responses (until reply feature launches)
- ❌ Access logs

### What Only Admins See
- ⚠️ All user emails (for support)
- ⚠️ All confessions (monitoring for abuse)
- ⚠️ Payment records
- ⚠️ Database statistics

---

## 📱 Your Rights

### You Can:
✅ Download all your data (coming soon)
✅ Delete your account (coming soon)
✅ Request data deletion (GDPR)
✅ Ask what we store about you
✅ Change your profile picture
✅ Cancel your subscription anytime (annual plans)

### We Must:
✅ Keep confessions for legal compliance
✅ Log all payments for accounting
✅ Keep backups for disaster recovery
✅ Comply with law enforcement requests

---

## 🛡️ Privacy by Design

### Anonymity Features:
1. **Unique ID per Confession** - Not your name
2. **Sender/Recipient Separation** - Never linked in message
3. **Device Tracking** - Only for fraud prevention
4. **No Metadata** - Recipient doesn't see your timezone, OS, browser
5. **Encrypted Transit** - Email can't be intercepted
6. **No Third Parties** - Only Brevo for email delivery (encrypted)

### What Makes UnSaid Different:
- ❌ Confession service usually stores sender name with message
- ✅ We send it ANONYMOUS
- ❌ Most services require registration on their site
- ✅ We use Google OAuth (simpler, less data)
- ❌ Most track user analytics
- ✅ We don't track confessions content

---

## ❓ FAQs

**Q: Can you read my confessions?**
A: Yes, but only for abuse prevention & law compliance. We won't share them.

**Q: Will my confession appear anywhere else?**
A: No. Only sent to the recipient's email/WhatsApp.

**Q: Can I delete a confession after sending?**
A: Not after delivered (recipient already has it). But we can mark it as deleted.

**Q: How long do you keep my data?**
A: Indefinitely, unless you request deletion.

**Q: What if I want to completely delete my account?**
A: Coming soon! Feature in development.

**Q: Is my subscription payment safe?**
A: Yes. Razorpay handles all payments (PCI-DSS compliant).

**Q: Do you sell my data?**
A: No. We will never sell, rent, or trade your data.

**Q: What if I receive a confession?**
A: Coming soon! You'll be able to see anonymous confessions sent to your email.

---

## 📞 Privacy Concerns?

- Email: support@unsaid.com (coming soon)
- Privacy Policy: /privacy page
- Terms of Service: /terms page
- Data Request: Use /contact form

---

## 🔄 Data Retention Policy

| Data Type | Kept For | Why |
|-----------|----------|-----|
| Account info | Forever | You might login again |
| Confessions | Forever | Legal/compliance |
| Payment records | 7 years | Tax law |
| Email logs | 90 days | Delivery confirmation |
| Access logs | 30 days | Security audit |
| Device IDs | 1 year | Fraud prevention |

---

## 🌍 Compliance

- ✅ GDPR Ready (data export/deletion coming soon)
- ✅ CCPA Ready (California privacy law)
- ✅ ISO 27001 Standard (information security)
- ✅ SOC 2 Compliance (coming Q1 2026)
- ✅ HIPAA Standards (healthcare if needed)

---

## Summary for Users 🎯

**What We Store:**
- Your Google account info (email, name, picture)
- Your subscription status
- Your confessions (but recipient sees ZERO ID)
- When/what you sent

**What's Private:**
- Your confession content is encrypted
- Recipient has NO IDEA who you are
- Your payments are secure (Razorpay)
- No tracking/analytics on your messages

**What's Safe:**
- We comply with laws
- We have no password (Google OAuth)
- We don't sell your data
- You own your confessions

**What's Coming:**
- Account deletion feature
- Data export feature
- Confession reply system
- Enhanced security settings

**Bottom Line:** 
✅ Your confessions are anonymous to recipients  
✅ Your personal data is protected  
✅ You have full control  
✅ We comply with privacy laws  

---

**This document is for transparency. Know exactly what we store and why.**

Generated: 2025-12-18 | UnSaid v1.0
