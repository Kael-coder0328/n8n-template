import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from './AuthContext'
import { authService } from '@/services/auth'

interface UserData {
  subscription: {
    status: string | null
    productId: number | null
    variantId: number | null
  }
  timestamp?: number // Add timestamp for freshness check
}

interface UserDataContextType {
  userData: UserData | null
  loading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
  forceRefreshUserData: () => Promise<void>
  clearUserData: () => void
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)

// Maximum age for cookie data (in milliseconds)
const MAX_COOKIE_AGE = 15 * 60 * 1000; // 15 minutes

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { auth, isAuthenticated } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)
  
  // Add refresh tracking to prevent infinite loops
  const refreshAttempts = useRef(0);
  const lastRefreshTime = useRef(0);
  const MAX_REFRESH_ATTEMPTS = 3;
  const REFRESH_COOLDOWN = 5000; // 5 seconds between refresh attempts

  /**
   * Checks if the provided userData contains valid subscription data
   * @param data The UserData object to validate
   * @returns boolean indicating if the data is valid
   */
  const isValidUserData = useCallback((data: UserData | null): boolean => {
    if (!data) return false;
    
    // Check for status - it should be a string (not null)
    // We consider 'none' a valid status that represents no subscription
    const hasValidStatus = typeof data.subscription?.status === 'string';
    
    // VariantId can be null for users with no subscription ('none' status)
    const hasValidVariantId = data.subscription?.status === 'none' || 
                             data.subscription?.variantId !== null;
    
    // Check timestamp for freshness if present
    const isFresh = !data.timestamp || (Date.now() - data.timestamp) < MAX_COOKIE_AGE;
    
    return hasValidStatus && hasValidVariantId && isFresh;
  }, []);

  /**
   * Clears user data by setting the state to null and removing the user-specific cookie
   */
  const clearUserData = useCallback(() => {
    setUserData(null)
    // Clear any potential user cookies
    document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict'
    // Also clear any user-specific cookies that might exist
    if (auth?.id) {
      document.cookie = `userData_${auth.id}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict`
    }
  }, [auth])

  /**
   * Fetches user data directly from the API, bypassing cookie cache
   * Use this when you need to ensure fresh data from the server
   */
  const fetchDirectFromAPI = useCallback(async (): Promise<UserData | null> => {
    if (!isAuthenticated || !auth || !auth.id) {
      return null;
    }
    
    try {
      // Call the verifyUser method directly instead of using get
      // The verifyUser method is specifically designed for this endpoint
      let subscriptionData;
      try {
        subscriptionData = await authService.verifyUser();
      } catch {
        // Fallback to regular get as a backup
        const response = await authService.get('/user/verify-user');
        subscriptionData = response;
      }
      
      // Handle null response from API - this is a valid state, not an error
      if (subscriptionData === null) {
        // Create default userData with explicit null values but mark it as valid with timestamp
        const defaultUserData: UserData = {
          subscription: {
            status: 'none',  // Use 'none' instead of null to indicate a known empty state
            productId: null,
            variantId: null
          },
          timestamp: Date.now()
        };
        return defaultUserData;
      }
      
      if (!subscriptionData) {
        return null;
      }
      
      // Add timestamp to track data freshness
      const newUserData = {
        subscription: {
          status: subscriptionData.status || 'none',  // Use 'none' instead of null
          productId: subscriptionData.product_id || null,
          variantId: subscriptionData.variant_id || null
        },
        timestamp: Date.now()
      };
      return newUserData;
    } catch {
      return null;
    }
  }, [isAuthenticated, auth]);

  /**
   * Fetches user data from either a user-specific cookie or the API
   * Ensures the cookie is associated with the current user ID
   */
  const fetchUserData = useCallback(async () => {
    if (!isAuthenticated || !auth || !auth.id) {
      clearUserData()
      return
    }

    try {
      setLoading(true)
      setError(null)

      const userId = auth.id
      // Try to get data from user-specific cookie first
      const userDataCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`userData_${userId}=`))
      
      if (userDataCookie) {
        try {
          const cookieData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]));
          
          // Validate the cookie data - if it contains null values or is too old, don't use it
          if (isValidUserData(cookieData)) {
            setUserData(cookieData)
            setLoading(false)
            return
          }
        } catch {
          // Handle cookie parsing error
        }
      }

      // Use the verifyUser method as it's specifically for this endpoint
      try {
        const subscriptionData = await authService.verifyUser();
        
        // Handle null response specifically - this is a valid state
        if (subscriptionData === null) {
          const newUserData: UserData = {
            subscription: {
              status: 'none',  // Use 'none' instead of null to indicate known empty state
              productId: null,
              variantId: null
            },
            timestamp: Date.now()
          };
          setUserData(newUserData);
          
          // Store in cookie to prevent repeated API calls for users with no subscription
          document.cookie = `userData_${userId}=${JSON.stringify(newUserData)}; path=/; max-age=3600; secure; samesite=strict`;
          return;
        }
        
        if (!subscriptionData) {
          throw new Error('Subscription data is undefined (but not null)');
        }

        // Normal case - API returned subscription data
        const newUserData: UserData = {
          subscription: {
            status: subscriptionData.status || 'none',
            productId: subscriptionData.product_id || null,
            variantId: subscriptionData.variant_id || null
          },
          timestamp: Date.now() // Add timestamp for freshness tracking
        };

        setUserData(newUserData);

        // Only store in cookie if we have valid data
        if (isValidUserData(newUserData)) {
          document.cookie = `userData_${userId}=${JSON.stringify(newUserData)}; path=/; max-age=3600; secure; samesite=strict`;
        }
      } catch (apiError) {
        throw apiError;
      }
      
      // Clear any old generic userData cookie
      document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict';

    } catch {
      setError('Failed to fetch user data')
      clearUserData()
    } finally {
      setLoading(false)
      setInitialLoadComplete(true)
    }
  }, [isAuthenticated, auth, clearUserData, isValidUserData])

  /**
   * Force refresh user data by clearing cookies and fetching directly from API
   * Use this when subscription status changes or you need to ensure fresh data
   */
  const forceRefreshUserData = useCallback(async () => {
    if (!isAuthenticated || !auth || !auth.id) {
      clearUserData();
      return;
    }
    
    // Prevent too many refresh attempts
    const now = Date.now();
    if (now - lastRefreshTime.current < REFRESH_COOLDOWN) {
      return;
    }
    
    if (refreshAttempts.current >= MAX_REFRESH_ATTEMPTS) {
      setError('Too many refresh attempts. Please try again later.');
      return;
    }
    
    // Update refresh tracking
    refreshAttempts.current++;
    lastRefreshTime.current = now;
    
    try {
      setLoading(true);
      setError(null);
      
      // First clear all existing cookies to force a fresh fetch
      const userId = auth.id;
      document.cookie = `userData_${userId}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict`;
      document.cookie = 'userData=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; samesite=strict';
      
      // Directly fetch new data from API
      const freshData = await fetchDirectFromAPI();
      
      if (freshData) {
        setUserData(freshData);
        // Save to cookie after verification
        if (isValidUserData(freshData)) {
          document.cookie = `userData_${userId}=${JSON.stringify(freshData)}; path=/; max-age=3600; secure; samesite=strict`;
          // Reset refresh attempts on successful data fetch
          refreshAttempts.current = 0;
        }
      } else {
        setUserData(null);
      }
    } catch  {
      setError('Failed to force refresh user data');
      clearUserData();
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, auth, clearUserData, fetchDirectFromAPI, isValidUserData]);

  // Reset refresh attempts when auth changes
  useEffect(() => {
    refreshAttempts.current = 0;
    lastRefreshTime.current = 0;
  }, [auth]);

  // Auto-refresh if the data is null after initial load, with safety checks
  useEffect(() => {
    if (
      initialLoadComplete && 
      userData && 
      !isValidUserData(userData) && 
      refreshAttempts.current < MAX_REFRESH_ATTEMPTS && 
      Date.now() - lastRefreshTime.current > REFRESH_COOLDOWN
    ) {
      forceRefreshUserData();
    }
  }, [initialLoadComplete, userData, forceRefreshUserData, isValidUserData]);

  // Initialize user data on authentication change
  useEffect(() => {
    if (isAuthenticated && auth) {
      fetchUserData()
    } else if (!isAuthenticated) {
      clearUserData()
    }
  }, [isAuthenticated, auth, fetchUserData, clearUserData])

  /**
   * Public method to trigger a refresh of user data
   */
  const refreshUserData = useCallback(async () => {
    // Reset refresh counters on manual refresh
    refreshAttempts.current = 0;
    await fetchUserData()
  }, [fetchUserData])

  return (
    <UserDataContext.Provider value={{ 
      userData, 
      loading, 
      error, 
      refreshUserData, 
      forceRefreshUserData,
      clearUserData 
    }}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider')
  }
  return context
} 