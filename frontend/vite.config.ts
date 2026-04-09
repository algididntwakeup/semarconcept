// platform/frontend-mui/src/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4071,
    host: '0.0.0.0',
    strictPort: true,  // ← ADD THIS LINE
    allowedHosts: [
      'reksolindo.opuschamber.com',
    ]    
  }
});