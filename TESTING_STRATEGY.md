# Testing Strategy

## Priority
The most important tests are for the Mandate Engine.

## Unit Tests

### Amount
- total below maximum → approved
- total equal to maximum → approved
- total above maximum → rejected

### Category
- all categories allowed → approved
- one category disallowed → rejected

### Item Count
- quantity equal to limit → approved
- quantity above limit → rejected

### Expiry
- future expiry → approved
- past expiry → rejected

### Merchant
- matching merchant → approved
- non-matching merchant → rejected

### Stock
- available stock → approved
- insufficient stock → rejected

## Integration Tests
Test:

```text
API request
→ server validation
→ mandate evaluation
→ order state
→ audit event
```

## Critical Regression Test
A mandate-rejected checkout must prove:

- HTTP response indicates rejection,
- no Razorpay order creation method is called,
- no successful payment state exists,
- audit event contains rejection code.
