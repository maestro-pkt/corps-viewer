import tailwindcss from '@tailwindcss/vite';
// import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,

  css: ['~/assets/css/main.css'],
  modules: ['@primevue/nuxt-module', '@pinia/nuxt', 'nuxt-viewport'],
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
  app: {
    head: {
      title: 'Corps Player',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
      ],
    },
  },
});
