# Demo Script

## Opening — 30 seconds
> AI agents can increasingly find products, but allowing them to spend money introduces a trust problem. How do we know what they were allowed to buy, why a transaction happened, and what occurs when the agent exceeds its authority?

> We built Agent-Transactable Merchant to demonstrate a merchant backend where AI agents can transact, but only within deterministic human-defined boundaries.

## Part 1 — Show the Mandate
Display:

```text
Maximum spend: ₹1500
Allowed category: Footwear
Maximum items: 1
Status: Active
```

Explain:

> This is enforced by backend code, not by the LLM prompt.

## Part 2 — Successful Flow
Request:

> Find me running shoes under ₹1500.

Show:
1. catalog search,
2. selected product,
3. cart,
4. mandate approval,
5. Razorpay test order/payment,
6. audit timeline.

## Part 3 — Failure Flow
Request:

> Buy the premium running shoes.

Show:
1. ₹1799 product selected,
2. checkout attempted,
3. Mandate Engine rejection,
4. `MANDATE_EXCEEDED`,
5. exact amount difference,
6. audit event,
7. cheaper alternative.

Say:

> The important part is that the agent did not simply decide to be responsible. The backend physically blocked the transaction before payment creation.

## Closing
> Our project separates AI intelligence from transaction authority. The agent can decide what to propose, but a deterministic mandate layer decides what can actually happen, and every decision remains auditable and explainable.
