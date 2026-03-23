// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    public: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY
    }
  },
  typescript: {
    typeCheck: false,
  },

  modules: ['@nuxtjs/tailwindcss']
})