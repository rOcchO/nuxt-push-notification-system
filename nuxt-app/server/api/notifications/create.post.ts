import { getDb } from '../../utils/dbClient'
import { notificationQueue } from '../../utils/queue'

// Create a new notification in PGSQL and publish it to Redis.

export default defineEventHandler(async (event) => {
  const { channel_slug, title, body, data, scheduled_at } = await readBody(event)

  if (!channel_slug || !title || !body) {
    throw createError({ statusCode: 400, statusMessage: "Missing channel_slug, title or body" })
  }

  const db = getDb()
  await db.connect()

  // Find channel
  const channel = await db.query(
    `SELECT id, slug, name FROM channels WHERE slug = $1`,
    [channel_slug],
  )

  if (channel.rowCount === 0) {
    throw createError({ statusCode: 404, statusMessage: "Channel not found" })
  }

  // Create notification
  const result = await db.query(
    `
    INSERT INTO notifications (channel_id, title, body, data, scheduled_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [channel.rows[0].id, title, body, data ?? {}, scheduled_at ?? null],
  )

  const notification = result.rows[0]

  // Publish to BullMQ (if not scheduled)
  if (!scheduled_at) {
      await notificationQueue.add(
    'send-notification',
      { 
        notification_id: notification.id,
        title: notification.title,
        body: notification.body,
        channel_id: channel.rows[0].id,
        channel_name: channel.rows[0].name,
        channel_slug: channel.rows[0].slug,
        scheduled_at: notification.scheduled_at,
        created_at: notification.created_at 
      }
    )
  }

  return { id: notification.id }
})
