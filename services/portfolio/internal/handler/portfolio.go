package handler

import (
	"encoding/json"
	"math"
	"net/http"
	"sync"
	"time"

	"github.com/superapp-unified/portfolio/internal/model"
	"github.com/superapp-unified/portfolio/internal/repository"
)

type Handler struct {
	store *repository.Store
}

func New(store *repository.Store) *Handler {
	return &Handler{store: store}
}

func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func successResponse(data interface{}) map[string]interface{} {
	return map[string]interface{}{
		"status": "success",
		"data":   data,
	}
}

func errorResponse(message string) map[string]interface{} {
	return map[string]interface{}{
		"status":  "error",
		"message": message,
	}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, model.HealthResponse{
		Status:  "healthy",
		Service: "portfolio-aggregation",
		Version: "1.0.0",
	})
}

func (h *Handler) Summary(w http.ResponseWriter, r *http.Request) {
	holdings := h.store.GetHoldings()

	var mu sync.Mutex
	var wg sync.WaitGroup

	var totalInvested, currentValue, dayChange float64

	for i := range holdings {
		wg.Add(1)
		go func(holding *model.Holding) {
			defer wg.Done()
			mu.Lock()
			defer mu.Unlock()
			totalInvested += holding.InvestedVal
			currentValue += holding.CurrentVal
			dayChange += (holding.CurrentVal * holding.DayChangePct) / (100 + holding.DayChangePct)
		}(&holdings[i])
	}
	wg.Wait()

	overallPnL := currentValue - totalInvested
	dayChangePct := 0.0
	if (currentValue - dayChange) > 0 {
		dayChangePct = (dayChange / (currentValue - dayChange)) * 100
	}
	totalReturnsPct := 0.0
	if totalInvested > 0 {
		totalReturnsPct = (overallPnL / totalInvested) * 100
	}

	summary := model.PortfolioSummary{
		TotalInvested:   math.Round(totalInvested*100) / 100,
		CurrentValue:    math.Round(currentValue*100) / 100,
		OverallPnL:      math.Round(overallPnL*100) / 100,
		DayChange:       math.Round(dayChange*100) / 100,
		DayChangePct:    math.Round(dayChangePct*100) / 100,
		TotalReturnsPct: math.Round(totalReturnsPct*100) / 100,
	}

	writeJSON(w, http.StatusOK, successResponse(summary))
}

func (h *Handler) Holdings(w http.ResponseWriter, r *http.Request) {
	holdings := h.store.GetHoldings()
	writeJSON(w, http.StatusOK, successResponse(holdings))
}

func (h *Handler) AssetAllocation(w http.ResponseWriter, r *http.Request) {
	holdings := h.store.GetHoldings()

	typeMap := make(map[model.AssetType]float64)
	var total float64

	for _, holding := range holdings {
		typeMap[holding.Type] += holding.CurrentVal
		total += holding.CurrentVal
	}

	allocations := make([]model.Allocation, 0, len(typeMap))
	for t, val := range typeMap {
		pct := 0.0
		if total > 0 {
			pct = (val / total) * 100
		}
		allocations = append(allocations, model.Allocation{
			Type:       t,
			Value:      math.Round(val*100) / 100,
			Percentage: math.Round(pct*100) / 100,
		})
	}

	writeJSON(w, http.StatusOK, successResponse(allocations))
}

func (h *Handler) Performance(w http.ResponseWriter, r *http.Request) {
	performance := h.store.GetPerformance()
	writeJSON(w, http.StatusOK, successResponse(performance))
}

func (h *Handler) Transactions(w http.ResponseWriter, r *http.Request) {
	transactions := h.store.GetTransactions()
	writeJSON(w, http.StatusOK, successResponse(transactions))
}

