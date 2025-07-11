// // src/utils/dashboardPreloader.ts
// // OPTIMIZATION: Centralized preloading utility for better performance across all roles

// import { UserRole } from '../types/auth.types';

// /**
//  * Preloads data based on user role for faster dashboard loads
//  */
// export const preloadDataByRole = async (role: UserRole) => {
//   console.log(`Preloading data for role: ${role}`);
  
//   try {
//     switch (role) {
//       case UserRole.Admin:
//         // Preload admin dashboard data and categories
//         try {
//           const [dashboardModule] = await Promise.all([
//             import('../api/services/AdminDashboard/dashboardService')
//           ]);
//           dashboardModule.preloadDashboardData();
          
//           // Also preload categories using existing API structure
//           const { preloadCategories } = await import('../api/services/courseCategoryService');
//           preloadCategories();
//         } catch (error) {
//           console.log('Some admin preload modules not available:', error);
//         }
//         break;
        
//       case UserRole.Learner:
//         // Preload learner course categories, stats, and course data
//         const [categoryLearnerModule, statsModule, courseModule, enrollmentModule] = await Promise.all([
//           import('../api/services/courseCategoryService'),
//           import('../api/services/LearnerDashboard/learnerOverallStatsService'),
//           import('../api/services/Course/learnerCourseService'),
//           import('../api/services/Course/enrollmentService')
//         ]);
//         categoryLearnerModule.preloadCategories();
//         statsModule.preloadStats();
//         // Preload enrolled courses for faster course content loading
//         courseModule.getEnrolledCoursesForLearner().catch(() => {});
//         enrollmentModule.preloadUserEnrollments();
//         break;
        
//       case UserRole.CourseCoordinator:
//         // Preload coordinator-specific data
//         console.log('Coordinator data preloading not yet implemented');
//         // TODO: Add coordinator preloading functions when available
//         // const coordinatorModule = await import('../api/services/Coordinator/coordinatorService');
//         // coordinatorModule.preloadCoordinatorData();
//         break;
        
//       case UserRole.ProjectManager:
//         // Preload project manager-specific data
//         console.log('Project Manager data preloading not yet implemented');
//         // TODO: Add PM preloading functions when available
//         // const pmModule = await import('../api/services/ProjectManager/pmService');
//         // pmModule.preloadProjectManagerData();
//         break;
        
//       default:
//         console.log('No preloading defined for role:', role);
//     }
//   } catch (error) {
//     console.error('Error preloading data for role:', role, error);
//     // Don't throw - preloading should fail silently
//   }
// };

// /**
//  * Preloads common data used across multiple roles
//  */
// export const preloadCommonData = async () => {
//   console.log('Preloading common data...');
  
//   try {
//     // TODO: Add any common data preloading here
//     // For example: user profile, notifications, etc.
    
//     console.log('Common data preloading completed');
//   } catch (error) {
//     console.error('Error preloading common data:', error);
//     // Don't throw - preloading should fail silently
//   }
// };

// /**
//  * Preloads course content for a specific category (useful when user navigates to course content)
//  */
// export const preloadCourseContent = async (categoryId: string) => {
//   console.log(`Preloading course content for category: ${categoryId}`);
  
//   try {
//     const courseModule = await import('../api/services/Course/learnerCourseService');
//     courseModule.preloadCoursesForCategory(categoryId);
//   } catch (error) {
//     console.error('Error preloading course content:', error);
//     // Don't throw - preloading should fail silently
//   }
// };

// /**
//  * Preloads admin-specific data for category management
//  */
// export const preloadAdminCategoryData = async () => {
//   console.log('Preloading admin category data...');
  
//   try {
//     const categoryModule = await import('../api/services/courseCategoryService');
//     categoryModule.preloadCategories();
//   } catch (error) {
//     console.error('Error preloading admin category data:', error);
//     // Don't throw - preloading should fail silently
//   }
// };

// /**
//  * Clears all caches - useful for logout or role switching
//  */
// export const clearAllCaches = () => {
//   console.log('Clearing all caches...');
  
//   // Clear session storage caches
//   try {
//     sessionStorage.removeItem('course_categories');
//   } catch (error) {
//     console.error('Error clearing session storage:', error);
//   }
  
//   // Clear caches dynamically to avoid circular dependencies
//   try {
//     // Admin dashboard cache
//     import('../api/services/AdminDashboard/dashboardService').then(module => {
//       if (module.clearDashboardCache) {
//         module.clearDashboardCache();
//       }
//     }).catch(() => {
//       // Service not available
//     });
    
//     // Course categories cache (used by both learners and admins)
//     import('../api/services/courseCategoryService').then(module => {
//       if (module.clearCategoriesCache) {
//         module.clearCategoriesCache();
//       }
//     }).catch(() => {
//       // Service not available
//     });
    
//     // Learner stats cache
//     import('../api/services/LearnerDashboard/learnerOverallStatsService').then(module => {
//       if (module.clearStatsCache) {
//         module.clearStatsCache();
//       }
//     }).catch(() => {
//       // Service not available
//     });
    
