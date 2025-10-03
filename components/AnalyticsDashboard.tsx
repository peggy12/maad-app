import React, { useState, useEffect } from 'react';
import { analyticsService, TokenManager } from '../services/analyticsService.js';
import type { JobAnalytics, PerformanceMetrics, SystemHealth } from '../services/analyticsService.js';

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<JobAnalytics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    end: new Date()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState({
    hasToken: false,
    isExpiring: false,
    daysLeft: 0
  });

  useEffect(() => {
    loadData();
    checkTokenStatus();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const jobAnalytics = analyticsService.getJobAnalytics(dateRange);
      const performanceMetrics = analyticsService.getPerformanceMetrics(dateRange);
      const health = await analyticsService.trackSystemHealth();
      
      setAnalytics(jobAnalytics);
      setPerformance(performanceMetrics);
      setSystemHealth(health);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenStatus = () => {
    const token = TokenManager.getFacebookToken();
    const isExpiring = TokenManager.isTokenExpiringSoon(7);
    
    let daysLeft = 0;
    const expiry = localStorage.getItem('token_expiry');
    if (expiry) {
      const expiryTime = parseInt(expiry);
      daysLeft = Math.ceil((expiryTime - Date.now()) / (24 * 60 * 60 * 1000));
    }
    
    setTokenStatus({
      hasToken: !!token,
      isExpiring,
      daysLeft: Math.max(0, daysLeft)
    });
  };

  const exportData = () => {
    const data = analyticsService.exportData('json');
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `maad-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading analytics...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>MAAD Analytics Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            value={dateRange.start.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
            style={{ padding: '5px' }}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end.toISOString().split('T')[0]}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
            style={{ padding: '5px' }}
          />
          <button
            onClick={exportData}
            style={{ padding: '8px 15px', backgroundColor: '#007cba', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Token Status Warning */}
      {!tokenStatus.hasToken && (
        <div style={{ padding: '15px', backgroundColor: '#ffe6e6', border: '1px solid #ff9999', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>⚠️ No Facebook Token:</strong> Facebook integration is not active. Job search functionality may be limited.
        </div>
      )}
      
      {tokenStatus.isExpiring && tokenStatus.hasToken && (
        <div style={{ padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffd700', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>🕒 Token Expiring:</strong> Facebook access token expires in {tokenStatus.daysLeft} days. Please renew to maintain functionality.
        </div>
      )}

      {/* System Health Overview */}
      {systemHealth && (
        <div style={{ marginBottom: '30px' }}>
          <h2>System Health</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: systemHealth.errorRate < 0.05 ? '#28a745' : systemHealth.errorRate < 0.1 ? '#ffc107' : '#dc3545' }}>
                {(systemHealth.errorRate * 100).toFixed(1)}%
              </div>
              <div>Error Rate</div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#007cba' }}>
                {Math.round(systemHealth.averageResponseTime)}ms
              </div>
              <div>Avg Response Time</div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#17a2b8' }}>
                {systemHealth.activeUsers}
              </div>
              <div>Active Users</div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#6f42c1' }}>
                {Math.round(systemHealth.uptime / 3600)}h
              </div>
              <div>Uptime (hours)</div>
            </div>
          </div>
          
          <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
            <span>API Status:</span>
            {Object.entries(systemHealth.apiStatus).map(([api, status]) => (
              <span key={api} style={{ 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                backgroundColor: status === 'healthy' ? '#d4edda' : status === 'degraded' ? '#fff3cd' : '#f8d7da',
                color: status === 'healthy' ? '#155724' : status === 'degraded' ? '#856404' : '#721c24'
              }}>
                {api}: {status}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job Analytics */}
      {analytics && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Job Search Analytics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            {/* Key Metrics */}
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>{analytics.totalSearches}</div>
                  <div>Total Searches</div>
                </div>
                
                <div style={{ padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#388e3c' }}>{analytics.totalJobsFound}</div>
                  <div>Jobs Found</div>
                </div>
                
                <div style={{ padding: '20px', backgroundColor: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f57c00' }}>{analytics.averageConfidence.toFixed(2)}</div>
                  <div>Avg Confidence</div>
                </div>
                
                <div style={{ padding: '20px', backgroundColor: '#fce4ec', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#c2185b' }}>{(analytics.conversionRate * 100).toFixed(1)}%</div>
                  <div>Response Rate</div>
                </div>
              </div>
            </div>

            {/* Category Distribution */}
            <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Job Categories</h3>
              {Object.keys(analytics.categoryDistribution).length > 0 ? (
                <div>
                  {Object.entries(analytics.categoryDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, count]) => (
                      <div key={category} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{category}</span>
                        <span style={{ fontWeight: 'bold', color: '#007cba' }}>{count}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No jobs found in selected period</p>
              )}
            </div>

            {/* Location Distribution */}
            <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Top Locations</h3>
              {Object.keys(analytics.locationDistribution).length > 0 ? (
                <div>
                  {Object.entries(analytics.locationDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([location, count]) => (
                      <div key={location} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ textTransform: 'capitalize' }}>{location}</span>
                        <span style={{ fontWeight: 'bold', color: '#28a745' }}>{count}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No location data available</p>
              )}
            </div>

            {/* Time Distribution */}
            <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>Activity by Hour</h3>
              {Object.keys(analytics.timeDistribution).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px', fontSize: '12px' }}>
                  {Array.from({ length: 24 }, (_, hour) => {
                    const count = analytics.timeDistribution[hour] || 0;
                    const maxCount = Math.max(...Object.values(analytics.timeDistribution));
                    const intensity = maxCount > 0 ? count / maxCount : 0;
                    
                    return (
                      <div
                        key={hour}
                        title={`${hour}:00 - ${count} jobs`}
                        style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          backgroundColor: `rgba(0, 124, 186, ${intensity})`,
                          color: intensity > 0.5 ? 'white' : 'black',
                          borderRadius: '3px'
                        }}
                      >
                        {hour}h
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No time data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {performance && (
        <div style={{ marginBottom: '30px' }}>
          <h2>Performance Metrics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: performance.searchDuration < 2000 ? '#28a745' : '#ffc107' }}>
                {Math.round(performance.searchDuration)}ms
              </div>
              <div>Avg Search Duration</div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007cba' }}>
                {performance.apiCalls}
              </div>
              <div>API Calls</div>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                {performance.jobsProcessed}
              </div>
              <div>Jobs Processed</div>
            </div>
            
            {performance.memoryUsage && (
              <div style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
                  {Math.round(performance.memoryUsage / 1024 / 1024)}MB
                </div>
                <div>Memory Usage</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '14px', color: '#666' }}>
        <strong>Note:</strong> Analytics are stored locally in your browser. For production use, implement server-side analytics storage and processing.
      </div>
    </div>
  );
}