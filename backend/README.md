# Task Management Backend

Practical NestJS source base for a large task management backend using a modular monolith approach.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma
- Redis + BullMQ
- JWT + Swagger
- Structured logging with request correlation
- Docker Compose for local runtime

## Quick start

1. Copy env file:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
pnpm install
```

3. Generate Prisma client:

```bash
pnpm prisma:generate
```

4. Run local infra with Docker:

```bash
docker compose up -d postgres redis
```

5. Apply migrations after creating the first migration:

```bash
pnpm prisma:migrate:dev
```

6. Start backend:

```bash
pnpm start:dev
```

Or run the full local dev stack in Docker with hot reload:

```bash
docker compose up
```

The `api` service runs `pnpm start:dev`, backed by Node watch mode with `ts-node/register`, so source changes under `src/` reload automatically without depending on `dist`. Use `docker compose restart api` only when you change environment variables or need to restart the process manually.

## Docker modes

Development mode with hot reload:

```bash
docker compose up
```

Production-like mode using the built `dist` output:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Use the production-like mode when you want to verify the containerized build path or behavior closer to deployment. Normal local feature work should stay on the default `docker-compose.yml`.

## Database commands

```bash
pnpm db:setup
```

Generate Prisma client, create/update schema directly from `schema.prisma`, then seed a default admin user.

```bash
pnpm prisma:migrate:create --name init
pnpm prisma:migrate:dev
pnpm prisma:migrate:deploy
pnpm prisma:db:seed
pnpm prisma:db:reset
pnpm prisma:studio
```

These Prisma commands run inside the Docker `api` service, so `.env` can keep Docker hostnames like `postgres` and `redis`.

## Docker rebuild

```bash
docker compose up --build
```

This command is for rebuilding the local dev container image when dependencies or the Docker setup change. For normal backend code changes, `docker compose up` is enough and hot reload handles the rest.

## Initial routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/profile`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`
