Part B — AI Feature Proposal

Chosen Direction
Waitlist Confirmation Probability Predictor (Direction 1)

1) Problem it solves
Addresses the pain of users on waitlist (WL) not knowing chance of confirmation and making suboptimal booking decisions (e.g., waiting vs booking alternate travel). Ties to Part A problems where users lose time and make repeat attempts.

2) Model / API Choice
- Model: LightGBM (gradient-boosted decision trees) served via an inference endpoint (e.g., Vertex AI or a lightweight FastAPI + model server) for fast, low-cost predictions. Use LightGBM because tabular historical features are dominant and model is fast and resource-light.

3) Training / Input Data
- Inputs: historical booking records (route, train_no, quota, booking_date, days_before_departure, current_position_in_WL, coach_class, cancellation_rate, historical confirmation rate for train+class, seasonality flags, dynamic load features), real-time seat availability, recent cancellation velocity for the PNR window.
- Labels: binary confirmed vs not within X hours after booking (confirmation within 24–72 hours depending on target).
- Data sources: IRCTC booking logs, cancellations feed, train run/capacity metadata, public schedule data.

4) How output is shown to user
- UI: in Search/PNR/Booking flow show "Estimated WL confirmation: 12% (low)" with an explanation tooltip. Also show alternatives: Nearby trains with higher probability, or buy auto-upgrade options.
- Integrations: in the waitlist details page and during booking confirmation overlays.

5) Fallback when AI fails or is uncertain
- If confidence < threshold or model is unavailable, show conservative textual fallback: "No reliable prediction available — consider alternate trains." Keep default UX unchanged and offer manual alternatives. Log errors and route to monitoring.

Privacy & Practical Notes
- Model runs on anonymized/aggregated historical records; no need to surface PII. Batch retrain daily; online features (cancellation velocity) computed in real-time stream.

Evaluation
- Metrics: ROC-AUC, calibration (Brier score), and business metric: percent of users taking recommended action who achieve confirmed seat vs control group.

Deployment Plan (high level)
- Train offline on historical data; validate on holdout and calibration splits. Deploy as REST endpoint with rate-limited access. Cache predictions per route+date for short TTL (30–60s) to reduce load.
