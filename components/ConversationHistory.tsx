/**
 * Conversation History Component
 * Displays past conversations with search and management
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Trash2, 
  Clock, 
  Tag,
  BarChart,
  Download
} from 'lucide-react';
import { conversationMemory } from '../services/conversationMemory.js';
import { contextAwareness } from '../services/contextAwareness.js';
import type { Conversation, ConversationMessage } from '../services/conversationMemory.js';

interface ConversationHistoryProps {
  onSelectConversation?: (conversationId: string) => void;
  currentConversationId?: string;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectConversation,
  currentConversationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const allConvs = await conversationMemory.getAllConversations(50);
      setConversations(allConvs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search conversations
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadConversations();
      return;
    }

    try {
      setLoading(true);
      const results = await conversationMemory.searchConversations(searchQuery);
      setConversations(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete conversation
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this conversation?')) return;

    try {
      await conversationMemory.deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  // Show insights
  const handleShowInsights = async (id: string) => {
    try {
      const convInsights = await contextAwareness.getInsights(id);
      setSelectedId(id);
      setInsights(convInsights);
    } catch (error) {
      console.error('Failed to get insights:', error);
    }
  };

  // Export conversation
  const handleExport = async (conversation: Conversation) => {
    const exportData = {
      title: conversation.title,
      createdAt: new Date(conversation.createdAt).toISOString(),
      messages: conversation.messages.map((m: ConversationMessage) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp).toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${conversation.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="conversation-history">
      {/* Search Bar */}
      <div className="search-bar">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Stats */}
      <div className="history-stats">
        <div className="stat">
          <MessageCircle size={16} />
          <span>{conversations.length} conversations</span>
        </div>
        <div className="stat">
          <Clock size={16} />
          <span>Last {formatDate(conversations[0]?.updatedAt || Date.now())}</span>
        </div>
      </div>

      {/* Conversation List */}
      <div className="conversation-list">
        {loading ? (
          <div className="loading">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="empty">No conversations found</div>
        ) : (
          <AnimatePresence>
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
                onClick={() => onSelectConversation?.(conv.id)}
              >
                <div className="conversation-header">
                  <MessageCircle size={18} />
                  <h3>{conv.title}</h3>
                  <span className="message-count">{conv.messages.length}</span>
                </div>

                <div className="conversation-preview">
                  {conv.messages[0]?.content.substring(0, 80)}...
                </div>

                <div className="conversation-footer">
                  <span className="date">
                    <Clock size={14} />
                    {formatDate(conv.updatedAt)}
                  </span>

                  {conv.metadata?.tags && (
                    <div className="tags">
                      {conv.metadata.tags.slice(0, 3).map((tag: string, i: number) => (
                        <span key={i} className="tag">
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="conversation-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowInsights(conv.id);
                    }}
                    title="View insights"
                  >
                    <BarChart size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(conv);
                    }}
                    title="Export"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(conv.id);
                    }}
                    title="Delete"
                    className="delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Insights Modal */}
      <AnimatePresence>
        {insights && selectedId && (
          <motion.div
            className="insights-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setInsights(null);
              setSelectedId(null);
            }}
          >
            <motion.div
              className="insights-content"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Conversation Insights</h3>

              <div className="insights-grid">
                <div className="insight-card">
                  <MessageCircle size={24} />
                  <div className="insight-value">{insights.messageCount}</div>
                  <div className="insight-label">Messages</div>
                </div>

                <div className="insight-card">
                  <Clock size={24} />
                  <div className="insight-value">
                    {Math.round(insights.duration / 60000)}m
                  </div>
                  <div className="insight-label">Duration</div>
                </div>

                <div className="insight-card">
                  <BarChart size={24} />
                  <div className="insight-value">{insights.averageResponseLength}</div>
                  <div className="insight-label">Avg Response</div>
                </div>

                <div className="insight-card">
                  <Tag size={24} />
                  <div className="insight-value">{insights.sentiment}</div>
                  <div className="insight-label">Sentiment</div>
                </div>
              </div>

              {insights.topics.length > 0 && (
                <div className="insight-topics">
                  <h4>Topics Discussed</h4>
                  <div className="topic-tags">
                    {insights.topics.map((topic: string, i: number) => (
                      <span key={i} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => {
                setInsights(null);
                setSelectedId(null);
              }}>
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .conversation-history {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--color-bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--color-border);
        }

        .search-bar input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.875rem;
          outline: none;
        }

        .search-bar button {
          padding: 0.5rem 1rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .history-stats {
          display: flex;
          gap: 1.5rem;
          padding: 0.5rem;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .conversation-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .conversation-item {
          padding: 1rem;
          background: var(--color-bg-secondary);
          border-radius: 8px;
          border: 1px solid var(--color-border);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .conversation-item:hover {
          border-color: var(--color-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .conversation-item.active {
          border-color: var(--color-primary);
          background: var(--color-primary-light);
        }

        .conversation-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .conversation-header h3 {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
        }

        .message-count {
          padding: 0.25rem 0.5rem;
          background: var(--color-primary);
          color: white;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .conversation-preview {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }

        .conversation-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tag {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .conversation-actions {
          display: flex;
          gap: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--color-border);
        }

        .conversation-actions button {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all 0.2s;
        }

        .conversation-actions button:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-primary);
        }

        .conversation-actions button.delete:hover {
          color: var(--color-error);
        }

        .loading, .empty {
          padding: 2rem;
          text-align: center;
          color: var(--color-text-secondary);
        }

        .insights-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .insights-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .insights-content h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .insight-card {
          padding: 1.5rem;
          background: var(--color-bg-secondary);
          border-radius: 8px;
          text-align: center;
        }

        .insight-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.5rem 0;
          color: var(--color-primary);
        }

        .insight-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .insight-topics h4 {
          margin: 0 0 0.75rem 0;
          font-size: 1rem;
        }

        .topic-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .topic-tag {
          padding: 0.5rem 0.75rem;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .insights-content > button {
          width: 100%;
          padding: 0.75rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default ConversationHistory;