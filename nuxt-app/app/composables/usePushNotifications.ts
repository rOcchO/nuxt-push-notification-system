import { urlBase64ToUint8Array } from '~/utils/urlBase64ToUint8Array'

export function usePushNotifications() {
  const config = useRuntimeConfig()
  const notificationsEnabled = useState('notifications_enabled', () => false)
  // Get public VAPID key
  const vapidPublicKey = config.public.vapidPublicKey as string
  const { ensureUserExists } = useUser()

  const isSupported = computed(() => {
    if (typeof window === 'undefined') return false
    return 'serviceWorker' in navigator && 'PushManager' in window
  })

  async function askPermission() {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async function subscribe() {
    if (!isSupported.value) return null
    if (!vapidPublicKey) {
      console.error("Missing VAPID public key")
      return null
    }

    const granted = await askPermission()
    if (!granted) return null

    // Service worker ready
    const registration = await navigator.serviceWorker.ready

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })

    const json = subscription.toJSON()
    const userId = await ensureUserExists()
    // Save it to DB
    await $fetch('/api/push/register', {
      method: 'POST',
      body: {
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth
      }
    })
    notificationsEnabled.value = true
    return subscription
  }

  async function unsubscribe() {
    if (!isSupported.value) return

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) return

    const json = subscription.toJSON()
    const userId = await ensureUserExists()

    await $fetch('/api/push/unregister', {
      method: 'POST',
      body: {
        user_id: userId,
        endpoint: json.endpoint
      }
    })

    await subscription.unsubscribe()
  }
  notificationsEnabled.value = false
  return { isSupported, unsubscribe, subscribe }
}
