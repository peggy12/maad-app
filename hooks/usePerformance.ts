/**
 * React Performance Hooks for MAAD App
 * Custom hooks for performance optimization and memory management
 */

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { debounce, throttle, ResourceManager } from '../utils/performance.js';

// Hook for managing component lifecycle and cleanup
export function useResourceCleanup() {
  const resourceManager = useRef(new ResourceManager());

  const addCleanup = useCallback((cleanup: () => void) => {
    resourceManager.current.add(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      resourceManager.current.cleanup();
    };
  }, []);

  return addCleanup;
}

// Hook for debounced values (performance optimization for search, etc.)
export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const addCleanup = useResourceCleanup();

  useEffect(() => {
    const handler = debounce((val: T) => setDebouncedValue(val), delay);
    handler(value);

    addCleanup(() => {
      // Cleanup debounce timeout
    });
  }, [value, delay, addCleanup]);

  return debouncedValue;
}

// Hook for throttled callbacks
export function useThrottled<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useMemo(() => throttle(callback, delay), [callback, delay]);
}

// Hook for intersection observer (lazy loading)
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const addCleanup = useResourceCleanup();

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsIntersecting(entry.isIntersecting);
      }
    }, options);

    observer.observe(ref.current);

    addCleanup(() => {
      observer.disconnect();
    });
  }, [ref, options, addCleanup]);

  return isIntersecting;
}

// Hook for optimized re-renders
export function useShallowMemo<T extends object>(value: T): T {
  const ref = useRef<T>(value);
  
  const hasChanged = useMemo(() => {
    const keys = Object.keys(value) as Array<keyof T>;
    return keys.some(key => value[key] !== ref.current[key]);
  }, [value]);

  if (hasChanged) {
    ref.current = value;
  }

  return ref.current;
}

// Hook for measuring performance
export function usePerformanceTimer(name: string) {
  const timerRef = useRef<(() => number) | null>(null);

  const start = useCallback(() => {
    const startTime = performance.now();
    timerRef.current = () => {
      const duration = performance.now() - startTime;
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms - usePerformance.ts:102`);
      return duration;
    };
  }, [name]);

  const end = useCallback(() => {
    if (timerRef.current) {
      const duration = timerRef.current();
      timerRef.current = null;
      return duration;
    }
    return 0;
  }, []);

  return { start, end };
}

// Hook for optimized API calls with caching
export function useOptimizedApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[],
  cacheKey?: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const addCleanup = useResourceCleanup();

  const memoizedApiCall = useCallback(apiCall, dependencies);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await memoizedApiCall();
        
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    addCleanup(() => {
      cancelled = true;
    });
  }, [memoizedApiCall, addCleanup]);

  return { data, loading, error };
}

// Hook for optimized list rendering
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index
    }));
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    setScrollTop,
    offsetY: visibleRange.start * itemHeight
  };
}

// Hook for image lazy loading
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  const addCleanup = useResourceCleanup();

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          const img = new Image();
          img.onload = () => {
            setImageSrc(src);
            setLoading(false);
          };
          img.src = src;
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    addCleanup(() => {
      observer.disconnect();
    });
  }, [src, addCleanup]);

  return { imageSrc, loading, imgRef };
}

export default {
  useResourceCleanup,
  useDebounced,
  useThrottled,
  useIntersectionObserver,
  useShallowMemo,
  usePerformanceTimer,
  useOptimizedApi,
  useVirtualList,
  useLazyImage
};