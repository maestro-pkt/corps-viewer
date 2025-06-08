import tailwindcss from '@tailwindcss/vite';
// import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@primevue/nuxt-module',
    '@pinia/nuxt',
    'nuxt-viewport',
  ],
  primevue: {
    importTheme: { from: '@/theme.js' },
    // options: {
    //   theme: {
    //     preset: Aura,
    //   },
    // },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/data/**'],
      },
    },
  },
});