import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  server: {
    watch: {
      usePolling: true, 
      interval: 300,     
    },
    host: "0.0.0.0",     
    port: 5173,          
    strictPort: true,
  },
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      exclude: ['fs'],
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  }  
});
