import { Worker } from 'bullmq'
import webpush from 'web-push'
import { getDb } from '../utils/dbClient'

export default defineNitroPlugin(() => {
  
  const config = useRuntimeConfig()

  webpush.setVapidDetails(
    'mailto:contact@tondomaine.com',
    config.vapidPublicKey,
    config.vapidPrivateKey
  )

  const worker = new Worker(
    'notifications',
    async job => {
      const { notification_id } = job.data

      const db = getDb()
      await db.connect()

      // Get notification
      const notifRes = await db.query(
        `SELECT * FROM notifications WHERE id = $1`,
        [notification_id],
      )

      if (notifRes.rowCount === 0) {
        await job.log(`[BullMQ] Notification not found:' ${notification_id}`)
      
        return
      }

      const notif = notifRes.rows[0]

      // Get channel subscribers
      const usersRes = await db.query(
        `SELECT user_id FROM subscriptions WHERE channel_id = $1`,
        [notif.channel_id],
      )

      let globalSuccess = false
      let noUserSubscription = true

      // For each device (user)
      for (const u of usersRes.rows) {
        const subsRes = await db.query(
          `SELECT * FROM push_subscriptions WHERE user_id = $1`,
          [u.user_id],
        )

        // If no subcription from user for this channel, skip notification push
        if (subsRes.rowCount === 0) {
          continue
        }
        noUserSubscription = false

        // For each user subscription
        for (const s of subsRes.rows) {
          try {
            await webpush.sendNotification(
              {
                endpoint: s.endpoint,
                keys: { p256dh: s.p256dh, auth: s.auth }
              },
              JSON.stringify({
                title: notif.title,
                body: notif.body,
                data: notif.data
              })
            )

            globalSuccess = true

            // Log success
            await db.query(
              `INSERT INTO notification_logs (notification_id, user_id, status)
               VALUES ($1, $2, 'success')`,
              [notification_id, u.user_id]
            )

          } catch (err: any) {

            // Endpoint expired
            if (err.statusCode === 410 || err.statusCode === 404) {
              await db.query(
                `DELETE FROM push_subscriptions WHERE endpoint = $1`,
                [s.endpoint],
              )
            }

            // Log failed
            await db.query(
              `INSERT INTO notification_logs (notification_id, user_id, status, error)
               VALUES ($1, $2, 'failed', $3)`,
              [notification_id, u.user_id, err.message ?? String(err)]
            )
          }
        }
      }

      if (noUserSubscription) {
        await job.log(`[BullMQ] No subscriptions at all for notification ${notification_id}, skipping`)
        return
      }

      // If one delivery is succeded, set notification as sent
      if (globalSuccess) {
        await db.query(
          `UPDATE notifications SET sent_at = NOW() WHERE id = $1`,
          [notification_id],
        )
      } else {
        // BullMQ retry/backoff
        throw new Error('All notification deliveries failed')
      }

      await job.log(`Notification processed: ${notification_id}`)
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379)
      },
      concurrency: 10
    }
  )

  worker.on('completed', job => {
    console.log('[BullMQ] Job done', job.id)
  })

  worker.on('failed', (job, err) => {
    console.error('[BullMQ] Job failed', job?.id, err)
  })
})
