import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  server: { https: true, host:'0.0.0.0' },
  plugins: [ mkcert() ]
})
