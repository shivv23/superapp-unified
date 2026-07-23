package model

import "time"

type AssetType string

const (
	AssetEquity  AssetType = "equity"
	AssetMF      AssetType = "mf"
	AssetBond    AssetType = "bond"
	AssetREIT    AssetType = "reit"
	AssetInvIT   AssetType = "invit"
	AssetGold    AssetType = "gold"
	AssetUSStock AssetType = "us_stock"
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
	Currency     string    `json:"currency,omitempty"`
}

type PortfolioSummary struct {
	TotalInvested   float64 `json:"total_invested"`
	CurrentValue    float64 `json:"current_value"`
	OverallPnL      float64 `json:"overall_pnl"`
	DayChange       float64 `json:"day_change"`
	DayChangePct    float64 `json:"day_change_pct"`
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

type TaxHolding struct {
	ID            string  `json:"id"`
	Symbol        string  `json:"symbol"`
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	BuyPrice      float64 `json:"buy_price"`
	CurrentPrice  float64 `json:"current_price"`
	Quantity      float64 `json:"quantity"`
	LossAmount    float64 `json:"loss_amount"`
	TaxSaving     float64 `json:"tax_saving"`
	HoldingPeriod string  `json:"holding_period"`
}

type TaxAnalysis struct {
	TotalLTCG            float64       `json:"total_ltcg"`
	TotalSTCG            float64       `json:"total_stcg"`
	LTCGExempted         float64       `json:"ltcg_exempted"`
	LTCGExemptionUsed    float64       `json:"ltcg_exemption_used"`
	LTCGExemptionRemain  float64       `json:"ltcg_exemption_remaining"`
	STCGTaxRate          float64       `json:"stcg_tax_rate"`
	LTCGTaxRate          float64       `json:"ltcg_tax_rate"`
	HarvestableLosses    []TaxHolding  `json:"harvestable_losses"`
	TotalHarvestableLoss float64       `json:"total_harvestable_loss"`
	EstimatedTaxSaving   float64       `json:"estimated_tax_saving"`
	EstimatedTaxLiability float64      `json:"estimated_tax_liability"`
	TaxSavedThisYear     float64       `json:"tax_saved_this_year"`
}

type HealthScoreCategory struct {
	Name        string  `json:"name"`
	Score       float64 `json:"score"`
	Description string  `json:"description"`
}

type HealthIssue struct {
	Severity    string `json:"severity"`
	Category    string `json:"category"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

type HealthRecommendation struct {
	Title       string `json:"title"`
	Category    string `json:"category"`
	Priority    string `json:"priority"`
	Description string `json:"description"`
}

type PortfolioHealth struct {
	OverallScore    float64                `json:"overall_score"`
	Grade           string                 `json:"grade"`
	GradeDescription string               `json:"grade_description"`
	Categories      []HealthScoreCategory  `json:"categories"`
	Issues          []HealthIssue          `json:"issues"`
	Recommendations []HealthRecommendation `json:"recommendations"`
	Summary         PortfolioSummary       `json:"summary"`
}

type OptionsGreeks struct {
	Delta  float64 `json:"delta"`
	Gamma  float64 `json:"gamma"`
	Theta  float64 `json:"theta"`
	Vega   float64 `json:"vega"`
	Rho    float64 `json:"rho"`
}

type OptionsStrike struct {
	Strike       float64       `json:"strike"`
	IsATM        bool          `json:"is_atm"`
	CallOI       float64       `json:"call_oi"`
	CallChgOI    float64       `json:"call_chg_oi"`
	CallIV       float64       `json:"call_iv"`
	CallLTP      float64       `json:"call_ltp"`
	PutLTP       float64       `json:"put_ltp"`
	PutIV        float64       `json:"put_iv"`
	PutChgOI     float64       `json:"put_chg_oi"`
	PutOI        float64       `json:"put_oi"`
	CallGreeks   OptionsGreeks `json:"call_greeks"`
	PutGreeks    OptionsGreeks `json:"put_greeks"`
}

type OptionsChain struct {
	Underlying  string          `json:"underlying"`
	SpotPrice   float64         `json:"spot_price"`
	DayChange   float64         `json:"day_change"`
	DayChangePct float64        `json:"day_change_pct"`
	Expiry      string          `json:"expiry"`
	Strikes     []OptionsStrike `json:"strikes"`
}
