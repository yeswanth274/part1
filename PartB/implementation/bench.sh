#!/bin/sh
set -e
echo "Starting benchmark: uncached"
curl -s -o /dev/null http://localhost:3000/api/health
npx autocannon -c 50 -d 10 http://localhost:3000/api/products
echo "Flushing Redis and running cached benchmark"
docker exec $(docker ps -qf "ancestor=redis:7") redis-cli FLUSHALL || true
sleep 1
npx autocannon -c 50 -d 10 http://localhost:3000/api/products
