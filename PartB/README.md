Part B deliverables

1. ARCHITECTURE.md
2. schema.sql
3. API_CONTRACTS.md
4. implementation/ (Dockerized API + seed + bench)

To run the implementation:

docker compose -f PartB/implementation/docker-compose.yml up --build

Then seed the DB:

docker exec -i $(docker ps -qf "name=partb_ db") psql -U postgres -d postgres -f /usr/src/app/seed.sql || psql -U postgres -d postgres -f seed.sql

Run benchmark after service is healthy:

sh PartB/implementation/bench.sh
