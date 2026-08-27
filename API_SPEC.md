# API Specification

Base URL:

```text
/api/v1
```

## Products

### GET `/products`

Optional query parameters:
- `category`
- `max_price`
- `q`
- `in_stock`

Example response:

```json
{
  "items": [
    {
      "id": "prod_001",
      "name": "Sprint Runner",
      "price": 1299,
      "stock": 12,
      "category": "footwear",
      "attributes": {
        "type": "running",
        "sizes": ["7", "8", "9"]
      }
    }
  ]
}
```

## Mandates

### GET `/mandates/{mandate_id}`

Returns the active mandate and its constraints.

### POST `/mandates`

Creates a demo mandate.

## Checkout

### POST `/checkout/propose`

Input:

```json
{
  "mandate_id": "mandate_001",
  "items": [
    {
      "product_id": "prod_001",
      "quantity": 1
    }
  ]
}
```

The backend calculates totals and evaluates the mandate.

Success:

```json
{
  "allowed": true,
  "decision_code": "MANDATE_APPROVED",
  "cart_total": 1299
}
```

Failure:

```json
{
  "allowed": false,
  "decision_code": "MANDATE_EXCEEDED",
  "message": "Cart total exceeds the allowed maximum.",
  "details": {}
}
```

### POST `/checkout/confirm`

This endpoint must independently validate the mandate again.

Never assume `/checkout/propose` approval is still valid.

If valid, create a local order and Razorpay order.

## Payments

### POST `/payments/webhook`

Handles Razorpay events.

Requirements:
- verify webhook signature,
- make processing idempotent,
- update payment/order state,
- write audit event.

## Audit

### GET `/audit`

Optional filters:
- `trace_id`
- `order_id`
- `action_id`

### GET `/audit/{event_id}`

Returns a detailed event.

## Explainability

### GET `/explain/{action_id}`

Returns structured information about why an action was approved or rejected.

Example:

```json
{
  "action_id": "act_123",
  "decision": "rejected",
  "code": "MANDATE_EXCEEDED",
  "explanation": "The requested cart total was ₹1799, while the mandate permits up to ₹1500."
}
```

## Agent

### POST `/agent/chat`

Input:

```json
{
  "message": "Find me running shoes under ₹1500",
  "mandate_id": "mandate_001",
  "conversation_id": "conv_001"
}
```

The agent may invoke controlled backend tools.

The response should include:
- assistant message,
- products considered if relevant,
- proposed cart if relevant,
- decision state,
- trace ID.
