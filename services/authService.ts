/**
 * User Authentication Service for MAAD App
 * Handles login, user profiles, and job preferences
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'client';
  preferences: {
    jobCategories: string[];
    locationRadius: number;
    minJobScore: number;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    autoResponse: boolean;
    businessHours: {
      start: string; // HH:MM
      end: string;   // HH:MM
      timezone: string;
    };
  };
  statistics: {
    jobsFound: number;
    responsesGenerated: number;
    lastActive: string;
    joinDate: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private authToken: string | null = null;

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    try {
      const storedUser = localStorage.getItem('maad_user');
      const storedToken = localStorage.getItem('maad_auth_token');
      
      if (storedUser && storedToken) {
        this.currentUser = JSON.parse(storedUser);
        this.authToken = storedToken;
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
      this.clearStoredAuth();
    }
  }

  private saveAuth(user: UserProfile, token: string): void {
    try {
      localStorage.setItem('maad_user', JSON.stringify(user));
      localStorage.setItem('maad_auth_token', token);
      this.currentUser = user;
      this.authToken = token;
    } catch (error) {
      console.error('Failed to save auth:', error);
    }
  }

  private clearStoredAuth(): void {
    localStorage.removeItem('maad_user');
    localStorage.removeItem('maad_auth_token');
    this.currentUser = null;
    this.authToken = null;
  }

  async login(credentials: LoginCredentials): Promise<UserProfile> {
    try {
      // In production, this would be an API call
      // For demo, we'll simulate different user types
      const mockUsers: Record<string, UserProfile> = {
        'admin@maad.com': {
          id: 'admin-1',
          email: 'admin@maad.com',
          name: 'MAAD Administrator',
          role: 'admin',
          preferences: {
            jobCategories: ['handyman', 'clearance', 'electrical', 'plumbing'],
            locationRadius: 50,
            minJobScore: 0.3,
            notifications: { email: true, push: true, sms: true },
            autoResponse: true,
            businessHours: { start: '08:00', end: '18:00', timezone: 'Europe/London' }
          },
          statistics: {
            jobsFound: 156,
            responsesGenerated: 89,
            lastActive: new Date().toISOString(),
            joinDate: '2024-01-15T00:00:00Z'
          }
        },
        'operator@maad.com': {
          id: 'op-1',
          email: 'operator@maad.com', 
          name: 'MAAD Operator',
          role: 'operator',
          preferences: {
            jobCategories: ['handyman', 'clearance'],
            locationRadius: 25,
            minJobScore: 0.5,
            notifications: { email: true, push: false, sms: false },
            autoResponse: false,
            businessHours: { start: '09:00', end: '17:00', timezone: 'Europe/London' }
          },
          statistics: {
            jobsFound: 67,
            responsesGenerated: 34,
            lastActive: new Date().toISOString(),
            joinDate: '2024-03-10T00:00:00Z'
          }
        }
      };

      const user = mockUsers[credentials.email];
      if (!user || credentials.password !== 'maad2024') {
        throw new Error('Invalid credentials');
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock JWT token
      const token = btoa(JSON.stringify({ 
        userId: user.id, 
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }));

      this.saveAuth(user, token);
      return user;

    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(): Promise<void> {
    this.clearStoredAuth();
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    if (!this.currentUser || !this.authToken) return false;
    
    try {
      const tokenData = JSON.parse(atob(this.authToken));
      return Date.now() < tokenData.exp;
    } catch {
      return false;
    }
  }

  async updateUserPreferences(updates: Partial<UserProfile['preferences']>): Promise<UserProfile> {
    if (!this.currentUser) {
      throw new Error('No authenticated user');
    }

    const updatedUser: UserProfile = {
      ...this.currentUser,
      preferences: {
        ...this.currentUser.preferences,
        ...updates
      }
    };

    // In production, this would be an API call
    await new Promise(resolve => setTimeout(resolve, 500));

    this.saveAuth(updatedUser, this.authToken!);
    return updatedUser;
  }

  async updateStatistics(updates: Partial<UserProfile['statistics']>): Promise<void> {
    if (!this.currentUser) return;

    const updatedUser: UserProfile = {
      ...this.currentUser,
      statistics: {
        ...this.currentUser.statistics,
        ...updates,
        lastActive: new Date().toISOString()
      }
    };

    this.saveAuth(updatedUser, this.authToken!);
  }

  hasPermission(action: 'view_jobs' | 'auto_respond' | 'admin_panel' | 'user_management'): boolean {
    if (!this.currentUser) return false;

    const permissions = {
      admin: ['view_jobs', 'auto_respond', 'admin_panel', 'user_management'],
      operator: ['view_jobs', 'auto_respond'],
      client: ['view_jobs']
    };

    return permissions[this.currentUser.role].includes(action);
  }

  // Job preference helpers
  shouldProcessJob(jobAnalysis: any): boolean {
    if (!this.currentUser) return false;
    
    const prefs = this.currentUser.preferences;
    
    // Check minimum score
    if (jobAnalysis.confidence < prefs.minJobScore) return false;
    
    // Check category preferences
    if (jobAnalysis.category && !prefs.jobCategories.includes(jobAnalysis.category)) {
      return false;
    }
    
    // Check business hours
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = parseInt(prefs.businessHours.start.split(':')[0] ?? '9');
    const endHour = parseInt(prefs.businessHours.end.split(':')[0] ?? '17');
    
    if (currentHour < startHour || currentHour >= endHour) {
      return false; // Outside business hours
    }
    
    return true;
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;