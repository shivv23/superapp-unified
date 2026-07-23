package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"

	"github.com/superapp-unified/portfolio/internal/config"
	"github.com/superapp-unified/portfolio/internal/handler"
	"github.com/superapp-unified/portfolio/internal/repository"
)

func main() {
	cfg := config.Load()

	store := repository.NewStore()
	h := handler.New(store)

	r := chi.NewRouter()

	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(h.Logger)
	r.Use(h.CORS)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.Heartbeat("/ping"))

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", h.Health)
		r.Get("/portfolio/summary", h.Summary)
		r.Get("/portfolio/holdings", h.Holdings)
		r.Get("/portfolio/asset-allocation", h.AssetAllocation)
		r.Get("/portfolio/performance", h.Performance)
		r.Get("/portfolio/transactions", h.Transactions)
		r.Get("/portfolio/risk-profile", h.RiskProfile)
		r.Get("/portfolio/tax-analysis", h.TaxAnalysis)
		r.Get("/portfolio/health-score", h.HealthScore)
		r.Get("/portfolio/us-stocks", h.USStocks)
		r.Get("/portfolio/options-chain", h.OptionsChain)
	})

	srv := &http.Server{
		Addr:         cfg.Addr(),
		Handler:      r,
		ReadTimeout:  time.Duration(cfg.ReadTimeout) * time.Second,
		WriteTimeout: time.Duration(cfg.WriteTimeout) * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		fmt.Printf("Portfolio service starting on %s\n", cfg.Addr())
		fmt.Printf("Endpoints available:\n")
		fmt.Printf("  GET  /api/v1/health\n")
		fmt.Printf("  GET  /api/v1/portfolio/summary\n")
		fmt.Printf("  GET  /api/v1/portfolio/holdings\n")
		fmt.Printf("  GET  /api/v1/portfolio/asset-allocation\n")
		fmt.Printf("  GET  /api/v1/portfolio/performance\n")
		fmt.Printf("  GET  /api/v1/portfolio/transactions\n")
		fmt.Printf("  GET  /api/v1/portfolio/risk-profile\n")
		fmt.Printf("  GET  /api/v1/portfolio/tax-analysis\n")
		fmt.Printf("  GET  /api/v1/portfolio/health-score\n")
		fmt.Printf("  GET  /api/v1/portfolio/us-stocks\n")
		fmt.Printf("  GET  /api/v1/portfolio/options-chain\n")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	<-ctx.Done()
	fmt.Println("\nShutting down gracefully...")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Forced shutdown: %v", err)
	}
	fmt.Println("Server stopped")
}
