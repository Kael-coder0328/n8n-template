// Package middleware provides HTTP middleware functions for the application
package middleware

import (
	"net/http"
	"sync"
	"time"
)

// RateLimiter implements rate limiting for API endpoints
type RateLimiter struct {
	window    time.Duration
	limit     int
	attempts  map[string]*ClientAttempts
	mutex     sync.RWMutex
	cleanupInterval time.Duration
}

// ClientAttempts tracks rate limiting data for a client
type ClientAttempts struct {
	count    int
	windowStart time.Time
}

// NewRateLimiter creates a new rate limiter instance
func NewRateLimiter(window time.Duration, limit int) *RateLimiter {
	rl := &RateLimiter{
		window:    window,
		limit:     limit,
		attempts:  make(map[string]*ClientAttempts),
		cleanupInterval: time.Hour,
	}

	// Start cleanup routine
	go rl.cleanup()

	return rl
}

// cleanup periodically removes expired entries
func (rl *RateLimiter) cleanup() {
	for {
		time.Sleep(rl.cleanupInterval)
		rl.mutex.Lock()
		now := time.Now()
		for ip, attempts := range rl.attempts {
			if now.Sub(attempts.windowStart) > rl.window {
				delete(rl.attempts, ip)
			}
		}
		rl.mutex.Unlock()
	}
}

// Limit is middleware that limits request rates by IP
// RateLimiter middleware implements a token bucket algorithm for rate limiting
// It tracks request rates per IP address and enforces configurable rate limits
// The implementation uses a concurrent map to store bucket states
// and periodically cleans up inactive buckets to prevent memory leaks
func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		rl.mutex.Lock()
		now := time.Now()

		// Get or create client attempts
		attempts, exists := rl.attempts[ip]
		if !exists || now.Sub(attempts.windowStart) > rl.window {
			rl.attempts[ip] = &ClientAttempts{
				count:    1,
				windowStart: now,
			}
		} else {
			attempts.count++
			if attempts.count > rl.limit {
				rl.mutex.Unlock()
				w.Header().Set("Retry-After", time.Now().Add(rl.window).Format(time.RFC1123))
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}
		}

		rl.mutex.Unlock()
		next.ServeHTTP(w, r)
	})
}