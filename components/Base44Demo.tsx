import React, { useState } from 'react';
import { getBase44Service } from '../services/base44Service.js';

export function Base44Demo() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemo = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const base44 = getBase44Service();
      const result = await base44.generateChatResponse(input);
      setResponse(result);
    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      margin: '20px 0',
      backgroundColor: '#f9f9f9' 
    }}>
      <h3>🤖 Base44 Agent Demo</h3>
      <p>Test the Base44 "quote_assistant" agent directly:</p>
      
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try: 'I need help clearing my garden'"
          style={{ 
            width: '70%', 
            padding: '8px', 
            marginRight: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          disabled={loading}
        />
        <button
          onClick={handleDemo}
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Thinking...' : 'Ask Base44 Agent'}
        </button>
      </div>

      {response && (
        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '4px',
          border: '1px solid #e0e0e0',
          marginTop: '10px'
        }}>
          <strong>Base44 Agent Response:</strong>
          <p style={{ margin: '10px 0 0 0', whiteSpace: 'pre-wrap' }}>{response}</p>
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        <strong>Try these examples:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>"I need help clearing my garage"</li>
          <li>"How much for garden waste removal?"</li>
          <li>"Do you do handyman work in Fife?"</li>
          <li>"Can you clear house contents?"</li>
        </ul>
      </div>
    </div>
  );
}