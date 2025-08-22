import tailwindcss from '@tailwindcss/vite';
// import Aura from '@primeuix/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  // debug: true,
  ssr: false,

  css: ['~/assets/css/main.css'],
  modules: [
    '@primevue/nuxt-module',
    '@pinia/nuxt',
    //
    '@vueuse/nuxt',
  ],
  primevue: {
    importTheme: { from: '@/theme.js' },
    // options: {
    //   theme: {
    //     preset: Aura,
    //   },
    // },
  },
  esbuild: {
    options: {
      target: 'esnext', // 👈 esbuild.target
    },
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: ['**/data/**'],
      },
    },

    build: {
      target: 'esnext',
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
