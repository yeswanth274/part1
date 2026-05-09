Part B — Peer Review Notes & Updates

Presenting to PM & Engineering (top-2 specs)
Chosen for review: (1) Tatkal Virtual Queue, (2) Payment Status Listener.

Presentation Outline (5 minutes each)
- Problem recap (Part A evidence), user impact, frequency.
- Proposed UX and wireframe.
- Technical plan (APIs, data, infra), estimated size (person-weeks).
- Success metrics and rollout strategy (A/B test + canary).

Expected PM Questions & prepared answers
- Q: What if the queue delays overall throughput and increases wait times?
  A: The queue smooths spikes and prevents overload; estimate average wait ~N minutes based on concurrency. Use dynamic rate-limits and surge capacity to tune.
- Q: How do you prevent gaming (bots opening many sessions)?
  A: Use per-user dedupe, CAPTCHA at enqueue if suspicious, and rate-limits per account/IP.
- Q: How to measure if queue improved completion vs no queue?
  A: A/B test on non-critical routes / lower-volume tatkal windows measuring completion rate, 5xx errors, and user satisfaction.

Engineering Questions & prepared answers
- Q: Redis vs durable queue choice?
  A: Use Redis ZSET for ordering + Postgres for durable audit log; use worker farms to pop claims and populate booking tokens.
- Q: Payment webhook security and reconciliation?
  A: Verify gateway signatures, persist events with idempotency keys, implement reconciliation jobs for orphaned txns.

Peer Review Action Items (after session)
- 1) Add metrics instrumentation plan (events and dashboards). (Added)
- 2) Produce sequence diagrams for queue claim -> booking confirm. (Todo)
- 3) Validate SMS vendor SLAs and estimate cost for multi-provider OTP. (Todo)
- 4) Prepare migration plan for existing users and rollout gating. (Todo)

Notes about updates after peer review
- I will update the feature specs and wireframes with sequence diagrams and cost estimates after vendor research.
