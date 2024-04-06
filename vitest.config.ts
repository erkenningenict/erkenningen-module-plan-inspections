import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dns from 'dns';

// localhost part
dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  // depending on your application, base can also be "/"
  base: '',
  plugins: [react()],
});
