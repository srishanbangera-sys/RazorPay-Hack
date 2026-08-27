# Audit Trail Specification

## Purpose
The audit trail must allow a judge to answer:

> What happened, who initiated it, why was it allowed or rejected, and what happened next?

## Required Properties

### Append-Oriented
Events are written as new records.

Do not overwrite historical decisions.

### Correlated
Every flow should share a `trace_id`.

### Structured
Store both:
- human-readable reason,
- machine-readable reason code.

### Observable
The frontend should display events as a timeline.

## Example Timeline

```text
10:01:02  BUYER
Request: "Buy premium running shoes"

10:01:03  AGENT
Catalog search executed

10:01:04  AGENT
Cart proposed: Premium Runner

10:01:05  BACKEND
Mandate evaluation started

10:01:05  MANDATE ENGINE
REJECTED
Reason: MANDATE_EXCEEDED
₹1799 requested / ₹1500 allowed

10:01:06  AGENT
Alternative requested

10:01:07  AGENT
Alternative proposed: Sprint Runner ₹1299
```

## Sensitive Data
Do not store secrets, API keys, card details, or unnecessary payment payloads in the audit log.

Sanitize external payloads before storage.
