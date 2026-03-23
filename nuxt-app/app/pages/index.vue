<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-gray-100 bg-gray-950">
    <h1 class="text-4xl font-bold mb-10">Notifications POC</h1>

    <div class="flex gap-6">
      <NuxtLink
        to="/user"
        class="px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg shadow text-lg font-medium transition"
      >
        User
      </NuxtLink>

      <NuxtLink
        to="/admin"
        class="px-6 py-3 bg-gray-900 hover:bg-gray-800 rounded-lg shadow text-lg font-medium transition"
      >
        Admin
      </NuxtLink>
    </div>
  </div>
</template>
