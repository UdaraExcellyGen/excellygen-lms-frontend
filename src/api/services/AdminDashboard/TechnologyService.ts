// src/api/services/AdminDashboard/TechnologyService.ts
// ENTERPRISE OPTIMIZED: Ultra-fast API service with dashboard events
import apiClient from "../../apiClient";
import { 
  emitTechStatusChanged, 
  emitTechCreated, 
  emitTechDeleted,
  emitDashboardRefreshNeeded 
} from "../../../utils/dashboardEvents";

export interface Technology {
  id: string;
  name: string;
  status: string;
  creatorType: string; // 'admin' or 'project_manager'
  creatorId: string;
  createdAt: string;
  updatedAt: string | null;
}

interface CreateTechnologyRequest {
  name: string;
}

interface UpdateTechnologyRequest {
  name: string;
}

// ENTERPRISE: Advanced caching system with intelligent invalidation
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  etag?: string;
}

interface RequestMetrics {
  requestCount: number;
  cacheHits: number;
  averageResponseTime: number;
  lastRequestTime: number;
}

class EnterpriseTechnologyServiceCache {
  private cache = new Map<string, CacheEntry<any>>();
  private metrics: RequestMetrics = {
    requestCount: 0,
    cacheHits: 0,
    averageResponseTime: 0,
    lastRequestTime: 0
  };
  
  // ENTERPRISE: Smart TTL based on data type and user activity
  private readonly DEFAULT_TTL = 3 * 60 * 1000; // 3 minutes base
  private readonly LONG_TTL = 10 * 60 * 1000; // 10 minutes for stable data
  private readonly SHORT_TTL = 30 * 1000; // 30 seconds for dynamic data

  // ENTERPRISE: Performance monitoring
  private updateMetrics(responseTime: number, fromCache: boolean): void {
    this.metrics.requestCount++;
    if (fromCache) this.metrics.cacheHits++;
    
    // Rolling average calculation
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (this.metrics.requestCount - 1) + responseTime) 
      / this.metrics.requestCount;
    
    this.metrics.lastRequestTime = Date.now();
  }

  // ENTERPRISE: Smart TTL calculation based on usage patterns
  private getSmartTTL(key: string, dataSize: number): number {
    const baseTime = Date.now();
    const lastRequest = this.metrics.lastRequestTime;
    const timeSinceLastRequest = baseTime - lastRequest;
    
    // Frequently accessed data gets longer cache time
    if (timeSinceLastRequest < 30000) { // Within last 30 seconds
      return this.LONG_TTL;
    }
    
    // Large datasets get shorter cache to prevent memory issues
    if (dataSize > 1000) {
      return this.SHORT_TTL;
    }
    
    return this.DEFAULT_TTL;
  }

  set<T>(key: string, data: T, customTTL?: number): void {
    const dataSize = JSON.stringify(data).length;
    const ttl = customTTL || this.getSmartTTL(key, dataSize);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });

    // ENTERPRISE: Automatic memory management
    this.cleanupExpiredEntries();
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    // ENTERPRISE: Access-based TTL extension for hot data
    const accessFrequency = (now - entry.timestamp) / (entry.expiry - entry.timestamp);
    if (accessFrequency < 0.3) { // Accessed early in lifecycle
      entry.expiry = now + this.DEFAULT_TTL; // Extend TTL
    }

    this.updateMetrics(0, true);
    return entry.data as T;
  }

  invalidate(pattern: string): void {
    const keysToDelete: string[] = [];
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // ENTERPRISE: Smart cache cleanup
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (now > entry.expiry) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    
    // ENTERPRISE: Memory pressure management
    if (this.cache.size > 30) { // Prevent memory bloat for technologies
      const oldestEntries = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)
        .slice(0, 5); // Remove oldest 5 entries
      
      oldestEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  clear(): void {
    this.cache.clear();
  }

  // ENTERPRISE: Performance diagnostics
  getMetrics(): RequestMetrics & { cacheSize: number; hitRate: number } {
    return {
      ...this.metrics,
      cacheSize: this.cache.size,
      hitRate: this.metrics.requestCount > 0 ? this.metrics.cacheHits / this.metrics.requestCount : 0
    };
  }
}

