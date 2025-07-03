import adapter from 'svelte-adapter-bun';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  optimizeDeps: {
    exclude: ['@tanstack/svelte-query, chart.js']
  },

  kit: {
    adapter: adapter(),
    alias: {
      '@/*': './path/to/lib/*'
    }
  }
};

export default config;
