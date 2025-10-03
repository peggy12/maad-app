import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSearchFacebookJobs } from './searchFacebookJobs';

interface JobPost {
  id: string;
  message: string;
  created_time: string;
  permalink_url?: string;
  from?: {
    name: string;
    id: string;
  };
  jobScore: number;
  matchedKeywords: string[];
}

interface FacebookJobSearchProps {
  pageId?: string;
  accessToken?: string;
}

export function FacebookJobSearch({ pageId, accessToken }: FacebookJobSearchProps) {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    pageId: pageId || '',
    accessToken: accessToken || '',
    limit: 25,
    minJobScore: 0.3
  });

  const { searchJobs } = useSearchFacebookJobs();

  const handleSearch = useCallback(async () => {
    if (!searchParams.pageId || !searchParams.accessToken) {
      toast.error('Please provide both Page ID and Access Token');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await searchJobs({
        pageId: searchParams.pageId,
        accessToken: searchParams.accessToken,
        limit: searchParams.limit,
        minJobScore: searchParams.minJobScore
      });

      if (result.success) {
        setJobs(result.jobs);
        toast.success(`Found ${result.jobs.length} job posts out of ${result.totalPosts} total posts`);
      } else {
        toast.error(`Search failed: ${result.error}`);
        setJobs([]);
      }
    } catch (error) {
      toast.error('Search failed: ' + (error instanceof Error ? error.message : String(error)));
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchJobs, searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Facebook Job Search</h1>
      
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook Page ID
            </label>
            <input
              type="text"
              value={searchParams.pageId}
              onChange={(e) => setSearchParams(prev => ({ ...prev, pageId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Facebook Page ID"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token
            </label>
            <input
              type="password"
              value={searchParams.accessToken}
              onChange={(e) => setSearchParams(prev => ({ ...prev, accessToken: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Facebook Access Token"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limit (max 100)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={searchParams.limit}
              onChange={(e) => setSearchParams(prev => ({ ...prev, limit: parseInt(e.target.value) || 25 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Job Score (0-1)
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={searchParams.minJobScore}
              onChange={(e) => setSearchParams(prev => ({ ...prev, minJobScore: parseFloat(e.target.value) || 0.3 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search for Jobs'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {jobs.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            No job posts found. Try adjusting your search parameters.
          </div>
        )}
        
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {job.from?.name || 'Unknown Page'}
                </h3>
                <p className="text-sm text-gray-500">{formatDate(job.created_time)}</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getScoreColor(job.jobScore)}`}>
                  Job Score: {(job.jobScore * 100).toFixed(1)}%
                </div>
                {job.permalink_url && (
                  <a
                    href={job.permalink_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Post
                  </a>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{job.message}</p>
            </div>
            
            {job.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Keywords:</span>
                {job.matchedKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}