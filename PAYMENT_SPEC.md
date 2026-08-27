# Payment Specification

## Goal
Integrate Razorpay using Test Mode only.

No real money should be required for the hackathon demo.

## Flow

```text
Mandate Approved
      ↓
Create Local Order
      ↓
Create Razorpay Order
      ↓
Return Razorpay Checkout Data
      ↓
Test Payment
      ↓
Verify / Process Payment
      ↓
Update Order
      ↓
Write Audit Event
```

## Important Rules

### Rule 1: Mandate Before Razorpay
Do not create a Razorpay order before mandate approval.

### Rule 2: Server Calculates Amount
The amount sent to Razorpay must come from server-side order calculation.

### Rule 3: Verify Payment
Do not trust a client message saying "payment successful."

Use the appropriate Razorpay verification mechanism for the selected integration.

### Rule 4: Webhook Security
If webhooks are implemented:
- verify signature,
- handle duplicate delivery,
- make processing idempotent.

## Failure States
- mandate rejected
- Razorpay order creation failed
- payment failed
- payment verification failed

Each state should create an audit event.

## Environment Variables

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Never commit these values.
