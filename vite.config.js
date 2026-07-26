import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const htmlPages = [
  'index.html',
  'about.html',
  'admin-dashboard.html',
  'admin-forgot-password.html',
  'admin-login.html',
  'admin-reset-password.html',
  'article.html',
  'categories.html',
  'contact.html',
  'dashboard.html',
  'founder-team.html',
  'gallery.html',
  'news.html',
  'team.html',
]

const input = Object.fromEntries(
  htmlPages.map((file) => [file.replace('.html', ''), fileURLToPath(new URL(file, import.meta.url))]),
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input,
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})