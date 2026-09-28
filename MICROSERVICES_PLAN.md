# SkyBook Microservice Extensions

## 1. Loyalty Service

### Purpose
The Loyalty Service manages customer rewards, points, coupons, and membership tiers for SkyBook.

### Core features
- Award points after successful booking or payment confirmation
- Track user tier: Bronze, Silver, Gold
- Apply coupons during booking or checkout
- View reward balance and history

### Suggested entities
- UserRewardAccount
- RewardTransaction
- Coupon
- MembershipTier

### Fake-but-realistic behavior
- Award 1 point for every $10 spent
- Bronze: 0–999 points
- Silver: 1000–4999 points
- Gold: 5000+ points
- Apply a sample coupon such as `WELCOME10`

### Integration with main app
- When a booking is confirmed, the main app sends a reward event to the Loyalty Service
- The Loyalty Service updates the user’s points and returns a reward summary

### Example API
- POST /loyalty/points/earn
- POST /loyalty/coupons/apply
- GET /loyalty/users/{userId}

---

## 2. Notification Service

### Purpose
The Notification Service handles booking confirmation emails, reminders, and cancellation alerts.

### Core features
- Send booking confirmation notification
- Send payment success or failure notification
- Send flight reminder before departure
- Send cancellation or refund alerts

### Fake-but-realistic behavior
- Store notification records in memory or database
- Simulate email/SMS/WhatsApp dispatch with a mocked sender
- Return a message like `queued` or `sent`

### Integration with main app
- The main booking or payment service publishes events such as:
  - booking.created
  - payment.succeeded
  - booking.cancelled
- The Notification Service listens and sends a notification

### Example API
- POST /notifications/send
- GET /notifications/users/{userId}

---

## 3. User Journey Map

### Journey overview
1. User discovers a flight
2. User selects a seat and schedule
3. User creates a booking
4. Booking enters payment-pending state
5. Payment is simulated and confirmed
6. Booking becomes confirmed
7. Notification is sent to the user
8. Loyalty points are added to the user account
9. User can view booking history, rewards, and notifications

### Key experience points
- Clear checkout flow
- Payment status visibility
- Confirmation message after success
- Reward points earned automatically
- Simple notification history for the user

### College-project demo story
A student can demonstrate:
- Booking creation
- Payment simulation
- Booking confirmation
- Notification delivery
- Reward point update

This creates a complete end-to-end experience while keeping the project modular and easy to explain.
