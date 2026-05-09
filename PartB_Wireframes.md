Part B — Wireframes (mid-fidelity, annotated)

Notes
These are mid-fidelity wireframes in text form to be converted to Figma if needed. Each wireframe lists components, labels, interactions, and the exact step that changes vs Part A.

Wireframe 1 — Tatkal Queue Screen (Mobile 375px)
- Header: [IRCTC logo] [Profile]
- Countdown box: "TATKAL BOOKING OPENS IN" + live HH:MM:SS
- Queue card:
  - Line1: "YOUR QUEUE POSITION"
  - Big number: #4,281
  - Est. wait: ~9 minutes
  - Progress bar + percent
  - Buttons: [Cancel] (if before claim)
- Booking preview: Train/Coach/Class/Passengers (read-only)
- Footer: Tips + "Prepare to complete booking in 90s"

Annotations
- When enqueue succeeds, show position; websocket updates position every 1–5s. When position==1, show modal "It's your turn — 90 seconds" with `Start Booking` button.

Wireframe 2 — Search Results with Persistent Filters (Mobile/Desktop)
- Left/top: Filters panel (class, departure window, quota, availability)
- Main: train list with availability badges and `result_version` indicator (small icon if stale)
- URL: includes query params for filters

Annotations
- Apply filters server-side; show "results updated" snackbar when server returns newer `result_version`.

Wireframe 3 — Seat Map with Hold Indicator
- Seat map grid; held seats display striped pattern with "Held by you - 02:45" or "Held by another user"
- Selected seat shows checkmark + `hold_id` in debug mode

Annotations
- `Hold` call on selection returns TTL; UI shows countdown per seat.

Wireframe 4 — Payment Status Overlay
- Overlay after initiating payment:
  - Title: "Awaiting payment confirmation"
  - Spinner + txn_id
  - Status line: "Payment via UPI — awaiting gateway"
  - Buttons: [Cancel Payment] [Open Bank App]
  - Fallback options: "Didn't receive? Try voice OTP / push"

Annotations
- Overlay subscribes to txn status; on success show confirmed page; on failure offer retry.

Wireframe 5 — Resume Booking Prompt (after crash)
- Modal on app start: "Resume your unfinished booking for Train XXXX?"
  - Buttons: [Resume booking] [Discard]

Wireframe 6 — OTP Modal with Multi-channel Actions
- Modal shows: OTP entry input, countdown, channels: [Send SMS] [Voice] [Push if app installed]

Annotations
- Allow user to switch channel without leaving modal; show ETA per provider when available.

Conversion to Figma
- These wireframes should be recreated in Figma frames (mobile 375x812, desktop 1280x800) with grey boxes and annotated notes. Use the existing screenshots folder as reference for before/after comparisons.
