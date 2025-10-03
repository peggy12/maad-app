import React, { useState, useContext, useEffect, createContext } from 'react';
import { authService } from '../services/authService.js';
import type { UserProfile, LoginCredentials, AuthState } from '../services/authService.js';

// Auth Context
const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (updates: Partial<UserProfile['preferences']>) => Promise<void>;
} | null>(null);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check existing authentication on mount
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    
    setAuthState({
      user,
      isAuthenticated,
      isLoading: false,
      error: null
    });
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await authService.login(credentials);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed'
      }));
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const updatePreferences = async (updates: Partial<UserProfile['preferences']>) => {
    if (!authState.user) return;
    
    try {
      const updatedUser = await authService.updateUserPreferences(updates);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, updatePreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Login Component
export function LoginForm() {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const { authState, login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (error) {
      // Error is handled in context
    }
  };

  if (authState.isLoading) {
    return <div className="loading">Authenticating...</div>;
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>MAAD Login</h2>
      
      {authState.error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>
          {authState.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={authState.isLoading}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            backgroundColor: '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: authState.isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {authState.isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <strong>Demo Accounts:</strong><br />
        Admin: admin@maad.com / maad2024<br />
        Operator: operator@maad.com / maad2024
      </div>
    </div>
  );
}

// User Profile Component
export function UserProfile() {
  const { authState, logout, updatePreferences } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState(authState.user?.preferences || {
    jobCategories: [],
    locationRadius: 25,
    minJobScore: 0.3,
    notifications: { email: true, push: false, sms: false },
    autoResponse: false,
    businessHours: { start: '09:00', end: '17:00', timezone: 'Europe/London' }
  });

  if (!authState.user) return null;

  const handleSavePreferences = async () => {
    try {
      await updatePreferences(preferences);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>User Profile</h2>
        <button
          onClick={logout}
          style={{ padding: '5px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>{authState.user.name}</h3>
        <p><strong>Email:</strong> {authState.user.email}</p>
        <p><strong>Role:</strong> {authState.user.role}</p>
        <p><strong>Member since:</strong> {new Date(authState.user.statistics.joinDate).toLocaleDateString()}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007cba' }}>{authState.user.statistics.jobsFound}</div>
            <div>Jobs Found</div>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{authState.user.statistics.responsesGenerated}</div>
            <div>Responses Generated</div>
          </div>
        </div>
      </div>
      
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4>Job Preferences</h4>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{ padding: '5px 15px', backgroundColor: '#007cba', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        
        {isEditing ? (
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Job Categories:</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['handyman', 'clearance', 'electrical', 'plumbing', 'building'].map(category => (
                  <label key={category} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.jobCategories?.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences(prev => ({
                            ...prev,
                            jobCategories: [...(prev.jobCategories || []), category]
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            jobCategories: (prev.jobCategories || []).filter(c => c !== category)
                          }));
                        }
                      }}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Minimum Job Score: {preferences.minJobScore}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={preferences.minJobScore}
                onChange={(e) => setPreferences(prev => ({ ...prev, minJobScore: parseFloat(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={preferences.autoResponse}
                  onChange={(e) => setPreferences(prev => ({ ...prev, autoResponse: e.target.checked }))}
                />
                Enable Auto-Response to Jobs
              </label>
            </div>
            
            <button
              onClick={handleSavePreferences}
              style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Save Preferences
            </button>
          </div>
        ) : (
          <div>
            <p><strong>Categories:</strong> {authState.user.preferences.jobCategories.join(', ')}</p>
            <p><strong>Min Job Score:</strong> {authState.user.preferences.minJobScore}</p>
            <p><strong>Auto-Response:</strong> {authState.user.preferences.autoResponse ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Business Hours:</strong> {authState.user.preferences.businessHours.start} - {authState.user.preferences.businessHours.end}</p>
          </div>
        )}
      </div>
    </div>
  );
}