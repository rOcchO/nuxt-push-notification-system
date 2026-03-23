<script setup>
definePageMeta({
  layout: 'admin'
})
const { toUtc } = useUtcDate()

const title = ref('')
const message = ref('')
const channel = ref(null)
const mode = ref('live') // 'live' or 'scheduled'
const scheduledAt = ref(null)

const channels = ref([])

onMounted(async () => {
  channels.value = await $fetch('/api/channels/list')
  if (channels.value.length > 0) {
    channel.value = channels.value[0].slug
  }
})

async function submit() {
  await $fetch('/api/notifications/create', {
    method: 'POST',
    body: {
      channel_slug: channel.value,
      title: title.value,
      body: message.value,
      scheduled_at: mode.value === 'scheduled' ? toUtc(scheduledAt.value) : null
    }
  })

  title.value = ''
  message.value = ''
  mode.value='live'
  scheduledAt.value = null
}
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold">Create Notification</h1>

    <form @submit.prevent="submit" class="space-y-6 max-w-xl">
      <!-- Title -->
      <div>
        <label class="block mb-2 text-gray-300">Title</label>
        <input v-model="title" class="w-full p-3 bg-gray-900 rounded border border-gray-700" />
      </div>
      <!-- Content -->
      <div>
        <label class="block mb-2 text-gray-300">Message</label>
        <textarea v-model="message" rows="4" class="w-full p-3 bg-gray-900 rounded border border-gray-700" />
      </div>
      <!-- Channel -->
      <div>
        <label class="block mb-2 text-gray-300">Channel</label>
        <select v-model="channel" class="w-full p-3 bg-gray-900 rounded border border-gray-700">
          <option v-for="c in channels" :key="c.id" :value="c.slug">
            {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Mode Live / Scheduled -->
      <div class="mt-4">
        <label class="block mb-2 text-gray-300">Mode</label>

        <div class="flex items-center gap-4 text-gray-300">
          <label class="flex items-center gap-2">
            <input type="radio" value="live" v-model="mode" />
            Live
          </label>

          <label class="flex items-center gap-2">
            <input type="radio" value="scheduled" v-model="mode" />
            Scheduled
          </label>
        </div>
      </div>

      <!-- Date + Time if scheduled -->
      <div v-if="mode === 'scheduled'" class="mt-4">
        <label class="block mb-2 text-gray-300">Date & time</label>
        <input
          type="datetime-local"
          v-model="scheduledAt"
          class="w-full p-3 bg-gray-900 rounded border border-gray-700"
        />
      </div>

      <button class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded text-white">
        Send notification
      </button>
    </form>
  </div>
</template>