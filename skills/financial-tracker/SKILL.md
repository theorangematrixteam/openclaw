---
name: financial-tracker
description: Track invoices, payments, revenue, and cash flow for Orange Matrix. Use when checking financial status, unpaid invoices, revenue, or monthly income. Triggers on "revenue", "invoices", "payments", "financial status", "money", "cash flow".
---

# Financial Tracker Skill

Track Orange Matrix finances — invoices, payments, and revenue health.

## How It Works

1. Read `batches` tab from Core sheet (has invoice/payment columns)
2. Calculate totals and flag unpaid items
3. Present a quick financial snapshot

## Output Format

```
💰 **Financial Snapshot**
- This month: ₹{X} invoiced · ₹{Y} received · ₹{Z} pending
- Overdue: {N} invoices totaling ₹{A}
- Clients: Notch ✅ | Proofit ⏳ | {Client3} ✅
```

## Rules

- **One snapshot** — keep it brief
- **Flag unpaid > 7 days** as overdue
- **Use ₹** for currency
- **No tables** — bullet list only
- Sheet IDs in TOOLS.md