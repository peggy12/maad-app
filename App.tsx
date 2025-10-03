import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ConversationSelector } from './ConversationSelector.js';
import { FacebookJobSearch } from './FacebookJobSearch.js';
import { Base44Demo } from './components/Base44Demo.js';
import { useSendMessage } from './useSendMessage.js';

// Base44 SDK integration
import { getBase44Service } from './services/base44Service.js';
import { createAgentSDK } from './services/agentSDK.js';

// Initialize Base44 service for AI agent responses
const base44Service = getBase44Service();
base44Service.initialize().catch(console.error);

// Keep LivePerson SDK for chat management
const agentSDK = createAgentSDK();

function ChatInterface() {
  const [inputValue, setInputValue] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ url: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState({ id: 'default' });

  const { sendMessage } = useSendMessage({
    inputValue,
    uploadedFiles,
    conversation,
    setInputValue,
    setUploadedFiles,
    setIsLoading,
    agentSDK,
    facebookPageId: "820172544505737",
    facebookAccessToken: "EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD"
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>MAAD Chat & Job Search</h1>
      
      {/* Conversation Selector */}
      <ConversationSelector />
      
      {/* Chat Input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type 'search facebook jobs' or chat normally..."
          style={{ 
            width: '70%', 
            padding: '10px', 
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading || (!inputValue.trim() && uploadedFiles.length === 0)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Loading...' : 'Send'}
        </button>
      </div>

      {/* Base44 Agent Demo */}
      <Base44Demo />

      {/* Job Search Component */}
      <FacebookJobSearch 
        pageId="820172544505737"
        accessToken="EAALmMutQkSQBPmw7pdLIzMMAZCtI3gOkUSNQL8xfZApuvT3rDAZCZCqjkOf16dxcDOZC8twaqRTu0rhlQI99B47c75PA9yO34hZCi4psOthLP8KN7hEmUeJTZB6wSujpAxgixUT0uKsp3OcaCQksVCzMFMNnG0soKVFhdFYOfZBKL3ZCtIYtxyebZCZAumbFAV6TbZA6YwIqA2U0MVo8PLq4bwuoEywm4jJXZCy7AycZBdFgZDZD"
      />

      {/* Toast notifications */}
      <ToastContainer position="top-right" />
    </div>
  );
}

// Initialize React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ChatInterface />);
}