import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import { ConversationSelector } from './ConversationSelector.js';
import { FacebookJobSearch } from './FacebookJobSearch.js';
import { Base44Demo } from './components/Base44Demo.js';
import { AuthProvider, LoginForm, UserProfile, useAuth } from './components/AuthComponents.js';
import { AnalyticsDashboard } from './components/AnalyticsDashboard.js';
import { useSendMessage } from './useSendMessage.js';

// Services
import { getBase44Service } from './services/base44Service.js';
import { createAgentSDK } from './services/agentSDK.js';
import { analyticsService } from './services/analyticsService.js';

// Initialize services
const base44Service = getBase44Service();
base44Service.initialize().catch(console.error);
const agentSDK = createAgentSDK();

// Auto-initialize agentSDK
agentSDK.init({
  accountId: import.meta.env.VITE_LIVEPERSON_ACCOUNT_ID,
  domain: import.meta.env.VITE_LIVEPERSON_DOMAIN || 'va-a.ac.liveperson.net'
}).then(() => agentSDK.connect()).catch(console.error);

// Enhanced Chat Interface with all features
function ChatInterface() {
  const { authState } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState({ id: 'default' });
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'profile'>('chat');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  const addMessage = (role: string, content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  };

  const { sendMessage } = useSendMessage({
    inputValue,
    uploadedFiles,
    conversation,
    setInputValue,
    setUploadedFiles,
    setIsLoading,
    agentSDK,
    facebookPageId: import.meta.env.VITE_FACEBOOK_PAGE_ID || "820172544505737",
    facebookAccessToken: import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || "",
    addMessage,
    base44Service
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const startTime = Date.now();
    addMessage('user', inputValue);
    
    try {
      // Track user action
      analyticsService.trackUserAction('send_message', { 
        messageLength: inputValue.length,
        hasFiles: uploadedFiles.length > 0 
      });
      
      await sendMessage();
      
      // Track performance
      analyticsService.trackPerformance({
        searchDuration: Date.now() - startTime,
        apiCalls: 1,
        jobsProcessed: 0,
        errorRate: 0
      });
    } catch (error) {
      analyticsService.trackError(error instanceof Error ? error : new Error(String(error)), 'chat_interface');
      addMessage('system', `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header with Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#007cba' }}>
          🏠 MAAD - AI-Powered Job Discovery
        </h1>
        
        {authState.isAuthenticated && (
          <nav style={{ display: 'flex', gap: '20px' }}>
            <button
              onClick={() => setActiveTab('chat')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'chat' ? '#007cba' : 'transparent',
                color: activeTab === 'chat' ? 'white' : '#007cba',
                border: '1px solid #007cba',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              💬 Chat & Search
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'analytics' ? '#007cba' : 'transparent',
                color: activeTab === 'analytics' ? 'white' : '#007cba',
                border: '1px solid #007cba',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '8px 16px',
                backgroundColor: activeTab === 'profile' ? '#007cba' : 'transparent',
                color: activeTab === 'profile' ? 'white' : '#007cba',
                border: '1px solid #007cba',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              👤 Profile
            </button>
          </nav>
        )}
      </div>

      {/* Content Area */}
      {activeTab === 'chat' && (
        <div>
          {/* Base44 AI Agent Chat */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ marginTop: 0, color: '#495057', marginBottom: '15px' }}>🤖 Chat with MAAD AI Agent</h3>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <iframe
                src="https://manaboutadog.base44.app/EmbeddableChat"
                style={{ border: 'none', width: '100%', maxWidth: '800px', height: '500px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                title="MAAD Handyman Chat"
              />
            </div>
            <p style={{ textAlign: 'center', color: '#6c757d', fontSize: '14px' }}>
              💬 Chat directly with our AI agent powered by Base44
            </p>
          </div>

          {/* Enhanced Chat Interface (Job Search & Testing) */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#495057', marginBottom: '15px' }}>🔍 Job Search & Testing Interface</h3>
            
            {/* Messages Display */}
            {messages.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd', maxHeight: '400px', overflowY: 'auto' }}>
                {messages.map((msg, idx) => (
                  <div key={idx} style={{ marginBottom: '15px', padding: '10px', backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5', borderRadius: '4px' }}>
                    <strong>{msg.role === 'user' ? '👤 You' : '🤖 MAAD'}:</strong>
                    <div style={{ marginTop: '5px', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message or advanced job search command..."
                style={{
                  flex: 1,
                  minWidth: '300px',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  outline: 'none'
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                onFocus={(e) => e.target.style.borderColor = '#007cba'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0)}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: isLoading ? '#ccc' : '#007cba',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                {isLoading ? '🔄 Searching...' : '🚀 Send'}
              </button>
            </div>
          </div>

          {/* Enhanced Command Help */}
          <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
            <h3 style={{ marginTop: 0, color: '#495057' }}>🎯 Advanced Job Search Commands</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#007cba' }}>Basic Commands:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                  <li><code>search facebook jobs</code> - Default search</li>
                  <li><code>find jobs limit 100</code> - Custom limit</li>
                  <li><code>search jobs score 0.7</code> - High confidence only</li>
                </ul>
              </div>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#007cba' }}>Advanced Filters:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                  <li><code>find handyman jobs in Belfast</code> - Location filter</li>
                  <li><code>search clearance jobs since 2025-01-01</code> - Date range</li>
                  <li><code>find jobs exclude "not hiring"</code> - Exclusion filter</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Components Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
            {/* Conversation Manager */}
            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
              <ConversationSelector />
            </div>

            {/* Facebook Job Search */}
            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
              <FacebookJobSearch />
            </div>

            {/* Base44 AI Demo */}
            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
              <Base44Demo />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && authState.isAuthenticated && (
        <AnalyticsDashboard />
      )}

      {activeTab === 'profile' && authState.isAuthenticated && (
        <UserProfile />
      )}

      {/* User Status Bar */}
      {authState.isAuthenticated && (
        <div style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          padding: '10px 15px', 
          backgroundColor: '#007cba', 
          color: 'white', 
          borderRadius: '20px', 
          fontSize: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          👋 {authState.user?.name} ({authState.user?.role})
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

// Wrapper to handle authentication state
function AuthenticatedApp() {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px' }}>🏠</div>
        <div>Loading MAAD...</div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', color: '#007cba', marginBottom: '10px' }}>🏠 MAAD</h1>
          <p style={{ fontSize: '18px', color: '#666' }}>AI-Powered Job Discovery & Response System</p>
        </div>
        <LoginForm />
        
        {/* Features Preview */}
        <div style={{ maxWidth: '800px', margin: '60px auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '30px' }}>🚀 Powerful Features</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>🔍</div>
              <h3>Smart Job Discovery</h3>
              <p>Advanced Facebook feed analysis with AI-powered job detection and confidence scoring.</p>
            </div>
            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>🤖</div>
              <h3>AI Response Generation</h3>
              <p>Automated professional responses using Base44 AI for handyman and clearance services.</p>
            </div>
            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>📊</div>
              <h3>Advanced Analytics</h3>
              <p>Comprehensive tracking of job opportunities, response rates, and performance metrics.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ChatInterface />;
}

// Mount the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}