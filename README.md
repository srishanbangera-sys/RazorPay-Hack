# Agent-Transactable Merchant

> **Bounded Autonomous AI Commerce with Deterministic Server-Side Mandate Enforcement and Append-Only Audit Trail.**

---

## 1. Overview

**Agent-Transactable Merchant** demonstrates how an autonomous AI shopping agent can safely interact with a merchant catalog, select products, propose shopping carts, and attempt checkout—while operating strictly within **human-defined spending mandates**.

### The Core Principle
> **The LLM is NOT a security or authorization boundary.**  
> The AI agent may decide **what to propose**, but the deterministic backend engine decides **what is permitted**.

Every purchase-related action is evaluated by an isolated, deterministic Mandate Engine before any payment order is generated. Every significant action across the shopping lifecycle is logged to an append-only audit trail with correlated trace IDs.

```text
Buyer
  │ (Natural Language)
  ▼
AI Shopping Agent
  │ (Controlled Tool Calls)
  ▼
Merchant Backend Validation
  │ (Server-Calculated Authoritative Pricing)
  ▼
Deterministic Mandate Engine
  │
  ├── REJECT (e.g. ₹1,799 > ₹1,500 limit)
  │      ↓
  │   Append Audit Event (MANDATE_REJECTED)
  │      ↓
  │   Structured Error Details (difference: ₹299)
  │      ↓
  │   Zero Payment Creation Guarantee
  │      ↓
  │   Agent Explains Reason + Recommends Alternative (₹1,299)
  │
  └── APPROVE (e.g. ₹1,299 ≤ ₹1,500 limit)
         ↓
      Create Local Order
         ↓
      Razorpay Test Mode Order Creation
         ↓
      Simulate/Verify Payment
         ↓
      Append Audit Event (PAYMENT_SUCCEEDED)
```

---

## 2. Core Capabilities

- **Structured Merchant Catalog**: Machine-readable product inventory with real-time stock, pricing, and category metadata.
- **Deterministic Mandate Engine**: Pure, isolated business logic evaluating 7 rule gates (`MANDATE_INACTIVE`, `MANDATE_EXPIRED`, `MERCHANT_NOT_ALLOWED`, `OUT_OF_STOCK`, `CATEGORY_NOT_ALLOWED`, `MAX_ITEMS_EXCEEDED`, `MANDATE_EXCEEDED`).
- **Authoritative Server-Side Pricing**: Zero client or LLM price trust; cart totals are always computed from server database records.
- **Critical Payment Isolation**: If a mandate is rejected, payment order creation is physically bypassed.
- **Append-Only Correlated Audit Trail**: Every event across a shopping session shares a `trace_id` for end-to-end explainability.
- **Razorpay Test Mode Integration**: Full test mode support with signature verification and mock adapter fallback.
- **Explainability API**: Natural language and machine-readable justifications for every approved or blocked decision.
- **Modern Glassmorphic UI**: Real-time React dashboard with interactive chat, mandate tuning sliders, cart decision gates, product catalog, and audit timeline.

---

## 3. Tech Stack

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, SQLite (PostgreSQL compatible)
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons
- **Payments**: Razorpay Test Mode SDK & Mock Adapter
- **Testing**: pytest (25 unit, integration, and security regression tests)

---

## 4. Repository Structure

```text
agent-transactable-merchant/
│
├── backend/
│   ├── app/
│   │   ├── api/                  # FastAPI Routers
│   │   │   ├── products.py       # Catalog endpoints
│   │   │   ├── mandates.py       # Mandate management
│   │   │   ├── checkout.py       # Two-phase checkout (propose/confirm)
│   │   │   ├── audit.py          # Append-only audit trail
│   │   │   ├── explain.py        # Explainability endpoint
│   │   │   ├── payments.py       # Razorpay verification & webhooks
│   │   │   └── agent.py          # Agent conversation & tool execution
│   │   │
│   │   ├── core/                 # Config & database setup
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   │
│   │   ├── models/               # SQLAlchemy DB Models
│   │   │   ├── product.py
│   │   │   ├── mandate.py
│   │   │   ├── order.py
│   │   │   ├── payment.py
│   │   │   └── audit.py
│   │   │
│   │   ├── schemas/              # Pydantic Input/Output Schemas
│   │   │   ├── product.py
│   │   │   ├── mandate.py
│   │   │   ├── checkout.py
│   │   │   ├── audit.py
│   │   │   ├── payment.py
│   │   │   ├── explain.py
│   │   │   └── agent.py
│   │   │
│   │   ├── services/             # Business Logic & Orchestration
│   │   │   ├── catalog_service.py
│   │   │   ├── mandate_service.py
│   │   │   ├── checkout_service.py
│   │   │   ├── audit_service.py
│   │   │   ├── payment_service.py
│   │   │   ├── explain_service.py
│   │   │   └── agent_service.py
│   │   │
│   │   ├── mandate_engine/       # Pure, Isolated Mandate Logic
│   │   │   ├── models.py
│   │   │   ├── rules.py
│   │   │   └── engine.py
│   │   │
│   │   ├── seed.py               # Deterministic seed data
│   │   └── main.py               # FastAPI App entrypoint
│   │
│   ├── tests/                    # 25 Comprehensive Tests
│   │   ├── test_mandate_engine.py
│   │   ├── test_catalog.py
│   │   ├── test_checkout.py
│   │   ├── test_audit.py
│   │   ├── test_agent.py
│   │   └── test_security_regression.py
│   │
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/           # UI Components
│   │   │   ├── Header.tsx
│   │   │   ├── DemoControls.tsx
│   │   │   ├── MandateCard.tsx
│   │   │   ├── AgentChat.tsx
│   │   │   ├── CartDecisionCard.tsx
│   │   │   ├── ProductCatalog.tsx
│   │   │   ├── AuditTimeline.tsx
│   │   │   ├── AuditDetailModal.tsx
│   │   │   └── RazorpayModal.tsx
│   │   │
│   │   ├── services/             # API Client
│   │   │   └── api.ts
│   │   │
│   │   ├── types/                # TypeScript Interfaces
│   │   │   └── index.ts
│   │   │
│   │   ├── App.tsx               # Main Dashboard
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── README.md
├── BUILD_LOG.md
└── specs / docs (PRD, ARCHITECTURE, MANDATE_SPEC, etc.)
```

