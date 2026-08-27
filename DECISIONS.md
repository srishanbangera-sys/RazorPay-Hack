# Architecture Decision Record

## ADR-001 — Use a Deterministic Mandate Engine
**Decision:** Authority rules are evaluated in backend code.

**Reason:** LLM behavior is probabilistic and should not control transaction authority.

---

## ADR-002 — Keep the Agent Thin
**Decision:** The agent orchestrates backend tools.

**Reason:** This keeps business logic testable and reduces AI-specific complexity.

---

## ADR-003 — Use Structured Rejection Codes
**Decision:** Failures return stable machine-readable codes.

**Reason:** The UI, agent, tests, and audit system can consistently interpret decisions.

---

## ADR-004 — Append-Oriented Audit Trail
**Decision:** Important actions are represented as immutable-style events.

**Reason:** Historical decisions should remain inspectable.

---

## ADR-005 — Razorpay Test Mode
**Decision:** Use test mode for the MVP.

**Reason:** Demonstrates payment integration without real money.

---

## ADR-006 — SQLite for MVP
**Decision:** Start with SQLite but avoid database-specific design where possible.

**Reason:** Fast local setup while preserving an upgrade path to PostgreSQL.
