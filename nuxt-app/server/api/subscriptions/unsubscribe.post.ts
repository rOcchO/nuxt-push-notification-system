export default defineEventHandler(async (event) => {
  const { user_id, channel_slug } = await readBody(event)

  if (!user_id || !channel_slug) {
    throw createError({ statusCode: 400, statusMessage: "Missing user_id or channel_slug" })
  }

  const db = getDb()
  await db.connect()

  // Récupérer le channel
  const channel = await db.query(
    `SELECT id FROM channels WHERE slug = $1`,
    [channel_slug],
  )

  if (channel.rowCount === 0) {
    throw createError({ statusCode: 404, statusMessage: "Channel not found" })
  }

  // Supprimer l'abonnement
  const result = await db.query(
    `
    DELETE FROM subscriptions
    WHERE user_id = $1 AND channel_id = $2
    RETURNING id
    `,
    [user_id, channel.rows[0].id],
  )

  return {
    ok: true,
    unsubscribed: (result.rowCount ?? 0) > 0
  }
})
