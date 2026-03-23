import express from 'express'
import { ExpressAdapter } from '@bull-board/express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { notificationQueue } from './utils/queue'

export function startBullBoard() {
  const app = express()
  const serverAdapter = new ExpressAdapter()

  serverAdapter.setBasePath('/admin/queues')

  createBullBoard({
    queues: [new BullMQAdapter(notificationQueue)],
    serverAdapter,
  })

  app.use('/admin/queues', serverAdapter.getRouter())

  const port = process.env.BULLBOARD_PORT ?? 3030
  app.listen(port, () => {
    console.log(`Bull Board running on http://localhost:${port}/admin/queues`)
  })
}
