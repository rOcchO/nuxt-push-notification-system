import { getDb } from '../../utils/dbClient'

// Create a new subcription in PGSQL
export default defineEventHandler(async (event) => {
  const { user_id, channel_slug } = await readBody(event)

  if (!user_id || !channel_slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing user_id or channel_slug" })
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

  await db.query(
    `
    INSERT INTO subscriptions (user_id, channel_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id, channel_id) DO NOTHING
    `,
    [user_id, channel.rows[0].id],
  )

  return { ok: true }
})