import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  BarChart3, 
  User, 
  Send, 
  Upload, 
  Bot,
  Sparkles,
  Briefcase,
  Home,
  Settings,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';
import 'react-toastify/dist/ReactToastify.css';

// Components
import { ConversationSelector } from './ConversationSelector.js';
import { AuthProvider, LoginForm, useAuth } from './components/AuthComponents.js';
import { LoadingSpinner, WelcomeScreen } from './components/ModernComponents.js';
import { 
  FacebookJobSearchLazy,
  AnalyticsDashboardLazy,
  UserProfileLazy,
  preloadComponents
} from './components/LazyComponents.js';
import { PerformanceMonitor, PerformanceBadge } from './components/PerformanceMonitor.js';
import { useSendMessage } from './useSendMessage.js';

// Services
import { getBase44Service } from './services/base44Service.js';
import { createAgentSDK } from './services/agentSDK.js';
import { analyticsService } from './services/analyticsService.js';
import { registerServiceWorker } from './utils/serviceWorker.js';

// Initialize services
const base44Service = getBase44Service();
base44Service.initialize().catch(console.error);
const agentSDK = createAgentSDK();

// Auto-initialize agentSDK
agentSDK.init({
  accountId: import.meta.env.VITE_LIVEPERSON_ACCOUNT_ID,
  domain: import.meta.env.VITE_LIVEPERSON_DOMAIN || 'va-a.ac.liveperson.net'
}).then(() => agentSDK.connect()).catch(console.error);

// Register service worker for performance caching
if (import.meta.env.PROD) {
  registerServiceWorker().catch(console.error);
}

// Modern Tab Navigation Component
function TabNavigation({ activeTab, onTabChange, isOpen, onToggle }: {
  activeTab: 'chat' | 'jobs' | 'analytics' | 'profile';
  onTabChange: (tab: 'chat' | 'jobs' | 'analytics' | 'profile') => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const tabs = [
    { id: 'chat' as const, label: 'AI Chat', icon: MessageCircle },
    { id: 'jobs' as const, label: 'Job Search', icon: Briefcase },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="md:hidden fixed top-4 right-4 z-50 btn btn-primary p-2"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Bot className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">MAAD</h1>
              <p className="text-sm text-gray-500">AI Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  onMouseEnter={() => {
                    // Preload component on hover for better UX
                    if (tab.id === 'jobs') preloadComponents.jobs();
                    else if (tab.id === 'analytics') preloadComponents.analytics();
                    else if (tab.id === 'profile') preloadComponents.profile();
                  }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles size={14} />
            Powered by Base44 AI
          </div>
        </div>
      </nav>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onToggle}
          >
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="w-64 bg-white h-full shadow-xl"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                    <Bot className="text-white" size={20} />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900">MAAD</h1>
                    <p className="text-sm text-gray-500">AI Assistant</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          onTabChange(tab.id);
                          onToggle();
                        }}
                        onMouseEnter={() => {
                          // Preload component on hover for better UX
                          if (tab.id === 'jobs') preloadComponents.jobs();
                          else if (tab.id === 'analytics') preloadComponents.analytics();
                          else if (tab.id === 'profile') preloadComponents.profile();
                        }}
                        className={clsx(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <Icon size={18} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Modern Chat Interface
function ChatInterface() {
  const { authState } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState({ id: 'default' });
  const [activeTab, setActiveTab] = useState<'chat' | 'jobs' | 'analytics' | 'profile'>('chat');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    addMessage
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        setUploadedFiles(prev => [...prev, { url }]);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && uploadedFiles.length === 0) return;
    
    setIsLoading(true);
    try {
      await sendMessage();
      analyticsService.trackUserAction('message_sent', { type: 'user_message' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TabNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={mobileMenuOpen}
        onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {activeTab === 'chat' ? 'AI Assistant' : 
                 activeTab === 'jobs' ? 'Job Search' :
                 activeTab === 'analytics' ? 'Analytics Dashboard' : 'User Profile'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === 'chat' ? 'Chat with our intelligent AI assistant' :
                 activeTab === 'jobs' ? 'Find opportunities on Facebook' :
                 activeTab === 'analytics' ? 'Monitor your activity and insights' : 'Manage your account settings'}
              </p>
            </div>
            {authState.isAuthenticated && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {authState.user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {authState.user?.name || 'User'}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">
                      {messages.length === 0 ? (
                        <WelcomeScreen />
                      ) : (
                        <div className="space-y-4">
                          {messages.map((message, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={clsx(
                                'flex gap-3',
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              )}
                            >
                              {message.role === 'assistant' && (
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Bot className="text-white" size={16} />
                                </div>
                              )}
                              <div
                                className={clsx(
                                  'max-w-md px-4 py-3 rounded-lg',
                                  message.role === 'user'
                                    ? 'bg-blue-600 text-white ml-auto'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                )}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              {message.role === 'user' && (
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="text-gray-600" size={16} />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-200 bg-white p-6">
                    <div className="max-w-4xl mx-auto">
                      <form onSubmit={handleSubmit} className="flex gap-3">
                        <div className="flex-1">
                          <div className="relative">
                            <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              placeholder="Type your message..."
                              className="input pr-12"
                              disabled={isLoading}
                            />
                            <label className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600">
                              <Upload size={18} />
                              <input
                                type="file"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                                aria-label="Upload files"
                              />
                            </label>
                          </div>
                          {uploadedFiles.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="badge badge-success">
                                  File {index + 1}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          type="submit"
                          disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0)}
                          className="btn btn-primary px-4"
                        >
                          {isLoading ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Send size={18} />
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'jobs' && (
                <div className="h-full p-6">
                  <div className="max-w-6xl mx-auto">
                    <FacebookJobSearchLazy />
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="h-full p-6">
                  <div className="max-w-6xl mx-auto">
                    <AnalyticsDashboardLazy />
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="h-full p-6">
                  <div className="max-w-2xl mx-auto">
                    <UserProfileLazy />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-50"
      />
      
      {/* Performance Monitoring */}
      <PerformanceBadge />
      <PerformanceMonitor />
    </div>
  );
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AuthenticatedApp />
      </div>
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bot className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to MAAD
            </h1>
            <p className="text-gray-600">
              Your intelligent AI assistant powered by Base44
            </p>
          </div>
          <div className="card p-6">
            <LoginForm />
          </div>
        </motion.div>
      </div>
    );
  }

  return <ChatInterface />;
}

// Initialize the app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Root container not found');
}

export default App;