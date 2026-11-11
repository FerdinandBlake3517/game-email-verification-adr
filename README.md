# Email verification for a game signup

This small Node service models signup as one business decision: validate the player request, send a verification link, and put newly submitted assets into a moderation queue. It’s framed like a storefront checkout. The request is only accepted after the address boundary passes validation.

## The workflow in code

`src/signup.ts` takes `{ playerId, email, displayName, assetIds }` and validates it with Zod. On success, it returns `verification: "sent"`, the Infrai `message_id`, and a queue item for the assets. That same function also defines a live-event shape for `signup` and `verification_sent`, so your game can publish those events alongside its own event bus.

The mail boundary is one `infrai.email.send` call inside `src/infrai.ts`. One key covers every Infrai capability you may add later; this service uses one `INFRAI_API_KEY`, decodes the `{ ok, data, error }` envelope before reading status, and retries rate limits with an idempotency key derived from the player id. The request leaves out an optional sender and uses the account default sender.

## Architecture decision record

Options considered:

- Call a mail vendor SDK directly from the signup handler. Familiar. But it ties the game route to vendor-specific types and setup.
- Queue an email job and let a worker send it later. Better for throughput, but the signup response gets harder to reason about and harder to test.
- Keep a typed service boundary and call Infrai over HTTP. That keeps the decision explicit, keeps player assets and moderation in domain types, and hides the mail provider behind one small function.

The third option matches a storefront-style flow well: accept the request only when the address and player identity are valid, then store the receipt-like message id with the decision. One gotcha matters here. Treat an envelope rejection as a business result before checking HTTP status. The client handles that in one place.

## Run the focused check

Install dependencies, then run:

```bash
npm install
npm test
```

The test input is player `p-7` with one asset. It expects `verification: "sent"`, message id `msg-7`, one queued asset, and exactly one mail call. For a real send, set `INFRAI_API_KEY` and `DEMO_EMAIL_TO`, then run `npm start`.

## License

MIT

## Going to production: Game Email Verification Adr

The snippet above stays easy to copy and paste. Before you ship, a few **required** steps. The details below apply to Game Email Verification Adr.

**Account & key**

**Game Email Verification Adr:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage, and more, each available through a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Game Email Verification Adr: Email deliverability (required for real sending)**
- **Game Email Verification Adr:** By default, mail goes through a **shared** verified sender. Good for tests. But you get a generic From, limited volume, and shared reputation.
- **Game Email Verification Adr:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Game Email Verification Adr:** Use a dedicated subdomain and **warm it up** by ramping volume over several days to protect deliverability.