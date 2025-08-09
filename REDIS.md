# Redis integration overview

## What was added

- node-redis client with lazy singleton: src/lib/redis.ts
- Key helpers: src/lib/redis-keys.ts
- Read-through cache + invalidation: src/lib/redis-cache.ts
- Advisory locks (SET NX PX): src/lib/redis-lock.ts
- Rate limiting (INCR + EXPIRE): src/lib/redis-rate-limit.ts
- Idempotency (cache result by payload hash): src/lib/redis-idempotency.ts
- Hash utility for payloads: src/lib/hash.ts

## Environment

- REDIS_URL (defaults to redis://localhost:6379 for dev)

## Key naming

- app:zainy:{env}:{domain}:...
  - Sessions
    - session:admin:{adminId} (TTL 30d)
    - session:mod:{modId} (TTL 30d)
  - Caches
    - cache:total-bottles:latest (TTL 60s)
    - cache:mods:list (TTL 300s)
    - cache:delivery:daily:{modId}:{yyyy-mm-dd} (TTL 120s)
    - cache:expenses:daily:{modId}:{yyyy-mm-dd} (TTL 120s)
    - cache:misc:daily:{modId}:{yyyy-mm-dd} (TTL 120s)
    - cache:bottle-usage:today:{modId}:{yyyy-mm-dd} (TTL 60s)
  - Locks
    - lock:total-bottles (10s)
    - lock:bottle-usage:{modId}:{yyyy-mm-dd} (10s)
  - Rate limit
  - rl:{scope}:{id} (window varies)
  - Idempotency
  - idem:{action}:{sha1(payload)} (TTL 600s)

## Where it is used

- Sessions
  - Admin/mod login set session keys; middleware/status check Redis first; logout deletes session key.
- Read caches
  - fetchTotalBottles, getAllModeratorList, getDailyDeliveryRecords,
    getOtherExpensesByModeratorId, fetchMiscDeliveryByModId,
    fetchModeratorBottleUsage
- Invalidation
  - Moderator CRUD/status → cache:mods:list
  - Bottle/usage/delivery/misc/expense mutations → total-bottles latest, per-mod daily caches
- Locks
  - modAddUpdateBottleUsage, addDailyDeliveryRecord, returnBottleUsage, addMiscDelivery (for BottleUsage/TotalBottles integrity)
- Rate limit
  - loginAdmin/loginModerator (5/min by username)
- Idempotency
  - modAddUpdateBottleUsage, addDailyDeliveryRecord, returnBottleUsage, addMiscDelivery, createOtherExpense (600s)

## Notes

- No DB logic changed; Redis optimizes reads and protects concurrent writes.
- Advisory locks are best-effort; consider DB transactions for stronger guarantees.
- If deploying serverless, ensure Redis is accessible and connection limits are respected.

## Local development

- Use Docker Redis (REDIS_URL=redis://localhost:6379). The client connects lazily on first use.
