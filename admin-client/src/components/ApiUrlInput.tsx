import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl, setApiUrl, clearApiUrl, isApiUrlManuallySet, getApiUrlHistory } from '@/lib/config';

/**
 * Component for inputting the backend API URL
 * Allows users to connect to different backend instances
 */
export default function ApiUrlInput({ redirectPath = '/login' }: { redirectPath?: string }) {
  const [apiUrl, setApiUrlState] = useState('');
  const [error, setError] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isAlreadySet, setIsAlreadySet] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [urlHistory, setUrlHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load current API URL and history on component mount
  useEffect(() => {
    const currentApiUrl = getApiUrl();
    setApiUrlState(currentApiUrl);
    setIsAlreadySet(isApiUrlManuallySet());
    setUrlHistory(getApiUrlHistory());
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Select a suggestion from history
   */
  const selectSuggestion = (url: string) => {
    setApiUrlState(url);
    setShowSuggestions(false);
    // Focus the input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  /**
   * Test the connection to make sure the API URL is valid
   */
  const testConnection = async () => {
    if (!apiUrl) {
      setError('Please enter an API URL');
      return false;
    }

    try {
      setIsTesting(true);
      setError('');
      
      // Remove trailing slash if present
      const cleanUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
      
      // Test the connection with a simple request to the server health endpoint
      const response = await fetch(`${cleanUrl}/admin/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Could not connect to the API');
      }

      return true;
    } catch (err) {
      setError('Failed to connect to API. Please check the URL and try again.');
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  /**
   * Save the API URL and redirect to login page
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure URL has http:// or https:// prefix
    let formattedUrl = apiUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `http://${formattedUrl}`;
      setApiUrlState(formattedUrl);
    }
    
    // Test connection before saving
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Save the API URL to localStorage
      setApiUrl(formattedUrl);
      // Update our local history state
      setUrlHistory([formattedUrl, ...urlHistory.filter(url => url !== formattedUrl).slice(0, 4)]);
      // Redirect to login page or specified path
      router.push(redirectPath);
    }
  };

  /**
   * Reset the API URL configuration
   */
  const handleReset = () => {
    clearApiUrl();
    setIsAlreadySet(false);
    setApiUrlState('');
  };

  /**
   * Continue with the existing API URL
   */
  const handleContinue = () => {
    router.push(redirectPath);
  };

  // If the API URL is already set, show a message with options to continue or reset
  if (isAlreadySet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Backend API Connection</h1>
          
          <div className="mb-6">
            <p className="text-gray-700 mb-2">You are currently connected to:</p>
            <div className="bg-blue-50 p-3 rounded-md text-blue-700 font-mono break-all">
              {apiUrl}
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleContinue}
              className="flex-1 bg-blue-600 px-4 py-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 px-4 py-2 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Change API
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Connect to Backend</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label htmlFor="apiUrl" className="mb-2 block text-sm font-medium text-gray-700">
              Backend API URL
            </label>
            <div className="relative">
              <input
                id="apiUrl"
                type="text"
                ref={inputRef}
                value={apiUrl}
                onChange={(e) => setApiUrlState(e.target.value)}
                onFocus={() => urlHistory.length > 0 && setShowSuggestions(true)}
                placeholder="http://localhost:8080"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />

              {showSuggestions && urlHistory.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-auto"
                >
                  {urlHistory.map((url, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(url)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm font-mono truncate border-b border-gray-100 last:border-b-0"
                    >
                      {url}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter the URL of your backend API server
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isTesting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isTesting ? 'Testing Connection...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
} 