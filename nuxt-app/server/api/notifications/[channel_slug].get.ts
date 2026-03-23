import { getDb } from '../../utils/dbClient'

// Get all notifications for one channel
export default defineEventHandler(async (event) => {
  const channel_slug = event.context.params?.channel_slug

  if (!channel_slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing channel_slug" })
  }

  const db = getDb()
  await db.connect()

  const channel = await db.query(
    `SELECT id FROM channels WHERE slug = $1`,
    [channel_slug],
  )

  if (channel.rowCount === 0) {
    throw createError({ statusCode: 404, statusMessage: "Channel not found" })
  }

  const notifications = await db.query(
    `
    SELECT id, title, body, data, scheduled_at, sent_at, created_at
    FROM notifications
    WHERE channel_id = $1
    ORDER BY created_at DESC
    `,
    [channel.rows[0].id],
  )

  return notifications.rows
})
