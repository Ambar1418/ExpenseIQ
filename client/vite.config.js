import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
const base = process.env.VITE_BASE_URL || '/';

export default defineConfig({
  base,
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icon-72.png',
        'icon-96.png',
        'icon-128.png',
        'icon-144.png',
        'icon-152.png',
        'icon-192.png',
        'icon-384.png',
        'icon-512.png',
        'icon-maskable-192.png',
        'icon-maskable-512.png',
      ],
      manifest: {
        name: 'ExpenseIQ - Smart Expense Tracker',
        short_name: 'ExpenseIQ',
        description: 'AI-powered expense tracking and analytics. Upload receipts and get intelligent insights.',
        theme_color: '#6366F1',
        background_color: '#070913',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['finance', 'productivity'],
        icons: [
          { src: 'icon-72.png',          sizes: '72x72',   type: 'image/png', purpose: 'any' },
          { src: 'icon-96.png',          sizes: '96x96',   type: 'image/png', purpose: 'any' },
          { src: 'icon-128.png',         sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: 'icon-144.png',         sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: 'icon-152.png',         sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: 'icon-192.png',         sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-384.png',         sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png',         sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View your expense dashboard',
            url: '/dashboard',
            icons: [{ src: 'icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Add Expense',
            short_name: 'Add',
            description: 'Upload a receipt or add an expense',
            url: '/upload',
            icons: [{ src: 'icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Transactions',
            short_name: 'Transactions',
            description: 'View all transactions',
            url: '/transactions',
            icons: [{ src: 'icon-96.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        // Cache strategies for different asset types
        runtimeCaching: [
          {
            // API requests — Network Only (never cache sensitive data)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            // Google Fonts — Cache First
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // App shell (HTML, JS, CSS) — StaleWhileRevalidate
            urlPattern: /\.(js|css|html)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            // Images — Cache First
            urlPattern: /\.(png|jpg|jpeg|gif|svg|ico|webp)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Pre-cache everything in the dist folder
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        // Offline fallback for navigation requests
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
