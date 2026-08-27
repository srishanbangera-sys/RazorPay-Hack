# Master Build Prompt

You are the lead engineer building this project.

Your task is to implement the complete application described by the documentation in this repository.

## Read Order
Before writing code, read these files in order:

1. `BRAIN.md`
2. `PRD.md`
3. `ARCHITECTURE.md`
4. `MANDATE_SPEC.md`
5. `DATABASE_SCHEMA.md`
6. `API_SPEC.md`
7. `AGENT_SPEC.md`
8. `AUDIT_SPEC.md`
9. `PAYMENT_SPEC.md`
10. `UI_UX_SPEC.md`
11. `ACCEPTANCE_CRITERIA.md`
12. `TESTING_STRATEGY.md`
13. `IMPLEMENTATION_PLAN.md`

## Your Objective
Build a runnable full-stack MVP called **Agent-Transactable Merchant**.

The project must demonstrate:

1. A structured merchant catalog.
2. An AI agent that uses controlled tools.
3. A human-defined mandate.
4. Deterministic backend enforcement.
5. Razorpay test-mode checkout.
6. An append-oriented audit trail.
7. A visible audit timeline.
8. A reproducible mandate-exceeded failure.
9. A graceful explanation and cheaper alternative.

## Non-Negotiable Architecture Rule

The LLM is not an authority layer.

The LLM may propose an action.

The backend must independently validate and authorize it.

The required flow is:

```text
LLM / Agent
    ↓
Backend Tool Endpoint
    ↓
Server-side Validation
    ↓
Mandate Engine
    ↓
Approved? ── No → Structured rejection + Audit
    │
   Yes
    ↓
Create Order / Payment
```

There must be no endpoint or code path that allows the LLM or frontend to bypass the Mandate Engine.

## Recommended Stack
Use:
- Python 3.11+
- FastAPI
- Pydantic
- SQLAlchemy
- SQLite
- pytest
- React + Vite
- Razorpay Test Mode
- OpenAI or Anthropic tool calling

You may adjust implementation details, but preserve the architectural principles.

## Implementation Instructions

### Step 1: Scaffold
Create a clean repository structure for frontend and backend.

### Step 2: Backend Domain Models
Implement:
- Product
- Mandate
- Order
- OrderItem
- Payment
- AuditEvent

### Step 3: Seed Data
Create 8–10 products across categories.

Include deterministic demo products:
- `Sprint Runner` — ₹1299 — footwear
- `Premium Runner` — ₹1799 — footwear

### Step 4: Mandate Engine
Implement as isolated, testable business logic.

Required rejection codes:
- `MANDATE_INACTIVE`
- `MANDATE_EXPIRED`
- `MERCHANT_NOT_ALLOWED`
- `OUT_OF_STOCK`
- `CATEGORY_NOT_ALLOWED`
- `MAX_ITEMS_EXCEEDED`
- `MANDATE_EXCEEDED`

Use server-side product prices and quantities.

### Step 5: Tests
Write unit tests for all mandate rules.

Add an integration test proving a rejected checkout does not call Razorpay order creation.

### Step 6: Audit System
Create audit events for:
- user request,
- catalog search,
- cart proposal,
- mandate check,
- approval/rejection,
- order creation,
- payment result,
- alternative proposal.

Use a `trace_id` to correlate one flow.

### Step 7: Checkout
Implement:
- proposal/evaluation,
- final confirmation,
- mandate re-check immediately before payment,
- Razorpay test-mode order creation.

### Step 8: Frontend
Create a clean, modern demo interface containing:
- conversation area,
- product results,
- cart,
- mandate status,
- audit timeline.

Make the blocked decision visually obvious.

### Step 9: Agent
Implement a small tool-calling agent.

Required tools:
- search_catalog
- propose_cart
- checkout
- explain_last_action

Optional:
- find_alternatives

The agent must always treat backend results as authoritative.

### Step 10: Graceful Failure
Implement this exact reproducible scenario:

Mandate maximum: ₹1500.

Attempted product:
`Premium Runner — ₹1799`.

Expected result:
- mandate rejection,
- code `MANDATE_EXCEEDED`,
- difference displayed,
- audit event created,
- no Razorpay order created,
- cheaper alternative offered.

## Code Quality
- Use clear folder boundaries.
- Avoid unnecessary microservices.
- Keep the Mandate Engine independent from FastAPI and the LLM.
- Use typed schemas.
- Add meaningful error responses.
- Keep secrets in environment variables.
- Provide `.env.example`.
- Provide setup instructions.

## Completion Checklist
Do not claim the project is complete until every item in `ACCEPTANCE_CRITERIA.md` has been checked against the implementation.

When finished:
1. Summarize the architecture.
2. List the API endpoints.
3. Explain how to run locally.
4. Explain how to run the successful demo.
5. Explain how to run the mandate-exceeded demo.
6. List any environment variables required.
7. Identify any remaining optional improvements.