//     // Course caches
//     import('../api/services/Course/learnerCourseService').then(module => {
//       if (module.clearCourseCaches) {
//         module.clearCourseCaches();
//       }
//     }).catch(() => {
//       // Service not available
//     });
    
//     // Enrollment caches
//     import('../api/services/Course/enrollmentService').then(module => {
//       if (module.clearEnrollmentCaches) {
//         module.clearEnrollmentCaches();
//       }
//     }).catch(() => {
//       // Service not available
//     });
    
//     console.log('All caches cleared');
//   } catch (error) {
//     console.error('Error clearing caches:', error);
//   }
// };

// /**
//  * Advanced preloading for specific scenarios
//  */
// export const preloadScenarioData = async (scenario: 'course-browsing' | 'learning-dashboard' | 'profile-management' | 'admin-management') => {
//   console.log(`Preloading data for scenario: ${scenario}`);
  
//   try {
//     switch (scenario) {
//       case 'course-browsing':
//         // Preload data needed for course browsing
//         const [categoryModule, statsModule] = await Promise.all([
//           import('../api/services/courseCategoryService'),
//           import('../api/services/LearnerDashboard/learnerOverallStatsService')
//         ]);
//         categoryModule.preloadCategories();
//         statsModule.preloadStats();
//         break;
        
//       case 'learning-dashboard':
//         // Preload data needed for learning dashboard
//         const [courseModule, enrollmentModule] = await Promise.all([
//           import('../api/services/Course/learnerCourseService'),
//           import('../api/services/Course/enrollmentService')
//         ]);
//         courseModule.getEnrolledCoursesForLearner().catch(() => {});
//         enrollmentModule.preloadUserEnrollments();
//         break;
        
//       case 'profile-management':
//         // Preload data needed for profile management
//         console.log('Profile management preloading not yet implemented');
//         // TODO: Add profile-related preloading when available
//         break;
        
//       case 'admin-management':
//         // Preload data needed for admin management
//         try {
//           const [adminDashboardModule, categoryModule] = await Promise.all([
//             import('../api/services/AdminDashboard/dashboardService'),
//             import('../api/services/courseCategoryService')
//           ]);
//           adminDashboardModule.preloadDashboardData();
//           categoryModule.preloadCategories();
//         } catch (error) {
//           console.log('Some admin management modules not available:', error);
//         }
//         break;
        
//       default:
//         console.log('No preloading defined for scenario:', scenario);
//     }
//   } catch (error) {
//     console.error('Error preloading scenario data:', error);
//     // Don't throw - preloading should fail silently
//   }
// };

// /**
//  * Preloads data for a specific route to improve navigation performance
//  */
// export const preloadRouteData = async (route: string, params?: { [key: string]: string }) => {
//   console.log(`Preloading data for route: ${route}`, params);
  
//   try {
//     // Parse route and preload relevant data
//     if (route.includes('/learner/courses/') && params?.categoryId) {
//       // Preload course content for specific category
//       await preloadCourseContent(params.categoryId);
//     } else if (route.includes('/learner/course-categories')) {
//       // Preload categories and stats
//       await preloadScenarioData('course-browsing');
//     } else if (route.includes('/learner/dashboard')) {
//       // Preload learning dashboard data
//       await preloadScenarioData('learning-dashboard');
//     } else if (route.includes('/admin/dashboard')) {
//       // Preload admin dashboard
//       const { preloadDashboardData } = await import('../api/services/AdminDashboard/dashboardService');
//       preloadDashboardData();
//     } else if (route.includes('/admin/course-categories')) {
//       // Preload admin categories
//       const { preloadCategories } = await import('../api/services/courseCategoryService');
//       preloadCategories();
//     } else if (route.includes('/admin/categories/')) {
//       // Preload specific category courses (when viewing category courses)
//       await preloadAdminCategoryData();
//     }
//     // Add more route-specific preloading as needed
    
//   } catch (error) {
//     console.error('Error preloading route data:', error);
//     // Don't throw - preloading should fail silently
//   }
// };

// /**
//  * Preloads data for role transitions (when user switches roles)
//  */
// export const preloadRoleTransition = async (fromRole: UserRole, toRole: UserRole) => {
//   console.log(`Preloading for role transition: ${fromRole} -> ${toRole}`);
  
//   try {
//     // Clear old role data first
//     clearAllCaches();
    
//     // Small delay to ensure cleanup completes
//     await new Promise(resolve => setTimeout(resolve, 100));
    
//     // Preload new role data
//     await preloadDataByRole(toRole);
    
//     console.log(`Role transition preload completed: ${fromRole} -> ${toRole}`);
//   } catch (error) {
//     console.error('Error during role transition preload:', error);
//     // Don't throw - preloading should fail silently
//   }
// };

// /**
//  * Cache status utilities for debugging and monitoring
//  */
// export const getCacheStatus = async () => {
//   const status: { [key: string]: any } = {};
  
