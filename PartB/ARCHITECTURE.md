**Current Architecture**

Internet
    │
    ▼
┌─────────────────────────────────────────┐
│  Single Node.js Express Server          │
│  - Routes + Business Logic + DB Queries │
│  - No caching layer                     │
│  - No connection pooling config         │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Single PostgreSQL Instance             │
│  - No indexes on foreign keys           │
│  - Denormalized order_items             │
└─────────────────────────────────────────┘

**Annotated Weaknesses**

1. Single point of failure
2. No caching layer
3. No read/write separation
4. Static assets served from app

**Scaled Architecture (1 Lakh concurrent users)**

Internet Users
    │
    ▼
CDN (CloudFront / Nginx)
    │
Load Balancer (Nginx)
    │
Node.js app instances (3..N) stateless
    │
Redis Cluster
    │
PostgreSQL Primary -> Read Replicas

**Decisions mapped to Part A findings**

- Redis cache reduces DB load for product reads shown in Part A
- Read replicas isolate heavy reads from transactional writes
- Load balancer and multiple app instances remove single-server SPoF

**Architecture Diagram (Mermaid)**

```mermaid
flowchart TB
  Internet --> CDN
  CDN --> LB[Load Balancer (Nginx)]
  LB --> App1[Node App 1]
  LB --> App2[Node App 2]
  LB --> App3[Node App 3]
  App1 --> Redis[Redis Cluster]
  App2 --> Redis
  App3 --> Redis
  Redis --> PostgresPrimary[PostgreSQL Primary]
  PostgresPrimary --> Replica1[Read Replica 1]
  PostgresPrimary --> Replica2[Read Replica 2]
```
