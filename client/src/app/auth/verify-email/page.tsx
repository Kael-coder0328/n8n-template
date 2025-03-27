'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

interface VerificationState {
  status: VerificationStatus;
  error: string | null;
  isAlreadyVerified: boolean;
}

/**
 * VerifyEmail component handles the email verification process.
 * It checks the verification token, updates the authentication state,
 * and provides user feedback based on the verification status.
 */
export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const { auth, setAuth } = useAuth();
  const [state, setState] = useState<VerificationState>({
    status: 'idle',
    error: null,
    isAlreadyVerified: false
  });
  
  // Refs to track if verification has been attempted and to manage navigation timeout
  const hasAttemptedRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null); 

  // Cleanup function for navigation timeout
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);

  // Handle successful verification and navigation
  useEffect(() => {
    if (state.status === 'success') {
      const currentAuth = auth;
      
      // Clear any existing navigation timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      try {
        if (currentAuth) {
          // Update auth state before navigation
          setAuth({ ...currentAuth, emailVerified: true });
          toast.success(
            state.isAlreadyVerified 
              ? 'Your email is already verified!' 
              : 'Email verified successfully!'
          );
          
          // Use window.location for more reliable navigation
          // Store the timeout ID to clear it if needed
          const timeoutId = setTimeout(() => {
            window.location.href = '/profile';
          }, 1500);
          navigationTimeoutRef.current = timeoutId;
        } else {
          toast.success('Email verified successfully! Please log in.');
          
          // Use window.location for more reliable navigation
          // Store the timeout ID to clear it if needed
          const timeoutId = setTimeout(() => {
            window.location.href = '/auth';
          }, 1500);
          navigationTimeoutRef.current = timeoutId;
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback to immediate navigation if timeout fails
        window.location.href = currentAuth ? '/profile' : '/auth';
      }
    }
  // Remove router from dependencies since we're using window.location.href directly
  }, [state.status, state.isAlreadyVerified, auth, setAuth]);

  // Handle verification process
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setState({
        status: 'error',
        error: 'Verification token is missing. Please check your verification link.',
        isAlreadyVerified: false
      });
      return;
    }

    // Create a flag to track if the component is mounted
    let isMounted = true;

    const verifyEmail = async () => {
      if (hasAttemptedRef.current) {
        return;
      }
      hasAttemptedRef.current = true;
      
      // Only update state if component is still mounted
      if (isMounted) {
        setState(prev => ({ ...prev, status: 'verifying', error: null }));
      }

      try {
        await authService.verifyEmail(token);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setState(prev => ({ 
            ...prev,
            status: 'success',
            error: null,
            isAlreadyVerified: false
          }));
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error 
          ? err.message
          : 'An unexpected error occurred during verification';
        
        // Only proceed if component is still mounted
        if (!isMounted) return;
        
        if (errorMessage.includes('already used')) {
          setState(prev => ({ 
            ...prev,
            status: 'success',
            error: null,
            isAlreadyVerified: true
          }));
          return;
        }

        setState(prev => ({
          ...prev,
          status: 'error',
          error: errorMessage,
          isAlreadyVerified: false
        }));
        toast.error(errorMessage);
      }
    };

    verifyEmail();

    // Cleanup function to prevent state updates if unmounted
    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {state.status === 'verifying' && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Verifying Your Email</h2>
            <p className="text-gray-600 mb-4">Please wait while we verify your email address...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </>
        )}

        {state.status === 'success' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              {state.isAlreadyVerified ? 'Email Already Verified' : 'Email Verified!'}
            </h2>
            <p className="text-gray-600">
              {auth 
                ? 'Redirecting you to your profile...'
                : 'Redirecting you to login...'}
            </p>
          </>
        )}

        {state.status === 'error' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">Verification Failed</h2>
            <p className="text-gray-600 mb-4">{state.error}</p>
            <p className="text-gray-600 mt-4">
              If you continue to have issues, please request a new verification email from your profile settings.
            </p>
          </>
        )}
      </div>
    </div>
  );
} 