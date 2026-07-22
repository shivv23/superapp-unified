package main

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/superapp-unified/auth/internal/config"
	"github.com/superapp-unified/auth/internal/handler"
	"github.com/superapp-unified/auth/internal/middleware"
	"github.com/superapp-unified/auth/internal/model"
	"github.com/superapp-unified/auth/internal/repository"
	"github.com/superapp-unified/auth/internal/service"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	cfg := config.Load()

	repo := repository.NewInMemoryUserRepository()
	authService := service.NewAuthService(repo, cfg)
	authHandler := handler.NewAuthHandler(authService)

	r := chi.NewRouter()

	r.Use(middleware.CORS(cfg.CORSAllowedOrigins))
	r.Use(middleware.RateLimiter(cfg.RateLimitPerMinute))

	r.Get("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(model.APIResponse{
			Status: "success",
			Data: map[string]interface{}{
				"service": "auth",
				"version": "1.0.0",
				"status":  "healthy",
			},
		})
	})

	authHandler.RegisterRoutes(r)

	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		slog.Info("auth service starting", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	<-stop
	slog.Info("shutting down auth service")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("shutdown error", "error", err)
		os.Exit(1)
	}

	slog.Info("auth service stopped")
}
