/**
 * Analytics and Monitoring Service for MAAD App
 * Tracks performance metrics, job search analytics, and system health
 */

export interface AnalyticsEvent {
  id: string;
  type: 'job_search' | 'job_found' | 'response_generated' | 'user_action' | 'error' | 'performance';
  timestamp: string;
  data: Record<string, any>;
  userId?: string;
  sessionId: string;
}

export interface PerformanceMetrics {
  searchDuration: number;
  apiCalls: number;
  jobsProcessed: number;
  memoryUsage?: number;
  errorRate: number;
}

export interface JobAnalytics {
  totalSearches: number;
  totalJobsFound: number;
  averageConfidence: number;
  categoryDistribution: Record<string, number>;
  locationDistribution: Record<string, number>;
  timeDistribution: Record<string, number>; // Hour-based distribution
  conversionRate: number; // Jobs found vs responses generated
}

export interface SystemHealth {
  uptime: number;
  apiStatus: {
    facebook: 'healthy' | 'degraded' | 'down';
    base44: 'healthy' | 'degraded' | 'down';
    liveperson: 'healthy' | 'degraded' | 'down';
  };
  errorRate: number;
  averageResponseTime: number;
  activeUsers: number;
  lastHealthCheck: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private startTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.loadStoredEvents();
    this.setupPeriodicHealthCheck();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private loadStoredEvents(): void {
    try {
      const stored = localStorage.getItem('maad_analytics');
      if (stored) {
        const data = JSON.parse(stored);
        // Keep only events from last 7 days
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        this.events = data.filter((event: AnalyticsEvent) => 
          new Date(event.timestamp).getTime() > weekAgo
        );
      }
    } catch (error) {
      console.error('Failed to load stored analytics:', error);
      this.events = [];
    }
  }

