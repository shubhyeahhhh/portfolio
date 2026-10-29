import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import htmlPartials from './plugins/html-partials.js';

const root = fileURLToPath(new URL('.', import.meta.url));

// Every page is a real HTML file (good for SEO); add new pages here.
const pages = {
  home: 'index.html',
  work: 'work/index.html',
  existentialEvolution: 'work/existential-evolution/index.html',
  services: 'services/index.html',
  about: 'about/index.html',
  contact: 'contact/index.html',
  thanks: 'contact/thanks/index.html',
  notFound: '404.html',
};

export default defineConfig({
  plugins: [htmlPartials({ root })],
  server: { port: 5175 },
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(pages).map(([k, v]) => [k, resolve(root, v)])),
    },
  },
});
