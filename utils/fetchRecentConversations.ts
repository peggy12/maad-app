// Mock implementation for conversation fetching
// Replace with your actual conversation API calls

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export async function fetchRecentConversations({ search = "" }: { search?: string } = {}): Promise<Conversation[]> {
  // Mock data for development
  const mockConversations = [
    {
      id: "conv-1",
      title: "Facebook Job Search",
      created_at: new Date().toISOString(),
    },
    {
      id: "conv-2", 
      title: "General Chat",
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: "conv-3",
      title: "MAAD Services Discussion", 
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter by search term if provided
  if (search) {
    return mockConversations.filter(conv => 
      conv.title.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  return mockConversations;
}