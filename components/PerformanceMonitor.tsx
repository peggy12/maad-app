/**
 * Performance Monitoring Dashboard Component
 * Displays real-time performance metrics and cache statistics
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Database, Clock, TrendingUp, Activity } from 'lucide-react';
import { 
  performanceTracker, 
  memoryMonitor, 
  apiCache, 
  base44Cache 
} from '../utils/performance.js';
import { AnimatedCounter } from './ModernComponents.js';

interface PerformanceMetrics {
  base44Average: number | null;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: { used: number; total: number } | null;
  allMetrics: Record<string, { average: number; count: number; latest: number }>;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    base44Average: null,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: null,
    allMetrics: {}
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const base44Average = performanceTracker.getAverageTime('base44_invoke_MAAD');
      const memoryUsage = memoryMonitor.measure();
      const allMetrics = performanceTracker.getAllMetrics();
      
      // Calculate cache hit/miss ratio (simplified)
      const apiStats = apiCache.getStats();
      const base44Stats = base44Cache.getStats();
      
      setMetrics({
        base44Average,
        cacheHits: apiStats.size + base44Stats.size,
        cacheMisses: Math.max(0, (allMetrics['base44_invoke_MAAD']?.count || 0) - base44Stats.size),
        memoryUsage,
        allMetrics
      });
    };

    // Update metrics every 2 seconds
    const interval = setInterval(updateMetrics, 2000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  // Only show in development or when explicitly enabled
  if (!isVisible && import.meta.env.PROD) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-mono opacity-50 hover:opacity-100 transition-opacity z-50"
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-green-600" size={16} />
          <h3 className="font-semibold text-sm">Performance Monitor</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Response Times */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock size={14} className="text-blue-600" />
              <span className="text-xs text-gray-600">Base44 Avg</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {metrics.base44Average !== null 
                ? `${metrics.base44Average.toFixed(0)}ms` 
                : '—'}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Database size={14} className="text-green-600" />
              <span className="text-xs text-gray-600">Cache Hits</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {metrics.cacheHits}
            </div>
          </div>
        </div>

        {/* Memory Usage */}
        {metrics.memoryUsage && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 size={14} className="text-purple-600" />
              <span className="text-xs font-medium text-gray-700">Memory Usage</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Used: {(metrics.memoryUsage.used / 1024 / 1024).toFixed(1)}MB</span>
                <span>Total: {(metrics.memoryUsage.total / 1024 / 1024).toFixed(1)}MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(metrics.memoryUsage.used / metrics.memoryUsage.total) * 100}%` 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {Object.keys(metrics.allMetrics).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <TrendingUp size={12} />
              All Metrics
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto text-xs">
              {Object.entries(metrics.allMetrics).map(([key, metric]) => (
                <div key={key} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 truncate flex-1" title={key}>
                    {key.replace('base44_invoke_', '').replace('_', ' ')}
                  </span>
                  <div className="flex gap-2 text-right">
                    <span className="text-blue-600 font-mono">
                      {metric.average.toFixed(0)}ms
                    </span>
                    <span className="text-gray-400 font-mono w-8">
                      ×{metric.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cache Statistics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-blue-50 rounded p-2 text-center">
            <div className="font-semibold text-blue-700">API Cache</div>
            <div className="text-blue-600">{apiCache.getStats().size} entries</div>
          </div>
          <div className="bg-green-50 rounded p-2 text-center">
            <div className="font-semibold text-green-700">Base44 Cache</div>
            <div className="text-green-600">{base44Cache.getStats().size} entries</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              apiCache.clear();
              base44Cache.clear();
              performanceTracker.clear();
            }}
            className="flex-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium hover:bg-red-100 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={() => {
              console.log('Performance Metrics:', metrics);
              console.log('Cache Stats:', { 
                api: apiCache.getStats(), 
                base44: base44Cache.getStats() 
              });
            }}
            className="flex-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
          >
            Log Data
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Mini performance badge for production
export function PerformanceBadge() {
  const [responseTime, setResponseTime] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const avgTime = performanceTracker.getAverageTime('base44_invoke_MAAD');
      setResponseTime(avgTime);
    };

    const interval = setInterval(updateTime, 5000);
    updateTime();

    return () => clearInterval(interval);
  }, []);

  if (responseTime === null || responseTime > 5000) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed top-4 right-4 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-40"
    >
      <Zap size={12} />
      {responseTime.toFixed(0)}ms
    </motion.div>
  );
}

export default { PerformanceMonitor, PerformanceBadge };