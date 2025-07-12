import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // More specific vendor chunking
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'router-vendor';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          if (id.includes('node_modules/react-hot-toast')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/axios')) {
            return 'api-vendor';
          }
          
          // Split large vendor packages
          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/recharts')) {
            return 'charts-vendor';
          }
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          
          // Remaining node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // Feature-based chunking
          if (id.includes('src/features/Admin')) {
            return 'admin';
          }
          if (id.includes('src/features/Coordinator')) {
            return 'coordinator';
          }
          if (id.includes('src/features/Learner')) {
            return 'learner';
          }
          if (id.includes('src/features/ProjectManager')) {
            return 'project-manager';
          }
          if (id.includes('src/features/auth')) {
            return 'auth';
          }
          if (id.includes('src/features/landing')) {
            return 'landing';
          }
        }
      }
    },
    
    chunkSizeWarningLimit: 250,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        passes: 2,
        dead_code: true,
        unused: true
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    },
    
    sourcemap: false,
    cssMinify: true,
    assetsInlineLimit: 4096,
  },
  
  server: {
    port: 5173,
    open: false,
    hmr: {
      overlay: false
    }
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios'
    ],
    exclude: ['lottie-react'],
    force: true
  },
  
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})