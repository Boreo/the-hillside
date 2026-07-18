// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import { unified } from '@astrojs/markdown-remark';
import rehypePhotoRuns from './src/lib/rehype-photo-runs.mjs';

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

  markdown: {
    processor: unified({ rehypePlugins: [rehypePhotoRuns] }),
  },

  // 'compile' processes images with sharp at build time, so the static
  // output needs no Cloudflare Images binding or runtime /_image endpoint.
  adapter: isDev ? undefined : cloudflare({ imageService: 'compile' }),
});