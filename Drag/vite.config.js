//https server config
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  server: {
    allowedHosts: 'all',
    port: 5173, //your own port
    strictPort: true,
    host: true,
    https: {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.cert')
    }
  }
});