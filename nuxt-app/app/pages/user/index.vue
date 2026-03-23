<script setup>
definePageMeta({
  layout: 'default'
})

const channels = ref([])
// const { ensureUserExists, userId } = useUser()
const { userId } = useUser()
const notificationsEnabled = useState('notifications_enabled')

// Load channels from backend
onMounted(async () => {
  await ensureUserExists()
  const [allChannels, userSubs] = await Promise.all([
    $fetch('/api/channels/list'),
    $fetch(`/api/subscriptions/${userId.value}`)
  ])

  const subscribedSlugs = new Set(userSubs.map(s => s.slug))

  channels.value = allChannels.map(c => ({
    ...c,
    subscribed: subscribedSlugs.has(c.slug)
  }))
})

async function toggleChannel(channel) {
  channel.subscribed = !channel.subscribed

  const endpoint = channel.subscribed
    ? '/api/subscriptions/subscribe'
    : '/api/subscriptions/unsubscribe'

  await $fetch(endpoint, {
    method: 'POST',
    body: {
      user_id: userId.value,
      channel_slug: channel.slug
    }
  })
}
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-gray-100">Your notifications</h1>

    <ClientOnly>
      <EnableNotificationsToggle />
    </ClientOnly>

    <div class="space-y-4">
      <h2 class="text-xl font-semibold text-gray-300">Channels available</h2>

      <ChannelToggle
        v-for="c in channels"
        :key="c.id"
        :channel="c"
        :disabled="!notificationsEnabled"
        @toggle="toggleChannel"
      />
    </div>
  </div>
</template>
