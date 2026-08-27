# Pitch

## One-Line Pitch
A merchant backend that allows AI shopping agents to transact safely within human-defined spending boundaries, with deterministic enforcement and a complete audit trail.

## Problem
AI agents can discover and recommend products, but autonomous commerce requires trust.

Who controls the spending authority?

What prevents an agent from exceeding limits?

How can a merchant explain why a transaction happened?

## Solution
Agent-Transactable Merchant introduces a deterministic Mandate Engine between the AI agent and payment infrastructure.

```text
AI proposes
Backend verifies
Mandate decides
Payment executes only if approved
Everything is logged
```

## Differentiator
The LLM is not trusted as the enforcement mechanism.

Even if the agent requests an invalid purchase, the backend independently:
- recalculates totals,
- checks categories,
- checks item limits,
- checks expiry,
- checks merchant identity,
- blocks the transaction if required.

## Evidence
The audit timeline provides a complete sequence of:
- request,
- search,
- proposed cart,
- mandate decision,
- payment event,
- failure reason,
- alternative recommendation.

## Demo Moment
A ₹1799 purchase is attempted under a ₹1500 mandate.

The backend blocks it with:

`MANDATE_EXCEEDED`

No payment order is created.

The agent explains the failure and proposes an allowed alternative.
