# Agent Specification

## Agent Role
The agent is an orchestration layer.

It understands the buyer request and chooses controlled tools.

It is not the enforcement layer.

## Required Tools

### 1. `search_catalog`
Inputs:
- query
- category
- max_price

Calls the merchant backend.

### 2. `propose_cart`
Inputs:
- product IDs
- quantities

The backend calculates the authoritative cart total.

### 3. `checkout`
Inputs:
- mandate ID
- cart items

This invokes backend validation and mandate evaluation.

### 4. `explain_last_action`
Returns a human-readable explanation based on structured backend data.

### Optional Tool: `find_alternatives`
Searches for products compatible with the failed mandate.

## Agent Behavior

### Normal Flow
1. Understand user request.
2. Search catalog.
3. Select relevant products.
4. Present or propose cart.
5. Request checkout.
6. Report backend result.

### On Rejection
The agent must:
1. Not claim the purchase succeeded.
2. Use the backend rejection code.
3. Explain the reason accurately.
4. Search for alternatives if appropriate.
5. Offer an allowed option.

## Example
Backend:

```json
{
  "allowed": false,
  "code": "MANDATE_EXCEEDED",
  "details": {
    "cart_total": 1799,
    "max_amount": 1500
  }
}
```

Good agent response:

> I couldn't proceed with that purchase because the cart total is ₹1,799, which exceeds your ₹1,500 spending limit. I found another running shoe for ₹1,299 that fits the mandate.

## Agent Safety Rules
- Never invent payment success.
- Never override backend rejection.
- Never calculate authority independently.
- Never modify mandates through ordinary shopping tools.
- Treat backend state as authoritative.
