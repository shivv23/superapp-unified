package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/superapp-unified/auth/internal/model"
	"github.com/superapp-unified/auth/internal/service"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func AuthMiddleware(authService *service.AuthService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				writeJSON(w, http.StatusUnauthorized, model.APIResponse{
					Status:  "error",
					Message: "authorization header required",
				})
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				writeJSON(w, http.StatusUnauthorized, model.APIResponse{
					Status:  "error",
					Message: "invalid authorization format",
				})
				return
			}

			userID, err := authService.ValidateAccessToken(parts[1])
			if err != nil {
				writeJSON(w, http.StatusUnauthorized, model.APIResponse{
					Status:  "error",
					Message: "invalid or expired token",
				})
				return
			}

			ctx := context.WithValue(r.Context(), UserIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RateLimiter(requestsPerMinute int) func(http.Handler) http.Handler {
	type client struct {
		count     int
		resetAt   time.Time
	}

	var mu sync.Mutex
	clients := make(map[string]*client)

	go func() {
		for {
			time.Sleep(time.Minute)
			mu.Lock()
			now := time.Now()
			for ip, c := range clients {
				if now.After(c.resetAt) {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
				ip = strings.Split(forwarded, ",")[0]
			}

			mu.Lock()
			c, exists := clients[ip]
			now := time.Now()

			if !exists || now.After(c.resetAt) {
				clients[ip] = &client{
					count:   1,
					resetAt: now.Add(time.Minute),
				}
				mu.Unlock()
				next.ServeHTTP(w, r)
				return
			}

			c.count++
			if c.count > requestsPerMinute {
				mu.Unlock()
				w.Header().Set("Retry-After", "60")
				writeJSON(w, http.StatusTooManyRequests, model.APIResponse{
					Status:  "error",
					Message: "rate limit exceeded, try again later",
				})
				return
			}
			mu.Unlock()

			next.ServeHTTP(w, r)
		})
	}
}

func CORS(allowedOrigins []string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			allowed := false
			for _, o := range allowedOrigins {
				if o == "*" || o == origin {
					allowed = true
					break
				}
			}

			if allowed {
				if len(allowedOrigins) == 1 && allowedOrigins[0] == "*" {
					w.Header().Set("Access-Control-Allow-Origin", "*")
				} else {
					w.Header().Set("Access-Control-Allow-Origin", origin)
				}
			}

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Max-Age", "86400")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}
