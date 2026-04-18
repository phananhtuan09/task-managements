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

## Docker full run

```bash
docker compose up --build
```

## Initial routes

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `GET /api/v1/users/:id`
- `POST /api/v1/users`
- `PATCH /api/v1/users/:id`
- `DELETE /api/v1/users/:id`
