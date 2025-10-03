
import { useState, useEffect } from "react";
import { fetchRecentConversations, type Conversation } from "./utils/fetchRecentConversations.js";

interface ConversationSelectorProps {
  onSelect?: (threadId: string) => void;
}

export function ConversationSelector({ onSelect }: ConversationSelectorProps) {
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadThreads() {
      setLoading(true);
      try {
        const data = await fetchRecentConversations({ search: searchTerm });
        setThreads(data);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadThreads();
  }, [searchTerm]);

  return (
    <div className="conversation-selector">
      <input
        type="text"
        placeholder="Search conversations..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>
              <button onClick={() => onSelect?.(thread.id)}>
                {thread.title || "Untitled"} — {new Date(thread.created_at).toLocaleString()}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
