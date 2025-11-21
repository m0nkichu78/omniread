import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement pour les injecter
  // We use '.' instead of process.cwd() to avoid TypeScript errors with missing Node types
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Ensure process.env.API_KEY is always empty string in production build
      // to enforce BYOK (Bring Your Own Key)
      'process.env.API_KEY': JSON.stringify('')
    }
  };
});