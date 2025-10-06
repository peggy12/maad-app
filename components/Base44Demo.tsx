import React, { useState } from 'react';
import { getBase44Service } from '../services/base44Service.js';
import './Base44Demo.css';

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

    <div className="base44-demo-container">
      <h3>🤖 Base44 Agent Demo</h3>
      <p>Test the Base44 "quote_assistant" agent directly:</p>
      
      <div className="base44-demo-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try: 'I need help clearing my garden'"
          className="base44-demo-input"
          disabled={loading}
        />
        <button
          onClick={handleDemo}
          disabled={loading || !input.trim()}
          className="base44-demo-button"
        >
          {loading ? 'Thinking...' : 'Ask Base44 Agent'}
        </button>
      </div>

      {response && (
        <div className="base44-demo-response">
          <strong>Base44 Agent Response:</strong>
          <p className="base44-demo-response-text">{response}</p>
        </div>
      )}

      <div className="base44-demo-examples">
        <strong>Try these examples:</strong>
        <ul className="base44-demo-examples-list">
          <li>"I need help clearing my garage"</li>
          <li>"How much for garden waste removal?"</li>
          <li>"Do you do handyman work in Fife?"</li>
          <li>"Can you clear house contents?"</li>
        </ul>
      </div>
    </div>
    </div>
  );
}