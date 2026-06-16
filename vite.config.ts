import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project site: https://samramseyer.github.io/kaban-board/
export default defineConfig({
  base: '/kaban-board/',
  plugins: [react()],
})
