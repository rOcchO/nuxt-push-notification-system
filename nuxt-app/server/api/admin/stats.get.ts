import { getDb } from '../../utils/dbClient'

export default defineEventHandler(async () => {
  const db = getDb()
  await db.connect()

  const [{ count: channels }] =
    (await db.query(`SELECT COUNT(*) FROM channels`)).rows

  const [{ count: subscriptions }] =
    (await db.query(`SELECT COUNT(*) FROM push_subscriptions`)).rows

  const [{ count: notifications }] =
    (await db.query(`SELECT COUNT(*) FROM notifications WHERE sent_at IS NOT NULL`)).rows

  return {
    channels: Number(channels),
    subscriptions: Number(subscriptions),
    notifications: Number(notifications)
  }
})
