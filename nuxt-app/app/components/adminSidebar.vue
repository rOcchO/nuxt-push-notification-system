<template>
  <aside class="w-64 bg-gray-900 text-gray-200 h-[calc(100vh-64px)] sticky top-16 p-6 flex flex-col gap-6">

    <h2 class="text-xl font-semibold">Admin</h2>

    <nav class="flex flex-col gap-4">
      <NuxtLink
        to="/admin"
        class="hover:text-blue-400 transition"
      >
        Dashboard
      </NuxtLink>

      <NuxtLink
        to="/admin/create-notification"
        class="hover:text-blue-400 transition"
      >
        Create notification
      </NuxtLink>

      <NuxtLink
        to="/admin/channels"
        class="hover:text-blue-400 transition"
      >
        Channels
      </NuxtLink>
    </nav>
  </aside>
</template>
