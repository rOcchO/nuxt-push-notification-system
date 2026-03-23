export function useUser() {
  const deviceId = useState<string>('device_id', () => {
    if (import.meta.client) {
      return localStorage.getItem('device_id') || ''
    }
    return ''
  })

  const userId = useState<string | null>('user_id', () => null)

  async function ensureUserExists(): Promise<string> {
    while (!deviceId.value) {
      await new Promise(resolve => setTimeout(resolve, 0))
      if (import.meta.client) {
        deviceId.value = localStorage.getItem('device_id') || ''
      }
    }

    if (userId.value) return userId.value

    const res = await $fetch<{ user_id: string }>('/api/devices/create', {
      method: 'POST',
      body: { device_id: deviceId.value }
    })

    userId.value = res.user_id
    return res.user_id
  }

  return { deviceId, userId, ensureUserExists }
}