---

## 5. Quick Start Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### 1. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Optional settings in `.env`:
```env
# Razorpay Test Mode (leave empty to use built-in Mock Adapter)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Database
DATABASE_URL=sqlite:///./agent_merchant.db

# LLMs (optional, built-in intelligent tool orchestrator handles demo flows out of the box)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

### 2. Run the Backend
```bash
cd backend
pip install -r requirements.txt
python app/seed.py
uvicorn app.main:app --reload --port 8000
```
Backend API will be available at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Running Tests

Run the complete test suite (25 tests):
```bash
cd backend
PYTHONPATH=. pytest -v tests/
```

Test breakdown:
1. `tests/test_mandate_engine.py`: 11 unit tests covering all 7 mandate rules and boundaries.
2. `tests/test_security_regression.py`: Critical regression test proving payment order creation is never invoked on mandate rejection.
3. `tests/test_checkout.py`: Propose and confirm flows with server-side price calculation.
4. `tests/test_catalog.py`: Search, filter, and category retrieval.
5. `tests/test_audit.py`: Append-only event correlation and explainability.
6. `tests/test_agent.py`: Tool invocation, rejection handling, and alternative recommendation.

---

## 7. Demo Scenarios Walkthrough

### Scenario 1 — Successful Flow
1. **Mandate State**: Max Spend ₹1,500, Category `footwear`, Max items: 1, Status: `active`.
2. **Buyer Prompt**: *"Find me running shoes under ₹1500"*.
3. **Flow**:
   - Agent executes `search_catalog(query="running")`.
   - Discovers `Sprint Runner` (₹1,299) and selects it.
   - Proposes cart (`propose_cart`).
   - Server computes total: ₹1,299.
   - Mandate Engine approves (`MANDATE_APPROVED`).
   - Local order created (`ORDER_CREATED`).
   - Razorpay test-mode order created (`RAZORPAY_ORDER_CREATED`).
   - UI displays green `✓ MANDATE APPROVED` card with direct checkout modal trigger.
   - All events visible in the Audit Timeline under the same `trace_id`.

### Scenario 2 — Graceful Mandate Blocked Flow (Primary Required Failure)
1. **Mandate State**: Max Spend ₹1,500, Category `footwear`, Max items: 1.
2. **Buyer Prompt**: *"Buy the premium running shoes"*.
3. **Flow**:
   - Agent selects `Premium Runner` (₹1,799).
   - Proposes cart with product ID `prod_002`.
   - Mandate Engine calculates server total: ₹1,799.
   - Mandate Engine compares ₹1,799 > ₹1,500 spending limit.
   - Engine rejects with `MANDATE_EXCEEDED` and details `difference: 299`.
   - Backend guarantees: **No Razorpay order is created**.
   - Audit event records `MANDATE_REJECTED`.
   - UI displays red `✕ TRANSACTION BLOCKED` badge with excess indicator `+ ₹299`.
   - Agent explains the exact limit violation and searches for compliant alternatives.
   - Agent recommends the `Sprint Runner` (₹1,299) or `Urban Sneaker Lite` (₹999).

---

## 8. API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/products` | List and search merchant catalog items with filters |
| `GET` | `/api/v1/mandates/active` | Retrieve the active demo mandate |
| `PATCH` | `/api/v1/mandates/{id}` | Update mandate limits dynamically |
| `POST` | `/api/v1/checkout/propose` | Propose cart, calculate authoritative pricing, evaluate mandate |
| `POST` | `/api/v1/checkout/confirm` | Re-evaluate mandate, create order, trigger Razorpay order |
| `POST` | `/api/v1/payments/verify` | Verify Razorpay signature and capture order |
| `GET` | `/api/v1/audit` | Query append-only audit trail filtered by `trace_id` |
| `GET` | `/api/v1/explain/{action_id}` | Get human and machine explanation of a decision |
| `POST` | `/api/v1/agent/chat` | AI Agent natural language tool-calling interface |

---

## 9. License

MIT License. Designed for demonstration of bounded autonomous agent commerce.
