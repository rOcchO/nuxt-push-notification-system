# Nuxt Push Notification System (POC)

A proof‑of‑concept push notification system built with **Nuxt 4**, **BullMQ**, **Redis**, and **Web Push**.  
This project demonstrates scheduled notifications, queue processing, VAPID‑based Web Push delivery, and a minimal admin interface to manage messages.

---

## Features

- Web Push notifications (VAPID)
- Scheduled notifications using BullMQ
- Redis‑backed job queues
- Admin UI to create and manage notifications
- Bull board to monitor jobs
- PostgreSQL schema for storing subscriptions
- Docker Compose environment for Redis & tooling
- Nuxt 4 development environment

---

## Requirements

Before running the project, ensure you have:

- **Node.js 18+**
- **pnpm** or **npm**
- **Docker & Docker Compose**
- **PostgreSQL client** (psql)
- **Redis client** (redis-cli) — optional but recommended

---

## Architecture overview

```
Browser  →  Nuxt API  →  PostgreSQL
   ↑            ↓
Service Worker ← Web Push ← Worker (BullMQ) ← Redis
```

---

## Running the Infrastructure (Docker Compose)

The project includes a `docker-compose.yml` file providing:

- Redis (for BullMQ)
- PostgreSQL

Start the stack:

```bash
docker compose up -d
```

## Database schema

Use `psql -h localhost -U dev -d poc` to create tables and indexes:

    CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE channels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, channel_id)
    );

    CREATE TABLE push_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL UNIQUE,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        data JSONB DEFAULT '{}'::jsonb,
        scheduled_at TIMESTAMPTZ,  -- null = envoyer maintenant
        sent_at TIMESTAMPTZ,       -- null = pas encore envoyée
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE notification_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status TEXT NOT NULL, -- 'success' ou 'failed'
        error TEXT
    );

    -- USERS
    CREATE UNIQUE INDEX idx_users_device_id ON users(device_id);

    -- CHANNELS
    CREATE UNIQUE INDEX idx_channels_slug ON channels(slug);

    -- SUBSCRIPTIONS
    CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
    CREATE INDEX idx_subscriptions_channel_id ON subscriptions(channel_id);

    -- PUSH SUBSCRIPTIONS
    CREATE UNIQUE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
    CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);

    -- NOTIFICATIONS
    CREATE INDEX idx_notifications_scheduled_at ON notifications(scheduled_at);
    CREATE INDEX idx_notifications_sent_at ON notifications(sent_at);
    CREATE INDEX idx_notifications_channel_id ON notifications(channel_id);

    -- NOTIFICATION LOGS
    CREATE INDEX idx_notification_logs_notification_id ON notification_logs(notification_id);
    CREATE INDEX idx_notification_logs_user_id ON notification_logs(user_id);

## Generating VAPID Keys

The push notification system requires a VAPID key pair. Generate them with:

`npx web-push generate-vapid-keys`

Create a .env file and copy VAPID keys:

```bash
VAPID_PUBLIC_KEY=<your_public_key>
VAPID_PRIVATE_KEY=<your_private_key>
```

## Run the project

1. Install dependencies:

  `pnpm install`

2. Start Nuxt in development mode:

`pnpm dev`

3. Check Bull board on http://localhost:3030/admin/queues (optional)
  