func (h *Handler) RiskProfile(w http.ResponseWriter, r *http.Request) {
	holdings := h.store.GetHoldings()

	equityVal, debtVal, altVal, totalVal := 0.0, 0.0, 0.0, 0.0
	for _, holding := range holdings {
		totalVal += holding.CurrentVal
		switch holding.Type {
		case model.AssetEquity, model.AssetMF:
			equityVal += holding.CurrentVal
		case model.AssetBond:
			debtVal += holding.CurrentVal
		default:
			altVal += holding.CurrentVal
		}
	}

	equityPct, debtPct, altPct := 0.0, 0.0, 0.0
	if totalVal > 0 {
		equityPct = (equityVal / totalVal) * 100
		debtPct = (debtVal / totalVal) * 100
		altPct = (altVal / totalVal) * 100
	}

	concentrationScore := h.computeConcentration(holdings, totalVal)
	volatilityScore := math.Min(equityPct*0.8+altPct*0.5, 100)
	liquidityScore := math.Min((debtPct*0.3+altPct*0.7)*1.2, 100)

	overallScore := math.Round((concentrationScore*0.25 + volatilityScore*0.50 + liquidityScore*0.25) * 100) / 100

	riskLevel := model.RiskConservative
	if overallScore > 60 {
		riskLevel = model.RiskAggressive
	} else if overallScore > 35 {
		riskLevel = model.RiskModerate
	}

	profile := model.RiskProfile{
		RiskScore: overallScore,
		RiskLevel: riskLevel,
		Factors: []model.RiskFactor{
			{
				Name:        "Diversification",
				Score:       math.Round(concentrationScore*100) / 100,
				Description: h.diversificationDesc(concentrationScore),
			},
			{
				Name:        "Equity Exposure",
				Score:       math.Round(volatilityScore*100) / 100,
				Description: h.equityExposureDesc(equityPct),
			},
			{
				Name:        "Liquidity Risk",
				Score:       math.Round(liquidityScore*100) / 100,
				Description: h.liquidityDesc(altPct),
			},
		},
	}

	writeJSON(w, http.StatusOK, successResponse(profile))
}

func (h *Handler) computeConcentration(holdings []model.Holding, total float64) float64 {
	if total == 0 {
		return 0
	}
	herfindahl := 0.0
	for _, holding := range holdings {
		share := holding.CurrentVal / total
		herfindahl += share * share
	}
	numAssets := float64(len(holdings))
	if numAssets == 0 {
		return 0
	}
	normalized := herfindahl * numAssets
	if normalized > 100 {
		normalized = 100
	}
	return 100 - normalized
}

func (h *Handler) diversificationDesc(score float64) string {
	switch {
	case score > 70:
		return "Well diversified across asset classes and sectors"
	case score > 40:
		return "Moderately diversified with room for improvement"
	default:
		return "Concentrated portfolio - consider diversifying"
	}
}

func (h *Handler) equityExposureDesc(pct float64) string {
	switch {
	case pct > 70:
		return "High equity allocation indicates aggressive growth orientation"
	case pct > 40:
		return "Balanced equity allocation suitable for moderate risk appetite"
	default:
		return "Low equity allocation providing stability and capital preservation"
	}
}

func (h *Handler) liquidityDesc(altPct float64) string {
	switch {
	case altPct > 30:
		return "Significant allocation to illiquid alternative assets"
	case altPct > 15:
		return "Moderate alternative asset allocation with adequate liquidity"
	default:
		return "Minimal exposure to illiquid assets"
	}
}

func (h *Handler) Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &statusResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(wrapped, r)
		duration := time.Since(start)
		logEntry := map[string]interface{}{
			"method":      r.Method,
			"path":        r.URL.Path,
			"status":      wrapped.statusCode,
			"duration_ms": duration.Milliseconds(),
			"remote_addr": r.RemoteAddr,
			"timestamp":   time.Now().UTC().Format(time.RFC3339),
		}
		logJSON, _ := json.Marshal(logEntry)
		if wrapped.statusCode >= 400 {
			writeLog("ERROR", string(logJSON))
		} else {
			writeLog("INFO", string(logJSON))
		}
	})
}

func (h *Handler) CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

type statusResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (w *statusResponseWriter) WriteHeader(code int) {
	w.statusCode = code
	w.ResponseWriter.WriteHeader(code)
}

func writeLog(level, msg string) {
	entry := map[string]interface{}{
		"level":     level,
		"message":   msg,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}
	logLine, _ := json.Marshal(entry)
	_ = logLine
	// Structured log output - in production this would go to a log aggregator
}
