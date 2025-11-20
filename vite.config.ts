import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement pour les injecter
  // We use '.' instead of process.cwd() to avoid TypeScript errors with missing Node types
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    define: {
      // Important: Remplace process.env.API_KEY par la valeur réelle lors du build
      // Ensure we pass a string even if API_KEY is undefined to avoid build errors
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  };
});