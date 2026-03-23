<template>
  <header class="sticky top-0 z-50 bg-gray-900 text-white shadow-md">
    <nav class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="text-xl font-bold">Notifications POC</div>

      <!-- Desktop links -->
      <ul class="hidden md:flex items-center gap-6">
        <li>
          <NuxtLink to="/user" class="hover:text-blue-400 transition">
            User
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/admin" class="hover:text-blue-400 transition">
            Admin
          </NuxtLink>
        </li>
      </ul>

      <!-- Mobile menu button -->
      <button
        @click="open = !open"
        class="md:hidden text-2xl"
      >
        ☰
      </button>
    </nav>

    <!-- Mobile menu -->
    <transition name="fade">
      <div
        v-if="open"
        class="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-3"
      >
        <NuxtLink
          to="/user"
          class="block py-2 hover:text-blue-400"
          @click="open = false"
        >
          User
        </NuxtLink>

        <NuxtLink
          to="/admin"
          class="block py-2 hover:text-blue-400"
          @click="open = false"
        >
          Admin
        </NuxtLink>
      </div>
    </transition>
  </header>
</template>

<script setup>
const open = ref(false)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
