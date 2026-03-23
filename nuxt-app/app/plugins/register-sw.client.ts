export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  navigator.serviceWorker.register('/sw.js')
    .then(reg => {
      console.log('[SW] Service Worker registered:', reg.scope)
    })
    .catch(err => {
      console.error('[SW] Registration failed:', err)
    })
})
