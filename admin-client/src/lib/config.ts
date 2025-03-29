// Get API URL from localStorage first, then fall back to environment variable
export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const storedApiUrl = localStorage.getItem('adminApiUrl');
    if (storedApiUrl) return storedApiUrl;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
};

export const setApiUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('adminApiUrl', url);
    // Set a flag to indicate the user has manually set the API URL
    localStorage.setItem('adminApiUrlSet', 'true');
    // Add to URL history
    addApiUrlToHistory(url);
  }
};

export const clearApiUrl = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminApiUrl');
    localStorage.removeItem('adminApiUrlSet');
  }
};

// Check if the API URL was manually set by the user
export const isApiUrlManuallySet = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminApiUrlSet') === 'true';
  }
  return false;
};

// Add API URL to history
export const addApiUrlToHistory = (url: string) => {
  if (typeof window !== 'undefined') {
    try {
      // Get existing history
      const historyJson = localStorage.getItem('adminApiUrlHistory') || '[]';
      const history: string[] = JSON.parse(historyJson);
      
      // Remove the URL if it already exists to avoid duplicates
      const filteredHistory = history.filter(item => item !== url);
      
      // Add new URL to the beginning of the array (most recent first)
      filteredHistory.unshift(url);
      
      // Limit history to 5 items
      const limitedHistory = filteredHistory.slice(0, 5);
      
      // Save back to localStorage
      localStorage.setItem('adminApiUrlHistory', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error adding URL to history:', error);
    }
  }
};

// Get API URL history
export const getApiUrlHistory = (): string[] => {
  if (typeof window !== 'undefined') {
    try {
      const historyJson = localStorage.getItem('adminApiUrlHistory') || '[]';
      return JSON.parse(historyJson);
    } catch (error) {
      console.error('Error getting URL history:', error);
      return [];
    }
  }
  return [];
};

// Clear API URL history
export const clearApiUrlHistory = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('adminApiUrlHistory');
  }
};

export const API_URL = getApiUrl();
export const APP_NAME = 'Admin Dashboard'; 