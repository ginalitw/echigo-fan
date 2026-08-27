import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://echigo.fan',
  markdown: {
    shikiConfig: { theme: 'github-light' }
  }
});