//   try {
//     // Check session storage
//     status.sessionStorage = {
//       courseCategories: !!sessionStorage.getItem('course_categories')
//     };
    
//     // Check if cache clearing functions are available
//     const modules = await Promise.allSettled([
//       import('../api/services/AdminDashboard/dashboardService'),
//       import('../api/services/courseCategoryService'),
//       import('../api/services/LearnerDashboard/learnerOverallStatsService'),
//       import('../api/services/Course/learnerCourseService'),
//       import('../api/services/Course/enrollmentService')
//     ]);
    
//     status.availableModules = {
//       dashboardService: modules[0].status === 'fulfilled',
//       courseCategoryService: modules[1].status === 'fulfilled',
//       learnerStatsService: modules[2].status === 'fulfilled',
//       learnerCourseService: modules[3].status === 'fulfilled',
//       enrollmentService: modules[4].status === 'fulfilled'
//     };
    
//     // Get specific cache statuses if available
//     if (modules[1].status === 'fulfilled') {
//       const categoryModule = modules[1].value as any;
//       if (categoryModule.getCacheStatus) {
//         status.categoriesCache = categoryModule.getCacheStatus();
//       }
//     }
    
//   } catch (error) {
//     console.error('Error getting cache status:', error);
//     status.error = error.message;
//   }
  
//   return status;
// };

// /**
//  * Performance monitoring utility for development
//  */
// export const monitorPreloadPerformance = () => {
//   if (!import.meta.env.DEV) return;
  
//   console.log('Starting preload performance monitoring...');
  
//   const startTime = performance.now();
//   let operationCount = 0;
  
//   // Monitor cache operations
//   const originalSessionStorageSetItem = sessionStorage.setItem;
//   sessionStorage.setItem = function(key: string, value: string) {
//     console.log(`Cache SET: ${key} (${(value.length / 1024).toFixed(2)}KB)`);
//     operationCount++;
//     return originalSessionStorageSetItem.call(this, key, value);
//   };
  
//   const originalSessionStorageGetItem = sessionStorage.getItem;
//   sessionStorage.getItem = function(key: string) {
//     const result = originalSessionStorageGetItem.call(this, key);
//     if (result) {
//       console.log(`Cache HIT: ${key} (${(result.length / 1024).toFixed(2)}KB)`);
//     } else {
//       console.log(`Cache MISS: ${key}`);
//     }
//     operationCount++;
//     return result;
//   };
  
//   // Report performance after 5 seconds
//   setTimeout(() => {
//     const endTime = performance.now();
//     console.log(`Preload Performance Report:
//       - Total time: ${(endTime - startTime).toFixed(2)}ms
//       - Cache operations: ${operationCount}
//       - Average operation time: ${((endTime - startTime) / operationCount).toFixed(2)}ms
//     `);
//   }, 5000);
// };

// /**
//  * Cleanup function to be called on app unmount or user logout
//  */
// export const cleanupPreloader = () => {
//   console.log('Cleaning up preloader...');
  
//   // Clear all caches
//   clearAllCaches();
  
//   // Restore original sessionStorage methods if monitoring was enabled
//   if (import.meta.env.DEV) {
//     try {
//       // Reset to original methods (this is a simple approach)
//       delete (sessionStorage as any).setItem;
//       delete (sessionStorage as any).getItem;
//     } catch (error) {
//       console.log('Could not restore original sessionStorage methods');
//     }
//   }
  
//   console.log('Preloader cleanup completed');
// };

// /**
//  * Utility to check if preloading is needed for a specific data type
//  */
// export const shouldPreload = (dataType: string, cacheKey?: string): boolean => {
//   try {
//     if (cacheKey) {
//       const cachedData = sessionStorage.getItem(cacheKey);
//       if (cachedData) {
//         const { timestamp } = JSON.parse(cachedData);
//         const age = Date.now() - timestamp;
//         // Consider data stale after 5 minutes
//         return age > 5 * 60 * 1000;
//       }
//     }
//     return true;
//   } catch (error) {
//     console.error('Error checking preload status:', error);
//     return true; // Default to preload if check fails
//   }
// };

// /**
//  * Batch preload multiple data types for efficiency
//  */
// export const batchPreload = async (requests: Array<() => Promise<any>>) => {
//   console.log(`Starting batch preload of ${requests.length} requests...`);
  
//   try {
//     const startTime = performance.now();
    
//     // Execute all requests in parallel
//     const results = await Promise.allSettled(requests.map(request => request()));
    
//     const endTime = performance.now();
//     const successCount = results.filter(r => r.status === 'fulfilled').length;
//     const failureCount = results.filter(r => r.status === 'rejected').length;
    
//     console.log(`Batch preload completed:
//       - Total time: ${(endTime - startTime).toFixed(2)}ms
//       - Successful: ${successCount}
//       - Failed: ${failureCount}
//     `);
    
//     return results;
//   } catch (error) {
//     console.error('Error in batch preload:', error);
//     throw error;
//   }
// };

// // Note: For React hooks, use the PreloadManager component in App.tsx instead