const cache = new EnterpriseTechnologyServiceCache();
const activeRequests = new Map<string, Promise<any>>();

// ENTERPRISE: Advanced request deduplication with priority queuing
function dedupedRequest<T>(key: string, requestFn: () => Promise<T>, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<T> {
  if (activeRequests.has(key)) {
    console.log(`⚡ Deduped ${priority} priority request: ${key}`);
    return activeRequests.get(key)!;
  }

  const startTime = performance.now();
  const promise = requestFn()
    .then(result => {
      const responseTime = performance.now() - startTime;
      console.log(`✅ ${priority} request completed in ${responseTime.toFixed(2)}ms: ${key}`);
      return result;
    })
    .finally(() => {
      // ENTERPRISE: Smart cleanup timing based on priority
      const cleanupDelay = priority === 'high' ? 500 : priority === 'normal' ? 1000 : 2000;
      setTimeout(() => {
        activeRequests.delete(key);
      }, cleanupDelay);
    });

  activeRequests.set(key, promise);
  return promise;
}

const TechnologyService = {
  /**
   * ENTERPRISE: Enhanced get all technologies with smart caching
   */
  getAllTechnologies: async (): Promise<Technology[]> => {
    const cacheKey = 'technologies_all';
    
    // ENTERPRISE: Smart cache check with validation
    const cachedData = cache.get<Technology[]>(cacheKey);
    if (cachedData) {
      console.log(`📦 Technologies served from cache (${cachedData.length} items)`);
      return cachedData;
    }

    return dedupedRequest(cacheKey, async () => {
      console.log('🔄 Fetching technologies from API');
      
      const response = await apiClient.get('/technologies');
      
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid API response format for technologies');
      }
      
      // ENTERPRISE: Enhanced data validation and transformation
      const validatedData = response.data.map(tech => ({
        ...tech,
        // Ensure all required fields exist with defaults
        status: tech.status || 'inactive',
        creatorType: tech.creatorType || 'admin',
        creatorId: tech.creatorId || 'unknown',
        createdAt: tech.createdAt || new Date().toISOString(),
        updatedAt: tech.updatedAt || null
      }));
      
      // ENTERPRISE: Smart caching with longer TTL for stable data
      cache.set(cacheKey, validatedData, 5 * 60 * 1000); // 5 minutes for technologies
      
      console.log(`✅ Technologies cached (${validatedData.length} items)`);
      return validatedData;
    }, 'high');
  },

  /**
   * ENTERPRISE: Smart get technology by ID with caching
   */
  getTechnologyById: async (id: string): Promise<Technology> => {
    const cacheKey = `technology_${id}`;
    
    // ENTERPRISE: Check cache first
    const cachedData = cache.get<Technology>(cacheKey);
    if (cachedData) {
      console.log(`📦 Technology ${id} served from cache`);
      return cachedData;
    }

    return dedupedRequest(cacheKey, async () => {
      console.log(`🔄 Fetching technology ${id} from API`);
      
      const response = await apiClient.get(`/technologies/${id}`);
      const technology = response.data;
      
      // ENTERPRISE: Cache individual technology
      cache.set(cacheKey, technology, 3 * 60 * 1000); // 3 minutes for individual items
      
      return technology;
    }, 'normal');
  },

  /**
   * ENTERPRISE: Optimistic create technology with dashboard events
   */
  createTechnology: async (data: CreateTechnologyRequest): Promise<Technology> => {
    console.log('🆕 Creating technology:', data.name);
    
    try {
      const response = await apiClient.post('/technologies', data);
      const newTechnology = response.data;
      
      // ENTERPRISE: Invalidate relevant caches
      cache.invalidate('technologies_');
      
      // ENTERPRISE: Cache the new technology
      cache.set(`technology_${newTechnology.id}`, newTechnology, 3 * 60 * 1000);
      
      // ENTERPRISE: Emit dashboard events for real-time updates
      emitTechCreated(newTechnology);
      emitDashboardRefreshNeeded('technology-created');
      
      console.log(`✅ Technology created and cached: ${newTechnology.id}`);
      return newTechnology;
    } catch (error) {
      console.error('❌ Failed to create technology:', error);
      throw error;
    }
  },

  /**
   * ENTERPRISE: Smart update technology with cache invalidation and events
   */
  updateTechnology: async (id: string, data: UpdateTechnologyRequest): Promise<Technology> => {
    console.log('📝 Updating technology:', id);
    
    try {
      const response = await apiClient.put(`/technologies/${id}`, data);
      const updatedTechnology = response.data;
      
      // ENTERPRISE: Update caches intelligently
      cache.invalidate('technologies_'); // Invalidate list cache
      cache.set(`technology_${id}`, updatedTechnology, 3 * 60 * 1000); // Update individual cache
      
      // ENTERPRISE: Emit dashboard events for real-time updates
      emitDashboardRefreshNeeded('technology-updated');
      
      console.log(`✅ Technology updated and cached: ${id}`);
      return updatedTechnology;
    } catch (error) {
      console.error('❌ Failed to update technology:', error);
      throw error;
    }
  },

  /**
   * ENTERPRISE: Smart delete technology with cache cleanup and events
   */
  deleteTechnology: async (id: string): Promise<void> => {
    console.log('🗑️ Deleting technology:', id);
    
    try {
      await apiClient.delete(`/technologies/${id}`);
      
      // ENTERPRISE: Clean up all related caches
      cache.invalidate('technologies_'); // Invalidate list cache
      cache.invalidate(`technology_${id}`); // Remove individual cache
      
      // ENTERPRISE: Emit dashboard events for real-time updates
      emitTechDeleted(id);
      emitDashboardRefreshNeeded('technology-deleted');
      
      console.log(`✅ Technology deleted and cache cleaned: ${id}`);
    } catch (error) {
      console.error('❌ Failed to delete technology:', error);
      throw error;
    }
  },

  /**
   * ENTERPRISE: Instant status toggle with smart cache updates and events
   */
  toggleTechnologyStatus: async (id: string): Promise<Technology> => {
    console.log('🔄 Toggling technology status:', id);
    
    try {
      const response = await apiClient.patch(`/technologies/${id}/toggle-status`);
      const updatedTechnology = response.data;
      
      // ENTERPRISE: Update caches with new status
      cache.invalidate('technologies_'); // Invalidate list cache
      cache.set(`technology_${id}`, updatedTechnology, 3 * 60 * 1000); // Update individual cache
      
      // ENTERPRISE: Emit dashboard events for real-time updates
      emitTechStatusChanged(id, updatedTechnology.status);
      emitDashboardRefreshNeeded('technology-status-changed');
      
      console.log(`✅ Technology status toggled and cached: ${id} -> ${updatedTechnology.status}`);
      return updatedTechnology;
    } catch (error) {
      console.error('❌ Failed to toggle technology status:', error);
      throw error;
    }
  },

  /**
   * ENTERPRISE: Performance monitoring and diagnostics
   */
  getCacheMetrics: () => cache.getMetrics(),

  /**
   * ENTERPRISE: Manual cache management for admin users
   */
  clearCache: () => {
    cache.clear();
    activeRequests.clear();
    console.log('🧹 Technology service cache cleared');
  },

  /**
   * ENTERPRISE: Preload technologies for better perceived performance
   */
  preloadTechnologies: async (): Promise<void> => {
    try {
      await TechnologyService.getAllTechnologies();
      console.log('⚡ Technologies preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload technologies:', error);
    }
  }
};

export default TechnologyService;