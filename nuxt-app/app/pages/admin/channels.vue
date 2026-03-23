<script setup>
definePageMeta({
  layout: 'admin'
})
const channels = ref([])
const name = ref('')
const slug = ref('')

// Get existing channels
async function loadChannels() {
  channels.value = await $fetch('/api/channels/list')
}

onMounted(async () => {
  await loadChannels()
})

// Create new channel
async function createChannel() {
  await $fetch('/api/channels/create', {
    method: 'POST',
    body: { name: name.value, slug: slug.value }
  })
  //Reload list
  await loadChannels()
  // Reset form
  name.value = ''
  slug.value = ''
}
</script>

<template>
  <div class="space-y-10">
    <h1 class="text-3xl font-bold">Channels</h1>

    <!-- Create form -->
    <form @submit.prevent="createChannel" class="space-y-4 max-w-md">
      <div>
        <label class="block mb-1 text-gray-300">Name</label>
        <input v-model="name" class="w-full p-3 bg-gray-900 border border-gray-700 rounded" />
      </div>

      <div>
        <label class="block mb-1 text-gray-300">Slug</label>
        <input v-model="slug" class="w-full p-3 bg-gray-900 border border-gray-700 rounded" />
      </div>

      <button class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white">
        Create channel
      </button>
    </form>

    <!-- Channels list -->
    <div class="space-y-4">
      <div
        v-for="c in channels"
        :key="c.id"
        class="bg-gray-900 p-4 rounded flex justify-between items-center"
      >
        <div>
          <p class="text-lg font-semibold">{{ c.name }}</p>
          <p class="text-gray-400 text-sm">{{ c.slug }}</p>
        </div>

        <p class="text-gray-500 text-sm">
          {{ new Date(c.created_at).toLocaleDateString() }}
        </p>
      </div>
    </div>
  </div>
</template>