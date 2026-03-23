import { Queue, Worker, QueueEvents } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379)
}

/* ---------------------------------------------
 * 1) Queue BullMQ (advanced configuration)
 * --------------------------------------------- */

export const notificationQueue = new Queue('notifications', {
  connection,
  defaultJobOptions: {
    attempts: 5, // retry x5
    backoff: {
      type: 'exponential',
      delay: 2000 // 2s → 4s → 8s → 16s → 32s
    },
    removeOnComplete: { age: 3600 }, // Delete Redis job when succeded after 1 hour
    removeOnFail: false,    // Keep Redis job when failed for debug
  }
})

/* ---------------------------------------------
 * 2) Worker BullMQ (concurrency + logs)
 * --------------------------------------------- */

export function startNotificationWorker(handler: (job: any) => Promise<void>) {
  const worker = new Worker(
    'notifications',
    async job => {
      return handler(job)
    },
    {
      connection,
      concurrency: 10, // 10 jobs in parallel
      limiter: {
        max: 50,       // 50 jobs max
        duration: 1000 // per seconde
      }
    }
  )

  /* ---------------------------------------------
   * 3) Worker events (monitoring)
   * --------------------------------------------- */
 
  worker.on('completed', job => {
    console.log(`[BullMQ] Job done #${job.id}`)  // TODO TO DELETE FOR PRODUCTION
  })

  worker.on('failed', (job, err) => {
    console.error(`[BullMQ] Job failed #${job?.id}`, err)
  })

  worker.on('progress', (job, progress) => {
    console.log(`[BullMQ] Job in progress #${job.id}:`, progress)
  })

  return worker
}

/* ---------------------------------------------
 * 4) Queue events (bull-board)
 * --------------------------------------------- */

export const notificationQueueEvents = new QueueEvents('notifications', {
  connection
})

notificationQueueEvents.on('waiting', ({ jobId }) => {
  console.log(`[BullMQ] Job in queue #${jobId}`)
})

notificationQueueEvents.on('active', ({ jobId }) => {
  console.log(`[BullMQ] Active job #${jobId}`)
})

notificationQueueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[BullMQ] Job failed #${jobId}: ${failedReason}`)
})
