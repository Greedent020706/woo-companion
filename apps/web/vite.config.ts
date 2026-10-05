import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3 todavía usa @import y funciones globales de Sass
        quietDeps: true,
        silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
      },
    },
  },
});
