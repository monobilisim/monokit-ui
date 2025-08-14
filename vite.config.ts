import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0')
  },
  // test: {
  //   browser: {
  //     enabled: true,
  //     provider: 'playwright',
  //     instances: [{ browser: 'chromium' }]
  //   },
  //   include: ['src/**/*.svelte.test.ts'],
  //   setupFiles: ['./vitest-setup-client.ts']
  // },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        const msg = warning.message;
        const code = warning.code;

        if (code === 'UNUSED_EXTERNAL_IMPORT') {
          return;
        }

        if (msg.includes('this.resolve') && msg.includes('options')) {
          return;
        }

        warn(warning);
      }
    }
  }
});
