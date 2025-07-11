// Path: vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // 🚀 PERFORMANCE OPTIMIZATION
  build: {
    // Target modern browsers for smaller bundles
    target: 'esnext',
    
    // Optimize chunks
    rollupOptions: {
      output: {
        // 📦 Split code into logical chunks
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom'],
          
          // Router
          'router': ['react-router-dom'],
          
          // UI Libraries  
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          
          // Large libraries
          'lottie': ['lottie-react'],
          
          // Admin features
          'admin': [
            './src/features/Admin/AdminDashboard/AdminDashboard.tsx',
            './src/features/Admin/AdminAnalytics/Adminanalytics.tsx',
            './src/features/Admin/ManageUser/ManageUser.tsx',
            './src/features/Admin/ManageTech/ManageTech.tsx'
          ],
          
          // Coordinator features
          'coordinator': [
            './src/features/Coordinator/CoordinatorDashboard/CourseCoordinatorDashboard.tsx',
            './src/features/Coordinator/CoursesDisplayPage/CoursesDisplayPage.tsx',
            './src/features/Coordinator/CreateNewCourse/BasicCourseDetails/BasicCourseDetails.tsx'
          ],
          
          // Project Manager features
          'project-manager': [
            './src/features/ProjectManager/ProjectManagerDashboard/ProjectManagerDashboard.tsx',
            './src/features/ProjectManager/Employee-assign/Employee-assign.tsx'
          ],
          
          // Learner features - split into smaller chunks
          'learner-dashboard': [
            './src/features/Learner/LearnerDashboard/LearnerDashboard.tsx',
            './src/features/Learner/LearnerProfile/LearnerProfile.tsx'
          ],
          
          'learner-courses': [
            './src/features/Learner/CourseCategories/CourseCategories.tsx',
            './src/features/Learner/CourseContent/CourseContent.tsx',
            './src/features/Learner/CourseContent/LearnerCourseOverview.tsx'
          ],
          
          'learner-other': [
            './src/features/Learner/BadgesAndRewards/BadgesAndRewards.tsx',
            './src/features/Learner/Certificates/CertificatePage.tsx',
            './src/features/Learner/LearnerProjects/LearnerProjects.tsx',
            './src/features/Learner/LearnerNotifications/LearnerNotification.tsx'
          ]
        }
      }
    },
    
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true
      }
    }
  },
  
  // 🔄 Development optimizations
  server: {
    port: 5173,
    open: true
  },
  
  // 📁 Path resolution
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})