import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader({
      svgoConfig: {
        plugins: [{ name: 'preset-default', params: { overrides: { removeViewBox: false } } }],
      },
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
