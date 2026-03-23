<script setup>
const { subscribe, unsubscribe, isSupported } = usePushNotifications()

const notificationsEnabled = useState('notifications_enabled', () => false)


onMounted(async () => {
  if (!isSupported.value) return
  const registration = await navigator.serviceWorker.ready
  const sub = await registration.pushManager.getSubscription()
  notificationsEnabled.value = !!sub
})

async function onToggle() {
  if (notificationsEnabled.value) {
    await unsubscribe()
    notificationsEnabled.value = false
  } else {
    await subscribe()
    notificationsEnabled.value = true
  }
}
</script>

<template>
  <div class="flex items-center gap-3 p-2 bg-gray-800 rounded-lg shadow w-fit">
    <span class="text-gray-200">Notifications</span>

    <button
      @click="onToggle"
      class="px-3 py-1 rounded text-sm font-medium transition"
      :class="notificationsEnabled
        ? 'bg-green-600 hover:bg-green-500 text-white'
        : 'bg-gray-600 hover:bg-red-500 text-white'"
    >
      {{ notificationsEnabled ? 'ON' : 'OFF' }}
    </button>
  </div>
</template>
