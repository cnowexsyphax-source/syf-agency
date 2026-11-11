import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import fs from 'node:fs';

// Set SITE_URL to the real production domain (e.g. SITE_URL=https://syfagency.com npm run build).
const SITE_URL = (process.env.SITE_URL || 'https://syf-agency.vercel.app').replace(/\/$/, '');
const PAGES = ['', 'privacy.html', 'cookies.html', 'legal.html'];

function siteUrlPlugin(): Plugin {
  return {
    name: 'syf-site-url',
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', SITE_URL) },
    closeBundle() {
      const out = resolve(__dirname, 'dist');
      if (!fs.existsSync(out)) return;
      const today = new Date().toISOString().slice(0, 10);
      const urls = PAGES.map((p) => `  <url><loc>${SITE_URL}/${p}</loc><lastmod>${today}</lastmod><priority>${p ? '0.3' : '1.0'}</priority></url>`).join('\n');
      fs.writeFileSync(resolve(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
      fs.writeFileSync(resolve(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
    },
  };
}

export default defineConfig({
  plugins: [react(), siteUrlPlugin()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        cookies: resolve(__dirname, 'cookies.html'),
        legal: resolve(__dirname, 'legal.html'),
      },
    },
  },
});
