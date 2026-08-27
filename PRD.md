# Product Requirements Document

# Agent-Transactable Merchant

## 1. Product Summary
Build a merchant commerce system that can safely transact with an AI shopping agent.

The system must allow an AI agent to:
1. Search a structured merchant catalog.
2. Select products based on a buyer request.
3. Propose a cart.
4. Attempt checkout.
5. Be deterministically blocked if the action violates a human-defined mandate.
6. Explain the decision.
7. Generate an auditable record of every important step.

## 2. Problem
Most merchant websites are designed for human users, not autonomous agents. Even when an AI can browse products, there are unresolved issues:

- Product data may not be machine-readable.
- The agent may not have bounded spending authority.
- There may be no deterministic enforcement layer.
- Failures may be difficult to explain.
- A reviewer may not know why a payment was initiated or rejected.

## 3. Product Goal
Demonstrate that an AI agent can transact with a merchant safely when:

- merchant data is structured,
- spending authority is explicitly bounded,
- enforcement happens outside the LLM,
- every significant action is logged,
- failures return structured reasons.

## 4. Primary User
### Demo Buyer
A simulated buyer who gives an AI agent a shopping request.

Example:
> Find me running shoes under ₹1,500.

The buyer may also define a mandate such as:

```json
{
  "max_amount": 1500,
  "allowed_categories": ["footwear"],
  "max_items_per_order": 1,
  "expiry": "2026-09-05T23:59:59Z",
  "merchant_id": "merchant_demo"
}
```

## 5. Functional Requirements

### FR-1: Catalog
The system shall expose a structured catalog containing:
- product ID
- name
- description
- price
- stock
- category
- attributes

### FR-2: Product Search
The agent shall be able to search products using structured filters.

### FR-3: Mandate Creation
A mandate shall define:
- maximum order amount
- allowed categories
- maximum number of items
- expiry
- merchant identity

### FR-4: Deterministic Enforcement
Every checkout attempt must pass through the Mandate Engine.

The LLM must not be able to bypass this check.

### FR-5: Structured Rejection
Rejected actions must return machine-readable reasons such as:

- `MANDATE_EXCEEDED`
- `CATEGORY_NOT_ALLOWED`
- `MAX_ITEMS_EXCEEDED`
- `MANDATE_EXPIRED`
- `MERCHANT_NOT_ALLOWED`
- `OUT_OF_STOCK`

### FR-6: Payment
For an approved purchase:
1. Create a Razorpay order in test mode.
2. Complete or simulate test payment.
3. Record payment references.
4. Update order state.

### FR-7: Audit Trail
Every significant event must be logged.

Minimum events:
- user request received
- catalog searched
- products considered
- cart proposed
- mandate evaluated
- mandate approved or rejected
- payment order created
- payment result received
- alternative proposed

### FR-8: Explainability
The system must expose why an action was approved or rejected.

Example:

> Checkout rejected because the cart total of ₹1,799 exceeds the mandate maximum of ₹1,500 by ₹299.

### FR-9: Graceful Failure
At least one failure scenario must be deterministic and reproducible during the demo.

Recommended scenario:
A product is selected that exceeds the maximum allowed amount. The backend rejects checkout, the agent explains the reason, and a cheaper alternative is offered.

## 6. Non-Functional Requirements
- Security-critical checks must be server-side.
- Audit records should be append-only.
- API errors should use consistent JSON.
- Demo flow should be reproducible.
- No real money should be used.
- The project should work locally with minimal setup.

## 7. Success Criteria
The project is successful when a judge can clearly verify:

1. An agent can read and use the catalog.
2. The agent cannot exceed a mandate.
3. The rejection happens in deterministic backend code.
4. Every action appears in the audit timeline.
5. A failed action is explained and handled gracefully.
6. A successful flow reaches Razorpay test-mode order/payment flow.

## 8. Out of Scope
- Real autonomous spending
- Production banking integration
- Multi-agent negotiation
- Complex recommendation algorithms
- Authentication providers beyond what is needed for the demo
- Real inventory synchronization
