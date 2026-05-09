Part B — Feature Specifications (6 features)

This document maps each Part A pain point to a buildable feature spec: Problem Statement, Proposed Solution, Technical Implementation Plan, Success Metrics, and Edge Cases & Constraints. Each spec references the Part A problem and the exact failing step.

---

Feature 1 — Tatkal Virtual Queue

Problem Statement
From Part A — "Tatkal Booking Crashes at 10:00 AM": massive concurrent requests at quota open cause overload, no server-side queue or visible progress.

Proposed Solution
Server-managed virtual queue with visible position/ETA; when head-of-queue reaches a user, issue a short-lived booking_token (90s) to complete booking. Show progress and tips; allow cancel.

Technical Implementation Plan
- Components: Frontend, API Gateway, Queue Service (Redis sorted set + worker), Booking Orchestrator, Session store (Redis), Postgres for durable records, Websocket/Push service.
- Data: `queue_entry` {queue_id, user_id, train_id, class, pax, payload_hash, status, enqueued_at, expires_at} in Postgres; ordering in Redis ZSET by enqueued_at.
- APIs:
  - POST /tatkal/queue/enqueue -> {queue_id, position, est_wait_s, heartbeat_interval_s}
  - GET /tatkal/queue/status?queue_id= -> {position, est_wait, status}
  - POST /tatkal/queue/claim -> returns booking_token TTL
  - POST /tatkal/booking/confirm -> accepts booking_token
- Frontend: `TatkalQueue` component. Prefer websocket for live updates; fallback to 5s polling.
- Ordering: Redis ZSET pop + Lua script to atomically claim head and write booking_token.
- Failure handling: idempotent booking_token and clear release policy on expiry.

Success Metrics
- Tatkal booking success rate in 10:00 window (target +40–50 pp).
- 5xx error reduction during window >=60%.

Edge Cases & Constraints
- Users with multiple tabs: dedupe by session. External allocation failures still possible; return clear error and retry options.

---

Feature 2 — Persistent & Server-Authoritative Search Filters

Problem Statement
Filters reset or apply to stale cached results; filter state lost on reload.

Proposed Solution
Make filters part of server query and persist into URL + session. Server returns canonical filtered list and a `result_version` token to detect staleness.

Technical Implementation Plan
- Components: Search API, CDN/edge cache, frontend router.
- API: GET /search?from=&to=&date=&class=&filters= -> returns trains + result_version.
- Frontend: Serialize filters to URL; read URL on mount and rehydrate UI. If `result_version` mismatch, auto-refresh.
- Caching: short TTL 5–15s; use surrogate keys per route+date.

Success Metrics
- Filter-accuracy >99%; reduction in manual scanning time by 20%.

Edge Cases
- Rapid availability changes: inform user "results updated" and preserve active filters.

---

Feature 3 — Reliable Seat Selection with Server-side Hold

Problem Statement
Selected seats lost during transitions; client/server race conditions.

Proposed Solution
Create short-term server-side seat holds with TTL. Return `hold_id` to frontend and require it during booking confirm.

Technical Implementation Plan
- Components: Seat-hold service (Redis), Booking API.
- Data: `seat_hold` {hold_id, seat_id, train_id, user_id, expires_at}.
- APIs:
  - POST /seats/hold -> {hold_id, expires_at}
  - POST /seats/release
  - POST /seats/confirm -> consumes hold
- Frontend: send hold_id through flow; seat-map reflects holds.

Success Metrics
- Seat-preservation rate >98%.

Edge Cases
- Holds cannot scale indefinitely; use short TTLs and fallback auto-assign.

---

Feature 4 — Idempotent Payment Status Listener & UX

Problem Statement
UPI/payment spinner indefinite; users retry causing duplicates.

Proposed Solution
Server-side transaction table + webhook-based confirmation and client subscription to canonical txn status. Show explicit Pending/Success/Failed states and prevent duplicate initiations via idempotency keys.

Technical Implementation Plan
- Components: Payment Orchestrator, transactions table, gateway webhooks, frontend PaymentStatus overlay.
- Data: `transaction` {txn_id, user_id, amount, gateway_txn_id, status, idempotency_key}.
- APIs:
  - POST /payments/initiate -> txn_id
  - POST /payments/webhook/{gateway} -> updates status
  - GET /payments/status?txn_id=
- Frontend: bind overlay to txn_id; disable destructive navigation until resolved or explicit cancel.

Success Metrics
- Duplicate payment attempts down >=70%; clearer finality for users.

Edge Cases
- Gateway webhook failures: implement signature verification, retries, manual reconciliation.

---

Feature 5 — Resumable Mobile Booking & Lightweight Payment UI

Problem Statement
Mobile app/web freezes on payment screen, losing booking state.

Proposed Solution
Persist draft bookings locally and server-side; lazy-load heavy SDKs; offer resume prompt on app restart. Use in-app deep-links for UPI rather than embedded heavy SDKs when possible.

Technical Implementation Plan
- Components: Local storage (IndexedDB / native secure storage), snapshot API, lightweight payment redirect.
- APIs:
  - POST /bookings/snapshot -> snapshot_id
  - GET /bookings/snapshot/{id}
- Frontend: auto-save after passenger details and prior to payment; on app start, check snapshot and offer resume.

Success Metrics
- Recovery rate >90%; reduced lost-booking incidents by >=85%.

Edge Cases
- Local storage encryption and TTL; sensitive data handling and PCI scope.

---

Feature 6 — OTP Resilience & Multi-channel Verification

Problem Statement
OTP delays/failures at peak cause booking timeouts.

Proposed Solution
OTP orchestration using multi-SMS providers, voice OTP fallback, and push OTP for logged-in app users. Dynamically extend TTL during peak windows and surface alternative channels immediately.

Technical Implementation Plan
- Components: OTP Orchestrator, SMS provider adapter, voice provider, push-notification service.
- APIs:
  - POST /otp/send -> {otp_id, channel}
  - POST /otp/verify
- Frontend: show all active channels, ETA, and "Try voice" or "Send push" actions.

Success Metrics
- OTP delivery <15s for 95% of attempts off-peak; substantial reduction of OTP timeouts in peak.

Edge Cases & Constraints
- Telecom routing unpredictable; maintain provider health metrics and failover.

---

Traceability
Each feature maps to the corresponding Part A problem and step number (see PartA_Documentation.md). Use `Problem 1`..`Problem 6` naming in tickets for direct traceability.
