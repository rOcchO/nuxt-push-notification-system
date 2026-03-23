import { getDb } from '../../utils/dbClient'

// Get all subscription from one user
export default defineEventHandler(async (event) => {
  const user_id = event.context.params?.user_id

  if (!user_id) {
    throw createError({ statusCode: 400, statusMessage: "Missing user_id" })
  }

  const db = getDb()
  await db.connect()

  const result = await db.query(
    `
    SELECT s.id, c.slug, c.name, s.created_at
    FROM subscriptions s
    JOIN channels c ON c.id = s.channel_id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC
    `,
    [user_id],
  )

  return result.rows
})
