# Failure Scenarios

## Primary Demo Failure: Mandate Exceeded

### Setup
Mandate:

```json
{
  "max_amount": 1500,
  "allowed_categories": ["footwear"],
  "max_items_per_order": 1
}
```

Product:

```text
Premium Runner
₹1799
Category: footwear
```

### Expected Flow
1. Agent selects Premium Runner.
2. Agent requests checkout.
3. Backend recalculates total as ₹1799.
4. Mandate Engine compares ₹1799 > ₹1500.
5. Checkout is rejected.
6. No Razorpay order is created.
7. Audit event is written.
8. API returns `MANDATE_EXCEEDED`.
9. Agent explains the rejection.
10. Agent suggests a cheaper product.

### Expected Response

```json
{
  "allowed": false,
  "code": "MANDATE_EXCEEDED",
  "details": {
    "cart_total": 1799,
    "max_amount": 1500,
    "difference": 299
  }
}
```

## Secondary Failures
Implement if time permits:
- category not allowed,
- mandate expired,
- maximum item count exceeded,
- out of stock,
- Razorpay API error.

The primary demo failure must remain deterministic and easy to reproduce.
