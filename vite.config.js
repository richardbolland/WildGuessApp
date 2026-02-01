import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // ✅ CORRECT: Must match 'WildGuessApp' exactly
  base: "/WildGuessApp/", 
})