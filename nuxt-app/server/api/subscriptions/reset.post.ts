import { getDb } from '../../utils/dbClient'

// Reset user subscriptions
export default defineEventHandler(async (event) => {
  const { user_id } = await readBody(event)

  if (!user_id) {
    throw createError({ statusCode: 400, statusMessage: "Missing user_id" })
  }

  const db = getDb()
  await db.connect()

  const result = await db.query(
    `
    DELETE FROM subscriptions
    WHERE user_id = $1
    `,
    [user_id],
  )

  return {
    ok: true,
    removed_count: result.rowCount ?? 0
  }
})
