# UI / UX Specification

## Main Goal
The UI should make the system's safety and explainability obvious within a few seconds.

Do not build a generic e-commerce clone.

## Main Screen Layout

### Left / Main Area: Agent Conversation
Shows:
- buyer request,
- agent response,
- products found,
- proposed cart,
- mandate result.

### Cart / Decision Card
Display:
- selected items,
- server-calculated total,
- mandate maximum,
- decision.

Example:

```text
Cart Total: ₹1,799
Mandate Limit: ₹1,500

❌ BLOCKED
MANDATE_EXCEEDED
Over limit by ₹299
```

### Right / Lower Area: Audit Timeline
Display chronological events with:
- timestamp,
- actor,
- action,
- status,
- reason.

## Required Visual States

### Approved
Clearly show:
- mandate passed,
- order created,
- payment state.

### Rejected
Clearly show:
- action blocked,
- exact reason code,
- human explanation,
- no payment initiated.

### Alternative
After rejection, show an allowed alternative product.

## Suggested Screens
1. Main demo dashboard.
2. Product search/results.
3. Cart decision view.
4. Audit detail view.

## UX Principle
A judge should not need to read source code to understand that the mandate blocked the action.
