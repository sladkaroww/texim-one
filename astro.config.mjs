import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  // Preserve exact URLs like /events.html, /media.html instead of /events/
  build: {
    format: 'file',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
