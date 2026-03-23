<script setup>
definePageMeta({
  layout: 'admin'
})

const stats = ref({
  notifications: 0,
  channels: 0,
  subscriptions: 0
})

onMounted(async () => {
  stats.value = await $fetch('/api/admin/stats')
})

</script>

<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold">Dashboard</h1>

    <div class="grid grid-cols-3 gap-6">
      <div class="bg-gray-900 p-6 rounded-xl shadow">
        <p class="text-gray-400">Total notifications</p>
        <p class="text-3xl font-semibold mt-2">{{ stats.notifications }}</p>
      </div>

      <div class="bg-gray-900 p-6 rounded-xl shadow">
        <p class="text-gray-400">Active channels</p>
        <p class="text-3xl font-semibold mt-2">{{ stats.channels }}</p>
      </div>

      <div class="bg-gray-900 p-6 rounded-xl shadow">
        <p class="text-gray-400">Users subscribed</p>
        <p class="text-3xl font-semibold mt-2">{{ stats.subscriptions }}</p>
      </div>
    </div>
  </div>
</template>

