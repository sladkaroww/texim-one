// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://vtc.texim.one',
  output: 'static',
  build: {
    // Keep .html extensions so existing /events.html, /media.html ... URLs
    // continue to resolve (Cloudflare Pages serves them as-is).
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) => {
        // Exclude utility/private pages from the sitemap.
        if (page.includes('/404')) return false;
        if (page.includes('/add-convoy')) return false;
        return true;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
