# Agrisolar Backend

NestJS hybrid backend for the Agrisolar Smart Farming platform. Serves both a REST API (port 3000) and an MQTT microservice listener for telemetry ingestion.

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+

### One-Command Bring-Up

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Start all services (PostgreSQL, Mosquitto, API)
docker compose up -d

# 3. Apply database migrations
docker compose exec api npx prisma migrate deploy

# 4. Seed the admin user
docker compose exec api npx prisma db seed
```

### Verify Setup

```bash
# Check logs
docker compose logs -f api

# Login as seeded admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@farm.com","password":"FarmAdmin2026!"}'
```

Expected response: `201 Created` with `{ "accessToken": "...", "user": {...} }`

## API Endpoints

### Authentication
- `POST /auth/login` - Authenticate and receive JWT (public)

### Telemetry (JWT required)
- `GET /telemetry/latest?deviceId=<id>` - Latest reading
- `GET /telemetry/history?deviceId=<id>&from=<iso>&to=<iso>&limit=<n>` - Historical data

### Commands (JWT required)
- `POST /commands/pump` - Issue pump override command

## Development

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev

# Run tests
npm test
npm run test:e2e
```

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `MQTT_URL` - MQTT broker URL
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` - Admin credentials

## Security Note

The Mosquitto broker is configured with `allow_anonymous true` for local development only. Before any non-local deployment, broker authentication MUST be enabled. See `mosquitto/config/mosquitto.conf` for details.
