# Security Considerations

## Trust Boundaries

### Untrusted
- buyer text,
- frontend payloads,
- LLM outputs.

### Trusted After Validation
- server-side database data,
- Mandate Engine result,
- verified Razorpay data.

## Rules
- Never commit API keys.
- Use environment variables.
- Never trust client totals.
- Never trust LLM authority decisions.
- Verify payment data according to the selected Razorpay integration.
- Verify webhook signatures if webhooks are used.
- Make webhook handling idempotent.
- Sanitize audit payloads.
- Do not store payment card information.

## Secret Files

`.env` must be ignored by Git.

Provide:

```text
.env.example
```

without actual secrets.
