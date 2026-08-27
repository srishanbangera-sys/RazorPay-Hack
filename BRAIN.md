# BRAIN.md — Project Context for AI Builders

## Read This First
You are building **Agent-Transactable Merchant**, a hackathon MVP.

Do not interpret this as a generic AI shopping chatbot.

The product's main value is **systems rigor around AI-driven commerce**.

The LLM is intentionally thin. The backend is the source of truth.

---

# 1. The Core Thesis

An AI agent should be able to interact with a merchant, but it must not receive unrestricted authority.

The architecture separates:

```text
INTELLIGENCE
What the AI wants to do

from

AUTHORITY
What the system actually permits
```

The LLM may:
- search products,
- compare products,
- propose carts,
- request checkout,
- explain outcomes.

The LLM may not:
- directly create a payment without backend validation,
- override a mandate,
- modify mandate limits,
- fabricate successful payment state,
- write arbitrary audit records.

---

# 2. The Golden Rule

## The Mandate Engine is the security boundary.

Never enforce spending limits only through prompts.

This is invalid:

> "Do not spend more than ₹1500."

The model could ignore, misunderstand, or be manipulated.

This is required:

```python
decision = check_mandate(action, mandate)

if not decision.allowed:
    return structured_rejection(decision.reason)
```

The backend must perform this check immediately before any payment/order operation.

---

# 3. System Mental Model

```text
Buyer
  ↓ natural language
AI Agent
  ↓ tool call
Merchant Backend
  ↓
Validation Layer
  ↓
Mandate Engine
  ├── REJECT → Audit → Explanation → Alternative
  └── APPROVE → Razorpay Order → Payment → Audit
```

The frontend is primarily a demonstration and observability surface.

The strongest visual element should be the audit timeline.

---

# 4. Required Demo

The final application must support two flows.

## Flow A: Successful Purchase

User:
> Find running shoes under ₹1500.

Agent:
1. Searches catalog.
2. Selects an allowed product.
3. Proposes cart.
4. Requests checkout.
5. Backend validates mandate.
6. Mandate passes.
7. Razorpay test order is created.
8. Payment result is handled.
9. Audit timeline shows all events.

## Flow B: Blocked Purchase

User:
> Buy the premium running shoes.

Assume the selected product costs ₹1799 while the mandate maximum is ₹1500.

Required behavior:
1. Agent proposes product.
2. Checkout is requested.
3. Backend calculates total.
4. Mandate Engine rejects.
5. No payment order is created.
6. Audit event records the rejection.
7. UI displays exact reason.
8. Agent offers a cheaper allowed alternative.

This must never crash.

---

# 5. Important Design Decisions

## Decision 1: Backend over prompt enforcement
All authority checks are deterministic backend code.

## Decision 2: Structured errors
Never return only:
```json
{"error": "Something went wrong"}
```

Prefer:
```json
{
  "success": false,
  "code": "MANDATE_EXCEEDED",
  "message": "Cart total exceeds the allowed maximum.",
  "details": {
    "cart_total": 1799,
    "max_amount": 1500,
    "difference": 299
  }
}
```

## Decision 3: Append-only audit trail
Audit records should not be casually updated or deleted.

## Decision 4: Agent proposes; backend executes
The agent should call backend tools rather than independently managing business state.

## Decision 5: Deterministic demo
Do not depend on flaky failures such as network outages for the primary failure demonstration.

---

# 6. Recommended Architecture

Backend:
- Python
- FastAPI
- SQLAlchemy
- SQLite for MVP
- Pydantic schemas
- pytest

Frontend:
- React
- Vite
- Simple clean dashboard

LLM:
- OpenAI or Anthropic tool calling
- Keep provider abstraction simple if possible

Payment:
- Razorpay Test Mode

---

# 7. Build Order

Do not start with the LLM.

Build in this order:

1. Project structure.
2. Database models.
3. Seed catalog.
4. Catalog API.
5. Mandate Engine.
6. Unit tests for mandate logic.
7. Cart/order logic.
8. Audit logging.
9. Razorpay integration.
10. Frontend timeline.
11. Agent tool layer.
12. Failure handling.
13. Polish and documentation.

At every stage, preserve working functionality.

---

# 8. Definition of Done

The project is done only when:

- [ ] Catalog is structured and queryable.
- [ ] Mandate limits are enforced server-side.
- [ ] Tests prove rejected actions cannot pass.
- [ ] Successful checkout reaches Razorpay test mode.
- [ ] Rejected checkout does not create payment.
- [ ] Audit timeline shows decision history.
- [ ] Rejection has a machine-readable reason.
- [ ] Agent can explain the result.
- [ ] Agent offers an allowed alternative.
- [ ] Demo can be repeated reliably.

---

# 9. Things to Avoid

Do not:
- over-engineer microservices,
- use blockchain unless required,
- build authentication for weeks,
- spend most of the project on prompt engineering,
- allow the frontend to decide whether a mandate passes,
- trust an LLM-generated total without server calculation,
- mark a payment successful based solely on client input,
- hide the failure scenario.

The goal is a clean, understandable, defensible MVP.

---

# 10. Priority Hierarchy

If time is limited, prioritize in this order:

1. Mandate Engine correctness.
2. Audit trail.
3. Successful checkout flow.
4. Graceful failure.
5. Explainability.
6. UI polish.
7. Agent sophistication.

A simple agent with excellent enforcement is better than a sophisticated agent with weak controls.
