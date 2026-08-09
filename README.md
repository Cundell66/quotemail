# QuoteMail (CruiseMailer)

A Next.js app that turns cruise quote details into ready-to-send emails. Fill in the form (customer, party, sailings, cabin options, pricing), preview the generated email, edit it if needed, then send — or copy it out.

## Branches

Two long-lived branches, one for each version of the quote email:

- **`quotemail`** (default) — the current version. Includes the conversion-focused email rebuild (Hormozi/Brunson structure: hook, dream, offer, urgency, CTA, P.S.) and a dynamic subject line generated per quote.
- **`legacy-quote-email`** — frozen snapshot of the old email template, pinned at commit `c92cf58`. Used by deployments that should keep the original quote email format (e.g. Cruise Aboard / Connor's setup).

Rules of thumb:

- New work lands on `quotemail` only.
- `legacy-quote-email` is intentionally frozen — it will *not* receive fixes or features from `quotemail`. If the legacy version ever needs the new email, switch the deployment to `quotemail` rather than merging branches.
- Deployments that should keep the old email format should point at `legacy-quote-email`.

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000. Env vars needed for sending: `GETTHATCRUISE_*` (Get That Cruise account) and/or `CRUISEABOARD_*` (Cruise Aboard account) — see `example-env`.

## Notes

- Email template logic lives in `src/lib/email-template.ts` (pure function — easy to test/tweak the copy in one place).
- The app supports two sending accounts: `get-that-cruise` and `cruise-aboard`, each with its own SMTP config and signature.
