/**
 * Performance Optimization Utilities for MAAD App
 * Implements caching, memoization, and performance monitoring
 */

// Cache implementation for API responses
class PerformanceCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private maxSize = 100; // Maximum cache entries
  
  set(key: string, data: any, ttlMinutes = 5): void {
    // Clean up expired entries
    this.cleanup();
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000 // Convert to milliseconds
    });
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Global cache instances
export const apiCache = new PerformanceCache();
export const base44Cache = new PerformanceCache();

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memory usage monitoring
export class MemoryMonitor {
  private measurements: Array<{ timestamp: number; used: number; total: number }> = [];
  
  measure(): { used: number; total: number } | null {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      const measurement = {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize
      };
      
      this.measurements.push({
        timestamp: Date.now(),
        ...measurement
      });
      
      // Keep only last 100 measurements
      if (this.measurements.length > 100) {
        this.measurements = this.measurements.slice(-100);
      }
      
      return measurement;
    }
    return null;
  }
  
  getAverage(minutes = 5): { used: number; total: number } | null {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recent = this.measurements.filter(m => m.timestamp > cutoff);
    
    if (recent.length === 0) return null;
    
    const avgUsed = recent.reduce((sum, m) => sum + m.used, 0) / recent.length;
    const avgTotal = recent.reduce((sum, m) => sum + m.total, 0) / recent.length;
    
    return { used: avgUsed, total: avgTotal };
  }
  
  clearOld(hours = 1): void {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    this.measurements = this.measurements.filter(m => m.timestamp > cutoff);
  }
}

export const memoryMonitor = new MemoryMonitor();

// Performance metrics tracking
export class PerformanceTracker {
  private metrics = new Map<string, Array<{ duration: number; timestamp: number }>>();
  
  startTimer(key: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(key, duration);
      return duration;
    };
  }
  
  private recordMetric(key: string, duration: number): void {
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const measurements = this.metrics.get(key)!;
    measurements.push({ duration, timestamp: Date.now() });
    
    // Keep only last 50 measurements per key
    if (measurements.length > 50) {
      measurements.splice(0, measurements.length - 50);
    }
  }
  
  getAverageTime(key: string, minutes = 5): number | null {
    const measurements = this.metrics.get(key);
    if (!measurements || measurements.length === 0) return null;
    
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recent = measurements.filter(m => m.timestamp > cutoff);
    
    if (recent.length === 0) return null;
    
    return recent.reduce((sum, m) => sum + m.duration, 0) / recent.length;
  }
  
  getAllMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [key, measurements] of this.metrics.entries()) {
      if (measurements.length > 0) {
        const durations = measurements.map(m => m.duration);
        const average = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const latest = durations[durations.length - 1];
        
        result[key] = {
          average: Math.round(average * 100) / 100,
          count: measurements.length,
          latest: Math.round((latest || 0) * 100) / 100
        };
      }
    }
    
    return result;
  }
  
  clear(): void {
    this.metrics.clear();
  }
}

export const performanceTracker = new PerformanceTracker();

// Image lazy loading utility
export function createImageObserver(callback: (entry: IntersectionObserverEntry) => void) {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: '50px 0px',
      threshold: 0.01
    }
  );
}

// Bundle size optimization helper
export function preloadRoute(routeComponent: () => Promise<any>) {
  // Preload component on hover or focus for better UX
  return {
    onMouseEnter: () => routeComponent(),
    onFocus: () => routeComponent(),
  };
}

// Resource cleanup utility
export class ResourceManager {
  private resources = new Set<() => void>();
  
  add(cleanup: () => void): void {
    this.resources.add(cleanup);
  }
  
  cleanup(): void {
    this.resources.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Error during resource cleanup:', error);
      }
    });
    this.resources.clear();
  }
}

// Web Workers utility for heavy computations
export function createWorker(workerFunction: () => void): Worker | null {
  if (typeof Worker === 'undefined') return null;
  
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript'
  });
  
  return new Worker(URL.createObjectURL(blob));
}

export default {
  apiCache,
  base44Cache,
  debounce,
  throttle,
  memoryMonitor,
  performanceTracker,
  createImageObserver,
  preloadRoute,
  ResourceManager,
  createWorker
};