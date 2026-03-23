export default defineNuxtPlugin(() => {
  let stored = localStorage.getItem('device_id')
  if (!stored) {
    stored = crypto.randomUUID()
    localStorage.setItem('device_id', stored)
  }
})
