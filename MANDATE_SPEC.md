# Mandate Specification

## Purpose
A mandate represents explicit authority granted to an AI agent for a specific merchant and purchase context.

A mandate is a hard boundary.

## Schema

```json
{
  "id": "mandate_001",
  "merchant_id": "merchant_demo",
  "max_amount": 1500,
  "allowed_categories": ["footwear", "sports"],
  "max_items_per_order": 2,
  "expires_at": "2026-09-05T23:59:59Z",
  "status": "active"
}
```

## Rules

### Rule 1: Mandate Must Be Active
If status is not active:

`MANDATE_INACTIVE`

### Rule 2: Mandate Must Not Be Expired
If current server time is later than `expires_at`:

`MANDATE_EXPIRED`

### Rule 3: Merchant Must Match
If checkout merchant does not equal `merchant_id`:

`MERCHANT_NOT_ALLOWED`

### Rule 4: Amount Limit
The server-calculated cart total must be less than or equal to `max_amount`.

If not:

`MANDATE_EXCEEDED`

### Rule 5: Category Restrictions
Every product category must belong to `allowed_categories`.

Otherwise:

`CATEGORY_NOT_ALLOWED`

### Rule 6: Item Limit
The total quantity must not exceed `max_items_per_order`.

Otherwise:

`MAX_ITEMS_EXCEEDED`

### Rule 7: Stock
Every item must be in stock.

Otherwise:

`OUT_OF_STOCK`

## Evaluation Order
Recommended order:

1. Active status
2. Expiry
3. Merchant
4. Stock
5. Category
6. Item count
7. Amount

The result should include the first blocking reason and useful details.

## Decision Response

```json
{
  "allowed": false,
  "code": "MANDATE_EXCEEDED",
  "reason": "Cart total exceeds maximum permitted amount.",
  "details": {
    "cart_total": 1799,
    "max_amount": 1500,
    "difference": 299
  }
}
```

## Non-Negotiable Requirement
The Mandate Engine must calculate totals from server-side product data.

Never trust:
- a client-provided total,
- an LLM-provided total,
- a frontend-calculated total.
