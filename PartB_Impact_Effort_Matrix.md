Part B — 2×2 Impact vs Effort Matrix

Quadrants (summary)
- Quick Wins (High Impact, Low Effort)
  - Persistent Search Filters
  - OTP Resilience (initial multi-provider routing + TTL)

- Major Projects (High Impact, High Effort)
  - Tatkal Virtual Queue
  - Resumable Mobile Booking + lightweight payment UI

- Fill-ins (Low Impact, Low Effort)
  - Seat selection UI improvements (partial)

- Time Sinks (Low Impact, High Effort)
  - Full custom payment SDK rewrite (avoid in short term)

Placement Justifications (3 sentences each)

Tatkal Virtual Queue — Major Project
Tatkal is the single largest source of catastrophic failure at quota-open; a server-side queue directly addresses load spikes and user-visible failure. Implementation touches multiple components (queue, booking orchestration, websocket infra), so effort is high but impact is also very high. Therefore it belongs in Major Projects.

Persistent Search Filters — Quick Win
Making filters server-authoritative and persisting them to URL fixes a common UX bug with small backend and frontend changes. The work touches search API and frontend routing only, low infra risk and easy to ship. High frequency of occurrence and direct user time-savings make it high impact for low effort.

Reliable Seat Selection with Hold — Fill-in / Quick Win
Server-side holds preserve user intent and reduce complaints; implementation requires seat-hold logic but is moderately scoped. Impact is focused (families/elderly) and effort is moderate — place as fill-in or quick win depending on team bandwidth.

Payment Status Listener — Major Project
Payment idempotency and webhook orchestration solve a major source of duplicates and refunds; it touches payment gateway integrations and transaction reconciliation. Complexity is high due to external systems and security, but impact on refunds and user trust is large.

Resumable Mobile Booking & Lightweight Payment UI — Major Project
Recovering from mobile crashes addresses a broad class of lost bookings; this requires client+server snapshotting, storage encryption, and SDK strategy changes. High effort, high impact especially for mobile-heavy user base.

OTP Resilience — Quick Win
Routing via multiple SMS providers and adding voice/push fallbacks materially reduces peak-time failures with modest engineering effort to integrate providers and add OTP orchestration. Because it directly enables successful bookings during peaks, impact is high relative to effort.

How to use this matrix
- Execute Quick Wins immediately. Schedule Major Projects across sprints with cross-functional ownership. Treat Fill-ins opportunistically.
