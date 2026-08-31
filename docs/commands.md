# Dosie — Common Commands

Run from the project root unless noted otherwise.

## Server (start the app)
```
npm run dev          # start Docker + backend, one command
npm run dev:backend  # backend only (if Docker already running)
Ctrl+C               # stop backend
```
Test: `curl localhost:3000/health` or open http://localhost:3000/health

## Docker (Postgres + Redis)
```
npm run db:up        # start containers (background)
npm run db:down      # stop them
docker compose ps    # running containers + health status
docker compose logs -f postgres   # live Postgres logs
docker compose down -v            # stop AND delete data (volumes) — you lose the DB
```

Note: Dosie's Postgres is on host port **5433** (not 5432) because a local
Homebrew Postgres already uses 5432. Redis is on 6379.

## Prisma (run from `backend/`)
```
cd backend

npx prisma migrate dev --name <name>   # after editing schema.prisma: create + apply migration (also regenerates client)
npx prisma generate                    # regenerate the typed client
npx prisma studio                      # browser UI to view/edit data — very useful
npx prisma validate                    # check schema.prisma is valid
npx prisma migrate status              # which migrations applied / pending
npx prisma migrate reset               # DELETE everything and reapply from scratch — you lose data
```

## Typical daily flow
```
npm run dev                       # 1. start everything
# work on code...
cd backend && npx prisma studio   # 2. (optional) view data in browser
Ctrl+C                            # 3. stop backend
npm run db:down                   # 4. stop Docker
```

## When you change the schema (schema.prisma)
```
cd backend
npx prisma migrate dev --name describe_change   # applies + regenerates client automatically
```
