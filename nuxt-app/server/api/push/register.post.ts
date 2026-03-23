import { getDb } from '../../utils/dbClient'

// Register device endpoint
export default defineEventHandler(async (event) => {
  const { user_id, endpoint, p256dh, auth } = await readBody(event)

  if (!user_id || !endpoint || !p256dh || !auth) {
    throw createError({ statusCode: 400, statusMessage: "Missing push subscription fields" })
  }

  const db = getDb()
  await db.connect()

  await db.query(
    `
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (endpoint) DO UPDATE SET
      p256dh = EXCLUDED.p256dh,
      auth = EXCLUDED.auth
    `,
    [user_id, endpoint, p256dh, auth],
  )

  return { ok: true }
})
