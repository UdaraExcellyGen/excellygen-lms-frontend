// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // OPTIMIZATION: Build configuration for production
  build: {
    target: 'esnext',
    
    // OPTIMIZATION: Advanced chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          // Router
          if (id.includes('node_modules/react-router-dom')) {
            return 'router-vendor';
          }
          
          // UI Libraries
          if (id.includes('node_modules/lucide-react')) {
            return 'icons-vendor';
          }
          if (id.includes('node_modules/react-hot-toast')) {
            return 'ui-vendor';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          
          // API & Data
          if (id.includes('node_modules/axios')) {
            return 'api-vendor';
          }
          
          // Charts & Visualization
          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/recharts')) {
            return 'charts-vendor';
          }
          
          // Firebase
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase-vendor';
          }
          
          // Internationalization
          if (id.includes('node_modules/react-i18next') || id.includes('node_modules/i18next')) {
            return 'i18n-vendor';
          }
          
          // Other vendor packages
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // OPTIMIZATION: Feature-based chunking for better code splitting
          if (id.includes('src/features/Admin')) {
            return 'admin-features';
          }
          if (id.includes('src/features/Coordinator')) {
            return 'coordinator-features';
          }
          if (id.includes('src/features/Learner')) {
            return 'learner-features';
          }
          if (id.includes('src/features/ProjectManager')) {
            return 'project-manager-features';
          }
          if (id.includes('src/features/auth')) {
            return 'auth-features';
          }
          if (id.includes('src/features/landing')) {
            return 'landing-features';
          }
          
          // Contexts and shared utilities
          if (id.includes('src/contexts')) {
            return 'contexts';
          }
          if (id.includes('src/api')) {
            return 'api-layer';
          }
        }
      }
    },
    
    // OPTIMIZATION: Smaller chunk size warning limit
    chunkSizeWarningLimit: 250,
    
    // OPTIMIZATION: Minification settings
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
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
    
    // OPTIMIZATION: Disable source maps in production for smaller bundle
    sourcemap: false,
    
    // OPTIMIZATION: CSS minification
    cssMinify: true,
    
    // OPTIMIZATION: Inline small assets
    assetsInlineLimit: 4096,
  },
  
  // OPTIMIZATION: Development server configuration
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow external connections
    open: false, // Don't auto-open browser
    hmr: {
      overlay: false // Disable error overlay for cleaner dev experience
    },
    cors: true
  },
  
  // OPTIMIZATION: Dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'react-hot-toast'
    ],
    exclude: [
      'lottie-react' // Exclude heavy animation libraries from pre-bundling
    ],
    force: true
  },
  
  // OPTIMIZATION: Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@features': '/src/features',
      '@contexts': '/src/contexts',
      '@api': '/src/api',
      '@utils': '/src/utils',
      '@types': '/src/types',
      '@hooks': '/src/hooks'
    }
  },
  
  // OPTIMIZATION: CSS configuration
  css: {
    devSourcemap: false, // Disable CSS source maps for better performance
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";` // Auto-import variables if using SCSS
      }
    }
  },
  
  // OPTIMIZATION: Preview server for production testing
  preview: {
    port: 4173,
    host: '0.0.0.0',
    cors: true
  },
  
  // OPTIMIZATION: Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
})