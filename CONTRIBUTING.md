# Contributing

## Development Rules
1. Do not move mandate enforcement into prompts or frontend code.
2. Add tests when changing mandate logic.
3. Add audit events for important new actions.
4. Do not commit secrets.
5. Keep API errors structured.
6. Keep the MVP simple.

## Before Merging
- [ ] Tests pass.
- [ ] No secrets are committed.
- [ ] Mandate behavior remains deterministic.
- [ ] Audit trail remains complete.
- [ ] README/docs updated if behavior changed.
