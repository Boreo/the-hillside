// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://www.thehillside.com.au',
  trailingSlash: 'ignore',

  redirects: {
    // legacy Squarespace paths
    '/home': '/',
    '/further-inform': '/location/',
  },

  adapter: isDev ? undefined : cloudflare(),
});