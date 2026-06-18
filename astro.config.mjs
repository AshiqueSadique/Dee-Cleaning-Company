import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [
    react(),
  ],
  vite: {
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'th'],
    routing: 'manual',
  },
});
