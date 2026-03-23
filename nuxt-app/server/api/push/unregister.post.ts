import { getDb } from '../../utils/dbClient'

// Delete push subcription
export default defineEventHandler(async (event) => {
  const { user_id } = await readBody(event)

  if (!user_id) {
    throw createError({ statusCode: 400, statusMessage: "Missing user ID" })
  }

  const db = getDb()
  await db.connect()

  const result = await db.query(
    `
    DELETE FROM push_subscriptions
    WHERE endpoint = $1
    RETURNING id
    `,
    [user_id],
  )

  return {
    ok: true,
    removed: (result.rowCount ?? 0) > 0
  }
})
