# Build Log

## Development Stages & Milestones

### Phase 1 — Project Setup & Core Configuration
**Goal:** Establish clean repository scaffolding, database initialization, and configuration management.
**What was implemented:**
- Created `backend/app/core/config.py` using Pydantic `BaseSettings` for database URL, Razorpay credentials, and LLM configuration.
- Created `backend/app/core/database.py` with SQLAlchemy engine and session factory supporting SQLite and PostgreSQL.
- Configured dependencies in `requirements.txt` (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `pytest`, `razorpay`, `httpx`).

---

### Phase 2 — Domain Models & Catalog Seed Data
**Goal:** Implement data layer matching `DATABASE_SCHEMA.md` and seed deterministic product inventory.
**What was implemented:**
- Created database models for `Product`, `Mandate`, `Order`, `OrderItem`, `Payment`, and `AuditEvent`.
- Created `backend/app/seed.py` seeding 10 structured catalog items across footwear, electronics, fitness, clothing, and accessories.
- Included deterministic demo items: `Sprint Runner` (₹1,299), `Premium Runner` (₹1,799), and `Phantom Sprint Elite` (out-of-stock boundary testing).
- Seeded default active mandate: ₹1,500 spending limit, `footwear` category, 1 max item per order.

---

### Phase 3 — Deterministic Mandate Engine & Pure Unit Tests
**Goal:** Implement pure, isolated Mandate Engine enforcing bounded authority.
**What was implemented:**
- Created `backend/app/mandate_engine/` containing `models.py`, `rules.py`, and `engine.py`.
- Enforces 7 deterministic gates in priority order:
  1. `MANDATE_INACTIVE`: Checks status is active.
  2. `MANDATE_EXPIRED`: Checks server clock against expiration timestamp.
  3. `MERCHANT_NOT_ALLOWED`: Verifies merchant match.
  4. `OUT_OF_STOCK`: Verifies physical inventory availability.
  5. `CATEGORY_NOT_ALLOWED`: Enforces allowed category list.
  6. `MAX_ITEMS_EXCEEDED`: Enforces maximum items per order.
  7. `MANDATE_EXCEEDED`: Compares server-calculated cart total against spending limit.
- Created `backend/tests/test_mandate_engine.py` with 11 unit tests covering all rules and edge cases.

---

### Phase 4 — Two-Phase Checkout & Authoritative Pricing
**Goal:** Prevent client-side or LLM-side pricing manipulation.
**What was implemented:**
- Implemented `CheckoutService.propose_checkout` and `CheckoutService.confirm_checkout`.
- Server fetches authoritative prices directly from the database and computes `cart_total`.
- Re-evaluates the mandate immediately before order creation and payment generation.
- If rejected, halts execution immediately without creating an approved order or invoking Razorpay.

---

### Phase 5 — Append-Only Audit Trail & Explainability
**Goal:** Implement correlated, immutable-style audit logging.
**What was implemented:**
- Implemented `AuditService` with automatic payload sanitization (redacting secrets, cards, and sensitive tokens).
- Attached `trace_id` to correlate all events in a single shopping session.
- Implemented `GET /api/v1/audit` with filters for `trace_id`, `order_id`, and `actor`.
- Implemented `GET /api/v1/explain/{action_id}` delivering human-readable and machine-readable explanations.

---

### Phase 6 — Razorpay Integration (Test Mode & Adapter)
**Goal:** Safe test-mode payment gateway integration.
**What was implemented:**
- Implemented `PaymentService` supporting real Razorpay Test Mode keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) and zero-dependency mock adapter fallback.
- Created `POST /api/v1/payments/verify` for signature verification and order capture.
- Created `POST /api/v1/payments/webhook` for idempotent webhook handling.
- Appended `PAYMENT_SUCCEEDED` and `PAYMENT_FAILED` audit events.

---

### Phase 7 — AI Shopping Agent with Controlled Tools
**Goal:** Orchestrate buyer requests using controlled backend tool endpoints.
**What was implemented:**
- Implemented `AgentService.process_chat` with tools:
  - `search_catalog`
  - `propose_cart`
  - `checkout`
  - `explain_last_action`
  - `find_alternatives`
- Fully deterministic response handling for demo scenarios with optional LLM API fallback.
- On mandate rejection, agent accurately reports the reason and recommends compliant alternatives.

---

### Phase 8 — Modern React Dashboard
**Goal:** Build a glassmorphic, visual UI demonstrating bounded authority and auditability.
**What was implemented:**
- Built with React 18, Vite, TypeScript, Tailwind CSS, and Lucide icons.
- Top navigation with merchant info and engine health status.
- Demo Scenario bar with one-click triggers for Scenario 1 (Approved) and Scenario 2 (Blocked).
- Active Mandate card with live limit adjustment sliders.
- Cart Decision card with prominent `MANDATE APPROVED` / `TRANSACTION BLOCKED` badges and excess amount indicator.
- Searchable product catalog with real-time stock indicators.
- Append-only audit timeline with JSON payload inspector modal.
- Razorpay test checkout modal with test payment simulator.

---

### Phase 9 — Security Regression Testing
**Goal:** Prove rejected checkouts never create payments.
**What was implemented:**
- Created `backend/tests/test_security_regression.py` using `unittest.mock.patch`.
- Validates that when a ₹1,799 purchase is attempted under a ₹1,500 limit:
  1. Mandate engine returns `MANDATE_EXCEEDED`.
  2. `PaymentService.create_order` is NOT called.
  3. No approved order exists.
  4. Audit rejection event is created.
- Total test suite: 25 passing tests.
