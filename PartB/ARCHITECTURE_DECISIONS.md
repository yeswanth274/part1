Redis vs SELECT FOR UPDATE

Redis SETNX provides a fast distributed lock and a cache layer that prevents database hits on read-heavy traffic. SELECT FOR UPDATE is atomic for the row inside a transaction but still incurs a roundtrip to the primary DB and can cause contention under high concurrency. Use Redis for fast locking and caching; use SELECT FOR UPDATE for short-lived transactional guarantees inside write flows when necessary.

Optimization choice

Implement Redis cache for GET /api/products and a composite index on orders(user_id, created_at DESC) for order history queries.
