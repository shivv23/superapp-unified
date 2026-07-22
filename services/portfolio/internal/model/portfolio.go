package model

import "time"

type AssetType string

const (
	AssetEquity AssetType = "equity"
	AssetMF     AssetType = "mf"
	AssetBond   AssetType = "bond"
	AssetREIT   AssetType = "reit"
	AssetInvIT  AssetType = "invit"
	AssetGold   AssetType = "gold"
)

type TransactionType string

const (
	TxBuy  TransactionType = "buy"
	TxSell TransactionType = "sell"
)

type RiskLevel string

const (
	RiskConservative RiskLevel = "conservative"
	RiskModerate     RiskLevel = "moderate"
	RiskAggressive   RiskLevel = "aggressive"
)

type Holding struct {
	ID           string    `json:"id"`
	Symbol       string    `json:"symbol"`
	Name         string    `json:"name"`
	Type         AssetType `json:"type"`
	Quantity     float64   `json:"quantity"`
	AvgPrice     float64   `json:"avg_price"`
	LTP          float64   `json:"ltp"`
	InvestedVal  float64   `json:"invested_value"`
	CurrentVal   float64   `json:"current_value"`
	PnL          float64   `json:"pnl"`
	ReturnsPct   float64   `json:"returns_pct"`
	DayChangePct float64   `json:"day_change_pct"`
}

type PortfolioSummary struct {
	TotalInvested  float64 `json:"total_invested"`
	CurrentValue   float64 `json:"current_value"`
	OverallPnL     float64 `json:"overall_pnl"`
	DayChange      float64 `json:"day_change"`
	DayChangePct   float64 `json:"day_change_pct"`
	TotalReturnsPct float64 `json:"total_returns_pct"`
}

type Allocation struct {
	Type       AssetType `json:"type"`
	Value      float64   `json:"value"`
	Percentage float64   `json:"percentage"`
}

type PerformancePoint struct {
	Month          string  `json:"month"`
	InvestedValue  float64 `json:"invested_value"`
	PortfolioValue float64 `json:"portfolio_value"`
}

type Transaction struct {
	ID       string          `json:"id"`
	Type     TransactionType `json:"type"`
	Symbol   string          `json:"symbol"`
	Name     string          `json:"name"`
	Quantity float64         `json:"quantity"`
	Price    float64         `json:"price"`
	Total    float64         `json:"total"`
	Date     time.Time       `json:"date"`
}

type RiskFactor struct {
	Name        string  `json:"name"`
	Score       float64 `json:"score"`
	Description string  `json:"description"`
}

type RiskProfile struct {
	RiskScore float64      `json:"risk_score"`
	RiskLevel RiskLevel    `json:"risk_level"`
	Factors   []RiskFactor `json:"factors"`
}

type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
}
