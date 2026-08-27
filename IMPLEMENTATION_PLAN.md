# Implementation Plan

## Phase 1 — Foundation
- [ ] Initialize repository.
- [ ] Create backend structure.
- [ ] Configure environment variables.
- [ ] Configure database.
- [ ] Create seed script.

## Phase 2 — Catalog
- [ ] Create Product model.
- [ ] Seed 8–10 products.
- [ ] Implement product search API.
- [ ] Add tests.

## Phase 3 — Mandate Engine
- [ ] Create Mandate model.
- [ ] Implement pure evaluation function.
- [ ] Add structured decision object.
- [ ] Add unit tests for every rejection code.

## Phase 4 — Checkout
- [ ] Create order models.
- [ ] Calculate totals server-side.
- [ ] Validate stock.
- [ ] Re-check mandate immediately before payment.

## Phase 5 — Audit
- [ ] Create audit event model.
- [ ] Add trace IDs.
- [ ] Log catalog, mandate, order, and payment events.
- [ ] Build timeline API.

## Phase 6 — Razorpay
- [ ] Configure test keys.
- [ ] Create Razorpay order.
- [ ] Handle verification.
- [ ] Handle webhook if included.
- [ ] Add payment audit events.

## Phase 7 — Frontend
- [ ] Chat interface.
- [ ] Product cards.
- [ ] Cart decision card.
- [ ] Audit timeline.
- [ ] Success and rejection states.

## Phase 8 — Agent
- [ ] Add LLM provider.
- [ ] Define tools.
- [ ] Connect tools to backend.
- [ ] Implement alternative search.

## Phase 9 — Demo Hardening
- [ ] Rehearse success flow.
- [ ] Rehearse blocked flow.
- [ ] Verify no Razorpay order on rejection.
- [ ] Record screenshots/video.
