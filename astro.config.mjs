// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.thehillside.com.au',
  trailingSlash: 'ignore',
  redirects: {
    // legacy Squarespace paths
    '/home': '/',
    '/further-inform': '/location/',
  },
});