  private saveEvents(): void {
    try {
      localStorage.setItem('maad_analytics', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  private setupPeriodicHealthCheck(): void {
    // Check system health every 5 minutes
    setInterval(() => {
      this.trackSystemHealth();
    }, 5 * 60 * 1000);
  }

  // Track different types of events
  trackJobSearch(searchParams: any, results: any, duration: number): void {
    this.trackEvent('job_search', {
      searchParams,
      resultsCount: results?.jobs?.length || 0,
      totalPosts: results?.totalPosts || 0,
      duration,
      success: results?.success || false
    });
  }

  trackJobFound(job: any): void {
    this.trackEvent('job_found', {
      jobId: job.id,
      confidence: job.jobScore,
      category: job.category,
      hasLocation: job.hasLocation,
      locationMatches: job.locationMatches,
      keywordCount: job.matchedKeywords?.length || 0
    });
  }

  trackResponseGenerated(jobId: string, responseType: 'auto' | 'manual', success: boolean): void {
    this.trackEvent('response_generated', {
      jobId,
      responseType,
      success,
      timestamp: new Date().toISOString()
    });
  }

  trackUserAction(action: string, details: Record<string, any> = {}): void {
    this.trackEvent('user_action', {
      action,
      ...details
    });
  }

  trackError(error: Error | string, context?: string): void {
    this.trackEvent('error', {
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  trackPerformance(metrics: PerformanceMetrics): void {
    this.trackEvent('performance', metrics);
  }

  private trackEvent(type: AnalyticsEvent['type'], data: Record<string, any>): void {
    const event: AnalyticsEvent = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type,
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.sessionId
    };

    // Add user ID if authenticated
    try {
      const user = JSON.parse(localStorage.getItem('maad_user') || 'null');
      if (user?.id) {
        event.userId = user.id;
      }
    } catch {
      // No user logged in
    }

    this.events.push(event);
    
    // Keep only last 1000 events in memory
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    this.saveEvents();
    
    // Send to analytics service in production
    if (import.meta.env?.PROD) {
      this.sendToAnalyticsService(event).catch(console.error);
    }
  }

  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // In production, send to your analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  // Analytics queries and reports
  getJobAnalytics(dateRange?: { start: Date; end: Date }): JobAnalytics {
    const events = this.filterEventsByDateRange(this.events, dateRange);
    
    const jobSearches = events.filter(e => e.type === 'job_search');
    const jobsFound = events.filter(e => e.type === 'job_found');
    const responsesGenerated = events.filter(e => e.type === 'response_generated' && e.data.success);

    const categoryDist: Record<string, number> = {};
    const locationDist: Record<string, number> = {};
    const timeDist: Record<string, number> = {};

    let totalConfidence = 0;

    jobsFound.forEach(event => {
      // Category distribution
      const category = event.data.category || 'unknown';
      categoryDist[category] = (categoryDist[category] || 0) + 1;

      // Location distribution
      if (event.data.locationMatches) {
        event.data.locationMatches.forEach((location: string) => {
          locationDist[location] = (locationDist[location] || 0) + 1;
        });
      }

      // Time distribution (by hour)
      const hour = new Date(event.timestamp).getHours();
      timeDist[hour] = (timeDist[hour] || 0) + 1;

      // Confidence tracking
      totalConfidence += event.data.confidence || 0;
    });

    return {
      totalSearches: jobSearches.length,
      totalJobsFound: jobsFound.length,
      averageConfidence: jobsFound.length > 0 ? totalConfidence / jobsFound.length : 0,
      categoryDistribution: categoryDist,
      locationDistribution: locationDist,
      timeDistribution: timeDist,
      conversionRate: jobsFound.length > 0 ? responsesGenerated.length / jobsFound.length : 0
    };
  }

  getPerformanceMetrics(dateRange?: { start: Date; end: Date }): PerformanceMetrics {
    const events = this.filterEventsByDateRange(this.events, dateRange);
    
    const searchEvents = events.filter(e => e.type === 'job_search');
    const errorEvents = events.filter(e => e.type === 'error');
    const performanceEvents = events.filter(e => e.type === 'performance');

    const totalDuration = searchEvents.reduce((sum, e) => sum + (e.data.duration || 0), 0);
    const totalApiCalls = searchEvents.reduce((sum, e) => sum + 1, 0); // Each search is an API call
    const totalJobs = searchEvents.reduce((sum, e) => sum + (e.data.resultsCount || 0), 0);

    return {
      searchDuration: searchEvents.length > 0 ? totalDuration / searchEvents.length : 0,
      apiCalls: totalApiCalls,
      jobsProcessed: totalJobs,
      errorRate: events.length > 0 ? errorEvents.length / events.length : 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    };
  }

  async trackSystemHealth(): Promise<SystemHealth> {
    const health: SystemHealth = {
      uptime: (Date.now() - this.startTime) / 1000, // in seconds
      apiStatus: {
        facebook: 'healthy',
        base44: 'healthy',
        liveperson: 'healthy'
      },
      errorRate: this.getErrorRate(),
      averageResponseTime: this.getAverageResponseTime(),
      activeUsers: this.getActiveUserCount(),
      lastHealthCheck: new Date().toISOString()
    };

    // Test API endpoints
    try {
      // Test Facebook API
      const fbResponse = await fetch('https://graph.facebook.com/v18.0/me?access_token=test', {
        method: 'HEAD'
      });
      health.apiStatus.facebook = fbResponse.status === 400 ? 'healthy' : 'down'; // 400 is expected for invalid token
    } catch {
      health.apiStatus.facebook = 'down';
    }

    this.trackEvent('performance', health);
    return health;
  }

  private getErrorRate(): number {
    const recent = this.events.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 60 * 60 * 1000 // Last hour
    );
    const errors = recent.filter(e => e.type === 'error');
    return recent.length > 0 ? errors.length / recent.length : 0;
  }

  private getAverageResponseTime(): number {
    const searchEvents = this.events
      .filter(e => e.type === 'job_search' && e.data.duration)
      .slice(-10); // Last 10 searches
    
    if (searchEvents.length === 0) return 0;
    
    const totalTime = searchEvents.reduce((sum, e) => sum + e.data.duration, 0);
    return totalTime / searchEvents.length;
  }

  private getActiveUserCount(): number {
    const recentEvents = this.events.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 30 * 60 * 1000 // Last 30 minutes
    );
    
    const uniqueUsers = new Set(recentEvents.map(e => e.userId || e.sessionId));
    return uniqueUsers.size;
  }

  private filterEventsByDateRange(events: AnalyticsEvent[], dateRange?: { start: Date; end: Date }): AnalyticsEvent[] {
    if (!dateRange) return events;
    
    return events.filter(event => {
      const eventTime = new Date(event.timestamp);
      return eventTime >= dateRange.start && eventTime <= dateRange.end;
    });
  }

  // Export data for external analysis
  exportData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'type', 'userId', 'sessionId', 'data'];
      const rows = this.events.map(event => [
        event.timestamp,
        event.type,
        event.userId || '',
        event.sessionId,
        JSON.stringify(event.data)
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(this.events, null, 2);
  }

  // Clear old data
  clearOldData(olderThanDays: number = 30): void {
    const cutoff = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    this.events = this.events.filter(event => 
      new Date(event.timestamp).getTime() > cutoff
    );
    this.saveEvents();
  }
}

// Token management helpers
export class TokenManager {
  private static readonly FACEBOOK_TOKEN_KEY = 'facebook_access_token';
  private static readonly TOKEN_EXPIRY_KEY = 'token_expiry';

  static setFacebookToken(token: string, expiryInSeconds: number = 5184000): void { // 60 days default
    const expiryTime = Date.now() + (expiryInSeconds * 1000);
    
    localStorage.setItem(this.FACEBOOK_TOKEN_KEY, token);
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  static getFacebookToken(): string | null {
    const token = localStorage.getItem(this.FACEBOOK_TOKEN_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    
    if (!token || !expiry) return null;
    
    if (Date.now() > parseInt(expiry)) {
      this.clearTokens();
      return null;
    }
    
    return token;
  }

  static isTokenExpiringSoon(daysThreshold: number = 7): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;
    
    const expiryTime = parseInt(expiry);
    const threshold = Date.now() + (daysThreshold * 24 * 60 * 60 * 1000);
    
    return expiryTime < threshold;
  }

  static clearTokens(): void {
    localStorage.removeItem(this.FACEBOOK_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static async validateFacebookToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${token}`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;