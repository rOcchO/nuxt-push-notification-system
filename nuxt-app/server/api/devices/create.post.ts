import { getDb } from '../../utils/dbClient'

// Create user in PGSQL
export default defineEventHandler(async (event) => {
  const { device_id } = await readBody(event)

  if (!device_id) {
    throw createError({ statusCode: 400, statusMessage: "Missing device_id" })
  }

  const db = getDb()
  await db.connect()

  const result = await db.query(
    `
    INSERT INTO users (device_id)
    VALUES ($1)
    ON CONFLICT (device_id) DO UPDATE SET device_id = EXCLUDED.device_id
    RETURNING id
    `,
    [device_id],
  )

  return { user_id: result.rows[0].id }
})
