# Architecture

## High-Level Architecture

```text
┌───────────────┐
│ Buyer / Judge │
└───────┬───────┘
        │
        ▼
┌────────────────────────┐
│ React Web Application  │
│ Chat + Cart + Timeline │
└───────────┬────────────┘
            │ HTTP
            ▼
┌────────────────────────┐
│ FastAPI Merchant API   │
├────────────────────────┤
│ Catalog Service        │
│ Cart / Order Service   │
│ Agent Tool Gateway     │
│ Explainability Service │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Mandate Engine         │
│ Deterministic Rules    │
└───────┬─────────┬──────┘
        │ PASS    │ FAIL
        ▼         ▼
┌────────────┐  ┌──────────────┐
│ Razorpay   │  │ Audit Event  │
│ Test Mode  │  │ + Explanation│
└─────┬──────┘  └──────────────┘
      │
      ▼
┌────────────────────────┐
│ SQLite / PostgreSQL    │
│ Products               │
│ Mandates               │
│ Orders                 │
│ Audit Events           │
└────────────────────────┘
```

## Component Responsibilities

### Frontend
Displays:
- buyer conversation,
- products,
- proposed cart,
- mandate status,
- checkout state,
- audit timeline.

The frontend must never be the authority for mandate enforcement.

### Agent Layer
Translates natural language into controlled tool calls.

### Backend
Owns business logic, validation, order state, and payment integration.

### Mandate Engine
Pure deterministic business logic.

Prefer a function shaped like:

```python
def check_mandate(
    action: CheckoutAction,
    mandate: Mandate
) -> MandateDecision:
    ...
```

This should be easy to unit test without FastAPI, the database, or the LLM.

### Audit Service
Records important events with correlation IDs.

### Payment Adapter
Encapsulates Razorpay-specific logic.

## Checkout Sequence

```text
Agent
  │ checkout(cart)
  ▼
Backend validates cart
  │
  ▼
Mandate Engine
  │
  ├─ FAIL ────────────────► Audit rejection
  │                         │
  │                         ▼
  │                    Return reason
  │
  └─ PASS
        │
        ▼
   Create local order
        │
        ▼
   Create Razorpay order
        │
        ▼
     Audit event
        │
        ▼
   Return checkout data
```

## Correlation IDs
Every user request should generate a `trace_id`.

That ID should connect:
- agent request,
- tool calls,
- mandate decisions,
- order,
- payment,
- audit events.

This makes the system explainable as a complete sequence rather than isolated database rows.
