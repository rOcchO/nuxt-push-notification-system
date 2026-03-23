export function useDeviceId() {
  const deviceId = useState<string>('device_id', () => '')

  if (import.meta.client && !deviceId.value) {
    const stored = localStorage.getItem('device_id')
    if (stored) {
      deviceId.value = stored
    }
  }

  return deviceId
}
