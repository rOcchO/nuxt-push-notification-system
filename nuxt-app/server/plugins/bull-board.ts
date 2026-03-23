import { startBullBoard } from '../bull-board'

export default defineNitroPlugin(() => {
  if (process.env.NODE_ENV === 'development') {
    startBullBoard()
  }
})