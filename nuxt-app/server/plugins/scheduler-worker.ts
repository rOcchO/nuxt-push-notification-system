import { Worker, Queue } from 'bullmq'
import { getDb } from '../utils/dbClient'
import { notificationQueue } from '../utils/queue'

export default defineNitroPlugin(() => {

    // Scheduler queue
  const schedulerQueue = new Queue('scheduler', {
    connection: {
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379)
    }
  })

  // Add Scanning job to the queue
  schedulerQueue.add(
    'scan',
    {},
    {
      repeat: { every: 60_000 } // Every minute
    }
  )

  // Worker for executing "scan" job
  const schedulerWorker = new Worker(
    'scheduler',
    async job => {
        console.log("[Scheduler] Scan running")
      const db = getDb()
      await db.connect()

      const res = await db.query(`
        SELECT *
        FROM notifications
        WHERE scheduled_at IS NOT NULL
        AND scheduled_at <= NOW()
        AND sent_at IS NULL
      `)

      if (res.rows.length === 0) {
        return { sent: 0 }
      }

      for (const row of res.rows) {
        // Find channel (for log info)
        let channel = await db.query(
        `SELECT id, slug, name FROM channels WHERE id = $1`,
        [row.channel_id],
    )
        await notificationQueue.add('send-notification', {
          notification_id: row.id,
          title: row.title,
          body: row.body,
          channel_id: channel.rows[0].id,
          channel_name: channel.rows[0].name,
          channel_slug: channel.rows[0].slug,
          scheduled_at: row.scheduled_at,
          created_at: row.created_at
        })
      }
      await job.log(`Scheduler sent ${res.rows.length} notifications`)
      // Populate scheduler data in bull dashboard
      return { sent: res.rows.length }
    },
    {
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379)
      }
    }
  )
  console.log("[Scheduler] Worker instantiated")
})