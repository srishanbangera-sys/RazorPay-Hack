# Acceptance Criteria

## Catalog
- [ ] Products are available through a structured API.
- [ ] Product price, stock, and category come from backend data.

## Mandate
- [ ] Mandate contains amount, category, item count, expiry, and merchant constraints.
- [ ] Backend evaluates mandate deterministically.
- [ ] Rejected actions return structured reason codes.
- [ ] Client and LLM cannot bypass checks.

## Agent
- [ ] Agent can search products.
- [ ] Agent can propose a cart.
- [ ] Agent can request checkout through a tool.
- [ ] Agent accurately reports backend decisions.
- [ ] Agent offers an alternative after the primary rejection.

## Payment
- [ ] Approved checkout can create a Razorpay test-mode order.
- [ ] Payment state is recorded.
- [ ] Rejected checkout does not create payment.

## Audit
- [ ] Every major action creates an event.
- [ ] Events share a trace ID.
- [ ] Rejected decisions contain reason codes.
- [ ] Timeline is visible in UI.

## Demo
- [ ] Successful purchase flow works.
- [ ] Mandate-exceeded failure works repeatedly.
- [ ] Failure is graceful.
- [ ] Explanation is visible.
- [ ] Project can be demonstrated from a clean setup.
