package repository

import (
	"fmt"
	"math"
	"math/rand"
	"sync"
	"time"

	"github.com/superapp-unified/portfolio/internal/model"
	"github.com/superapp-unified/portfolio/internal/yahoo"
)

type Store struct {
	mu           sync.RWMutex
	holdings     []model.Holding
	transactions []model.Transaction
	performance  []model.PerformancePoint
	lastRefresh  time.Time
}

func NewStore() *Store {
	s := &Store{}
	s.seedData()
	s.fetchLivePrices()
	go s.periodicRefresh()
	return s
}

func (s *Store) GetHoldings() []model.Holding {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]model.Holding, len(s.holdings))
	copy(out, s.holdings)
	return out
}

func (s *Store) GetTransactions() []model.Transaction {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]model.Transaction, len(s.transactions))
	copy(out, s.transactions)
	return out
}

func (s *Store) GetPerformance() []model.PerformancePoint {
	s.mu.RLock()
	defer s.mu.RUnlock()
	out := make([]model.PerformancePoint, len(s.performance))
	copy(out, s.performance)
	return out
}

func (s *Store) LastRefreshTime() time.Time {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.lastRefresh
}

func (s *Store) fetchLivePrices() {
	symbols := make([]string, 0, len(s.holdings))
	for _, h := range s.holdings {
		if yahoo.IsIndianEquity(h.Symbol) || yahoo.IsUSStock(h.Symbol) {
			symbols = append(symbols, h.Symbol)
		}
	}

	fmt.Printf("[yahoo] Fetching live prices for %d symbols...\n", len(symbols))
	prices := yahoo.FetchPrices(symbols)

	fetched := 0
	s.mu.Lock()
	for i := range s.holdings {
		if p, ok := prices[s.holdings[i].Symbol]; ok && p.Fetched {
			s.holdings[i].LTP = p.Price
			s.holdings[i].DayChangePct = p.DayChangePct
			s.holdings[i].CurrentVal = s.holdings[i].Quantity * p.Price
			s.holdings[i].PnL = s.holdings[i].CurrentVal - s.holdings[i].InvestedVal
			if s.holdings[i].InvestedVal > 0 {
				s.holdings[i].ReturnsPct = (s.holdings[i].PnL / s.holdings[i].InvestedVal) * 100
			}
			fetched++
		}
	}
	s.lastRefresh = time.Now()
	s.mu.Unlock()

	fmt.Printf("[yahoo] Updated %d/%d holdings with live market prices\n", fetched, len(symbols))
}

func (s *Store) periodicRefresh() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		s.fetchLivePrices()
	}
}

func (s *Store) GetTaxAnalysis() model.TaxAnalysis {
	holdings := s.GetHoldings()
	analysis := model.TaxAnalysis{
		LTCGExempted:        125000,
		STCGTaxRate:         15,
		LTCGTaxRate:         10,
		TaxSavedThisYear:    12470,
	}

	var totalLTCG, totalSTCG float64
	for _, h := range holdings {
		if h.PnL > 0 {
			totalLTCG += h.PnL
		} else if h.PnL < 0 {
			loss := math.Abs(h.PnL)
			taxSaving := loss * 0.10
			period := "Long Term"
			if h.Type == model.AssetEquity {
				period = "Long Term (>1yr)"
			}
			analysis.HarvestableLosses = append(analysis.HarvestableLosses, model.TaxHolding{
				ID:            h.ID,
				Symbol:        h.Symbol,
				Name:          h.Name,
				Type:          string(h.Type),
				BuyPrice:      h.AvgPrice,
				CurrentPrice:  h.LTP,
				Quantity:      h.Quantity,
				LossAmount:    loss,
				TaxSaving:     taxSaving,
				HoldingPeriod: period,
			})
			analysis.TotalHarvestableLoss += loss
			analysis.EstimatedTaxSaving += taxSaving
		}
	}

	analysis.TotalLTCG = totalLTCG
	analysis.TotalSTCG = totalSTCG

	taxableLTCG := totalLTCG - analysis.LTCGExemptionUsed
	if taxableLTCG < 0 {
		taxableLTCG = 0
	}
	analysis.LTCGExemptionRemain = analysis.LTCGExempted - analysis.LTCGExemptionUsed
	if analysis.LTCGExemptionRemain < 0 {
		analysis.LTCGExemptionRemain = 0
	}

	ltcgTax := taxableLTCG * analysis.LTCGTaxRate / 100
	stcgTax := totalSTCG * analysis.STCGTaxRate / 100
	analysis.EstimatedTaxLiability = ltcgTax + stcgTax

	return analysis
}

func (s *Store) GetHealthScore() model.PortfolioHealth {
	holdings := s.GetHoldings()
	summary := s.computeSummary(holdings)

	var totalVal float64
	typeMap := make(map[model.AssetType]float64)
	for _, h := range holdings {
		totalVal += h.CurrentVal
		typeMap[h.Type] += h.CurrentVal
	}

	equityVal := typeMap[model.AssetEquity] + typeMap[model.AssetMF]
	debtVal := typeMap[model.AssetBond]
	altVal := typeMap[model.AssetREIT] + typeMap[model.AssetInvIT] + typeMap[model.AssetGold]
	usVal := typeMap[model.AssetUSStock]

	equityPct := 0.0
	debtPct := 0.0
	altPct := 0.0
	usPct := 0.0
	if totalVal > 0 {
		equityPct = (equityVal / totalVal) * 100
		debtPct = (debtVal / totalVal) * 100
		altPct = (altVal / totalVal) * 100
		usPct = (usVal / totalVal) * 100
	}

	returnsScore := math.Min(50+summary.TotalReturnsPct*3, 100)
	if returnsScore < 20 {
		returnsScore = 20
	}

	herfindahl := 0.0
	for _, h := range holdings {
		share := h.CurrentVal / totalVal
		herfindahl += share * share
	}
	numAssets := float64(len(holdings))
	divScore := 100.0
	if numAssets > 0 {
		divScore = 100 - (herfindahl * numAssets * 100)
		if divScore > 100 {
			divScore = 100
		}
		if divScore < 0 {
			divScore = 0
		}
	}

	assetTypes := float64(len(typeMap))
	divScore = math.Min(divScore+assetTypes*5, 100)

	riskScore := 50.0
	if equityPct > 70 {
		riskScore = 30
	} else if equityPct > 50 {
		riskScore = 60
	} else if equityPct > 30 {
		riskScore = 75
	} else {
		riskScore = 85
	}
	if altPct > 30 {
		riskScore -= 10
	}

	taxScore := 60.0
	analysis := s.GetTaxAnalysis()
	if analysis.LTCGExemptionRemain > 50000 {
		taxScore = 70
	}
	if analysis.TotalHarvestableLoss > 0 {
		taxScore += 10
	}
	taxScore = math.Min(taxScore, 100)

	overallScore := math.Round((returnsScore*0.25 + riskScore*0.25 + divScore*0.25 + taxScore*0.25) * 10) / 10

	grade := "Good"
	gradeDesc := "Your portfolio is well-structured with room for improvement"
	if overallScore >= 85 {
		grade = "Excellent"
		gradeDesc = "Outstanding portfolio health across all metrics"
	} else if overallScore >= 70 {
		grade = "Good"
	} else if overallScore >= 50 {
		grade = "Fair"
		gradeDesc = "Your portfolio needs attention in some areas"
	} else {
		grade = "Needs Work"
		gradeDesc = "Significant improvements recommended"
	}

	var issues []model.HealthIssue
	if equityPct > 65 {
		issues = append(issues, model.HealthIssue{
			Severity: "warning", Category: "Allocation",
			Title:       fmt.Sprintf("High equity allocation (%.1f%%)", equityPct),
			Description: "Consider adding debt or alternative assets for stability",
		})
	}
	if usPct == 0 {
		issues = append(issues, model.HealthIssue{
			Severity: "warning", Category: "Diversification",
			Title:       "No international diversification",
			Description: "Consider 3-5% allocation to US stocks or international funds",
		})
	}
	if debtPct < 15 {
		issues = append(issues, model.HealthIssue{
			Severity: "info", Category: "Allocation",
			Title:       fmt.Sprintf("Low debt allocation (%.1f%%)", debtPct),
			Description: "Increasing debt to 20-25% can reduce portfolio volatility",
		})
	}
	if analysis := s.GetTaxAnalysis(); analysis.TotalHarvestableLoss > 0 {
		issues = append(issues, model.HealthIssue{
			Severity: "warning", Category: "Tax",
			Title:       fmt.Sprintf("₹%.0f in harvestable losses available", analysis.TotalHarvestableLoss),
			Description: "Book these losses before March 31 to offset gains",
		})
	}
	if assetTypes < 4 {
		issues = append(issues, model.HealthIssue{
			Severity: "info", Category: "Diversification",
			Title:       fmt.Sprintf("Only %d asset classes", int(assetTypes)),
			Description: "Consider adding REITs, gold, or international equities",
		})
	}
	if numAssets < 8 {
		issues = append(issues, model.HealthIssue{
			Severity: "info", Category: "Diversification",
			Title:       fmt.Sprintf("Only %d holdings", int(numAssets)),
			Description: "More holdings can reduce single-stock risk",
		})
	}

	var recommendations []model.HealthRecommendation
	if usPct == 0 {
		recommendations = append(recommendations, model.HealthRecommendation{
			Title: "Add international exposure", Category: "Diversification", Priority: "High",
			Description: "Consider Motilal Oswal S&P 500 ETF or Nasdaq 100 ETF (3-5% of portfolio)",
		})
	}
	if analysis := s.GetTaxAnalysis(); analysis.TotalHarvestableLoss > 0 {
		recommendations = append(recommendations, model.HealthRecommendation{
			Title: "Book tax losses before FY end", Category: "Tax", Priority: "High",
			Description: fmt.Sprintf("You have ₹%.0f in unrealized losses that can offset gains", analysis.TotalHarvestableLoss),
		})
	}
	if debtPct < 20 {
		recommendations = append(recommendations, model.HealthRecommendation{
			Title: "Increase debt allocation", Category: "Rebalancing", Priority: "Medium",
			Description: "Consider adding gilt or short-term debt funds for stability",
		})
	}
	if assetTypes < 5 {
		recommendations = append(recommendations, model.HealthRecommendation{
			Title: "Add asset class variety", Category: "Diversification", Priority: "Medium",
			Description: "Consider adding gold (SGB), REITs, or InvITs for better diversification",
		})
	}

	return model.PortfolioHealth{
		OverallScore:     overallScore,
		Grade:            grade,
		GradeDescription: gradeDesc,
		Categories: []model.HealthScoreCategory{
			{Name: "Returns", Score: math.Round(returnsScore), Description: s.returnsDesc(returnsScore)},
			{Name: "Risk Management", Score: math.Round(riskScore), Description: s.riskDesc(riskScore)},
			{Name: "Diversification", Score: math.Round(divScore), Description: s.divDesc(divScore)},
			{Name: "Tax Efficiency", Score: math.Round(taxScore), Description: s.taxDesc(taxScore)},
		},
		Issues:          issues,
		Recommendations: recommendations,
		Summary:         summary,
	}
}

func (s *Store) computeSummary(holdings []model.Holding) model.PortfolioSummary {
	var totalInvested, currentValue float64
	for _, h := range holdings {
		totalInvested += h.InvestedVal
		currentValue += h.CurrentVal
	}
	overallPnL := currentValue - totalInvested
	totalReturnsPct := 0.0
	if totalInvested > 0 {
		totalReturnsPct = (overallPnL / totalInvested) * 100
	}
	return model.PortfolioSummary{
		TotalInvested:   math.Round(totalInvested*100) / 100,
		CurrentValue:    math.Round(currentValue*100) / 100,
		OverallPnL:      math.Round(overallPnL*100) / 100,
		TotalReturnsPct: math.Round(totalReturnsPct*100) / 100,
	}
}

func (s *Store) returnsDesc(score float64) string {
	if score > 80 {
		return "Excellent returns outperforming most portfolios"
	}
	if score > 60 {
		return "Good returns in line with market performance"
	}
	if score > 40 {
		return "Average returns with room for improvement"
	}
	return "Below-average returns, consider rebalancing"
}

func (s *Store) riskDesc(score float64) string {
	if score > 75 {
		return "Conservative risk profile with capital preservation focus"
	}
	if score > 50 {
		return "Balanced risk with moderate volatility"
	}
	return "Higher risk exposure, consider adding defensive assets"
}

func (s *Store) divDesc(score float64) string {
	if score > 80 {
		return "Well diversified across asset classes and sectors"
	}
	if score > 50 {
		return "Moderately diversified with room for improvement"
	}
	return "Concentrated portfolio, consider broadening holdings"
}

func (s *Store) taxDesc(score float64) string {
	if score > 75 {
		return "Tax-efficient portfolio with optimized structure"
	}
	if score > 50 {
		return "Reasonable tax efficiency with some optimization possible"
	}
	return "Tax efficiency can be significantly improved"
}

func (s *Store) GetOptionsChain(underlying string, spot float64) model.OptionsChain {
	if spot == 0 {
		spot = 24650
	}

	expiry := time.Now().AddDate(0, 0, 8)
	if expiry.Weekday() == time.Saturday {
		expiry = expiry.AddDate(0, 0, 2)
	} else if expiry.Weekday() == time.Sunday {
		expiry = expiry.AddDate(0, 0, 1)
	}

	strikeStep := 200.0
	if spot > 1000 {
		strikeStep = 100.0
	}
	if spot > 10000 {
		strikeStep = 200.0
	}

	numStrikes := 6
	startStrike := math.Floor(spot/strikeStep) * strikeStep - float64(numStrikes/2)*strikeStep

	strikes := make([]model.OptionsStrike, 0, numStrikes*2+1)
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	for i := 0; i < numStrikes*2+1; i++ {
		strike := startStrike + float64(i)*strikeStep
		isATM := math.Abs(strike-spot) < strikeStep*0.5

		baseIV := 13.0 + math.Abs(strike-spot)/spot*100
		oiBase := 500000.0 + rng.Float64()*1000000
		oiChg := (rng.Float64() - 0.5) * 100000

		callLTP := 0.0
		putLTP := 0.0
		if strike < spot {
			callLTP = (spot-strike)*0.8 + rng.Float64()*20
			putLTP = rng.Float64() * 50
		} else if strike > spot {
			callLTP = rng.Float64() * 50
			putLTP = (strike-spot)*0.8 + rng.Float64()*20
		} else {
			callLTP = spot * 0.008
			putLTP = spot * 0.008
		}

		callDelta := 0.5
		putDelta := -0.5
		if strike < spot {
			callDelta = 0.7 + rng.Float64()*0.15
			putDelta = -0.2 - rng.Float64()*0.15
		} else if strike > spot {
			callDelta = 0.2 + rng.Float64()*0.15
			putDelta = -0.7 - rng.Float64()*0.15
		}

		strikes = append(strikes, model.OptionsStrike{
			Strike:    strike,
			IsATM:     isATM,
			CallOI:    math.Round(oiBase),
			CallChgOI: math.Round(oiChg),
			CallIV:    math.Round(baseIV*10) / 10,
			CallLTP:   math.Round(callLTP*100) / 100,
			PutLTP:    math.Round(putLTP*100) / 100,
			PutIV:     math.Round((baseIV+rng.Float64()*2)*10) / 10,
			PutChgOI:  math.Round(-oiChg * 0.8),
			PutOI:     math.Round(oiBase * 0.9),
			CallGreeks: model.OptionsGreeks{
				Delta: math.Round(callDelta*1000) / 1000,
				Gamma: math.Round(0.0003*10000) / 10000,
				Theta: math.Round(-12-rng.Float64()*5) * 100 / 100,
				Vega:  math.Round(8+rng.Float64()*3) * 100 / 100,
				Rho:   math.Round(3+rng.Float64()*2) * 100 / 100,
			},
			PutGreeks: model.OptionsGreeks{
				Delta: math.Round(putDelta*1000) / 1000,
				Gamma: math.Round(0.0003*10000) / 10000,
				Theta: math.Round(-10-rng.Float64()*5) * 100 / 100,
				Vega:  math.Round(8+rng.Float64()*3) * 100 / 100,
				Rho:   math.Round(-3-rng.Float64()*2) * 100 / 100,
			},
		})
	}

	return model.OptionsChain{
		Underlying:   underlying,
		SpotPrice:    spot,
		DayChange:    spot * 0.006,
		DayChangePct: 0.64,
		Expiry:       expiry.Format("Jan 02, 2006"),
		Strikes:      strikes,
	}
}

func (s *Store) GetUSStocks() []model.Holding {
	holdings := s.GetHoldings()
	var usStocks []model.Holding
	for _, h := range holdings {
		if h.Type == model.AssetUSStock {
			usStocks = append(usStocks, h)
		}
	}
	return usStocks
}

func (s *Store) seedData() {
	now := time.Now()

	s.holdings = []model.Holding{
		{ID: "H001", Symbol: "RELIANCE", Name: "Reliance Industries Ltd", Type: model.AssetEquity, Quantity: 25, AvgPrice: 2380.50, LTP: 2512.35, InvestedVal: 59512.50, CurrentVal: 62808.75, PnL: 3296.25, ReturnsPct: 5.54, DayChangePct: 1.25, Currency: "INR"},
		{ID: "H002", Symbol: "TCS", Name: "Tata Consultancy Services", Type: model.AssetEquity, Quantity: 15, AvgPrice: 3650.00, LTP: 3891.20, InvestedVal: 54750.00, CurrentVal: 58368.00, PnL: 3618.00, ReturnsPct: 6.61, DayChangePct: -0.43, Currency: "INR"},
		{ID: "H003", Symbol: "HDFCBANK", Name: "HDFC Bank Ltd", Type: model.AssetEquity, Quantity: 30, AvgPrice: 1540.75, LTP: 1623.80, InvestedVal: 46222.50, CurrentVal: 48714.00, PnL: 2491.50, ReturnsPct: 5.39, DayChangePct: 0.87, Currency: "INR"},
		{ID: "H004", Symbol: "INFY", Name: "Infosys Ltd", Type: model.AssetEquity, Quantity: 40, AvgPrice: 1425.30, LTP: 1512.60, InvestedVal: 57012.00, CurrentVal: 60504.00, PnL: 3492.00, ReturnsPct: 6.12, DayChangePct: -0.28, Currency: "INR"},
		{ID: "H005", Symbol: "ICICIBANK", Name: "ICICI Bank Ltd", Type: model.AssetEquity, Quantity: 35, AvgPrice: 1085.40, LTP: 1178.90, InvestedVal: 37989.00, CurrentVal: 41261.50, PnL: 3272.50, ReturnsPct: 8.62, DayChangePct: 1.15, Currency: "INR"},
		{ID: "H006", Symbol: "QUANTSC", Name: "Quant Small Cap Fund - Direct Growth", Type: model.AssetMF, Quantity: 120.452, AvgPrice: 210.80, LTP: 235.16, InvestedVal: 25391.00, CurrentVal: 28323.00, PnL: 2932.00, ReturnsPct: 11.55, DayChangePct: 0.92, Currency: "INR"},
		{ID: "H007", Symbol: "HDFCFLEXI", Name: "HDFC Flexi Cap Fund - Direct Growth", Type: model.AssetMF, Quantity: 85.300, AvgPrice: 152.60, LTP: 168.42, InvestedVal: 13017.00, CurrentVal: 14366.00, PnL: 1349.00, ReturnsPct: 10.36, DayChangePct: 0.54, Currency: "INR"},
		{ID: "H008", Symbol: "PARAGPARI", Name: "Parag Parikh Flexi Cap Fund - Direct Growth", Type: model.AssetMF, Quantity: 65.200, AvgPrice: 68.45, LTP: 76.90, InvestedVal: 4463.00, CurrentVal: 5014.00, PnL: 551.00, ReturnsPct: 12.34, DayChangePct: 0.38, Currency: "INR"},
		{ID: "H009", Symbol: "SGBAUG28", Name: "Sovereign Gold Bond 2028 Series", Type: model.AssetGold, Quantity: 20.000, AvgPrice: 5420.00, LTP: 6285.50, InvestedVal: 108400.00, CurrentVal: 125710.00, PnL: 17310.00, ReturnsPct: 15.97, DayChangePct: 0.22, Currency: "INR"},
		{ID: "H010", Symbol: "NYKAA", Name: "Embassy Office Parks REIT", Type: model.AssetREIT, Quantity: 50, AvgPrice: 318.20, LTP: 342.75, InvestedVal: 15910.00, CurrentVal: 17137.50, PnL: 1227.50, ReturnsPct: 7.72, DayChangePct: -0.65, Currency: "INR"},
		{ID: "H011", Symbol: "BROOKFIELD", Name: "Brookfield India Real Estate Trust", Type: model.AssetREIT, Quantity: 40, AvgPrice: 275.90, LTP: 291.40, InvestedVal: 11036.00, CurrentVal: 11656.00, PnL: 620.00, ReturnsPct: 5.62, DayChangePct: 0.31, Currency: "INR"},
		{ID: "H012", Symbol: "IRBIT", Name: "IRB InvIT Fund", Type: model.AssetInvIT, Quantity: 100, AvgPrice: 58.40, LTP: 63.15, InvestedVal: 5840.00, CurrentVal: 6315.00, PnL: 475.00, ReturnsPct: 8.13, DayChangePct: 0.19, Currency: "INR"},
		{ID: "H013", Symbol: "PGINVIT", Name: "PowerGrid Infrastructure Investment Trust", Type: model.AssetInvIT, Quantity: 75, AvgPrice: 142.60, LTP: 155.80, InvestedVal: 10695.00, CurrentVal: 11685.00, PnL: 990.00, ReturnsPct: 9.26, DayChangePct: 0.44, Currency: "INR"},
		{ID: "H014", Symbol: "INDIAGILT", Name: "Nippon India Gilt Fund", Type: model.AssetBond, Quantity: 150.200, AvgPrice: 48.75, LTP: 50.62, InvestedVal: 7322.00, CurrentVal: 7603.00, PnL: 281.00, ReturnsPct: 3.84, DayChangePct: 0.08, Currency: "INR"},
		{ID: "H015", Symbol: "HDFCSDLT", Name: "HDFC Short Term Debt Fund - Direct Growth", Type: model.AssetBond, Quantity: 200.000, AvgPrice: 22.80, LTP: 23.45, InvestedVal: 4560.00, CurrentVal: 4690.00, PnL: 130.00, ReturnsPct: 2.85, DayChangePct: 0.03, Currency: "INR"},
		{ID: "H016", Symbol: "AAPL", Name: "Apple Inc", Type: model.AssetUSStock, Quantity: 15.000, AvgPrice: 172.50, LTP: 189.84, InvestedVal: 2587.50, CurrentVal: 2847.60, PnL: 260.10, ReturnsPct: 10.05, DayChangePct: 0.82, Currency: "USD"},
		{ID: "H017", Symbol: "MSFT", Name: "Microsoft Corp", Type: model.AssetUSStock, Quantity: 8.000, AvgPrice: 398.20, LTP: 422.86, InvestedVal: 3185.60, CurrentVal: 3382.88, PnL: 197.28, ReturnsPct: 6.19, DayChangePct: 1.15, Currency: "USD"},
		{ID: "H018", Symbol: "GOOGL", Name: "Alphabet Inc", Type: model.AssetUSStock, Quantity: 12.000, AvgPrice: 165.80, LTP: 176.33, InvestedVal: 1989.60, CurrentVal: 2115.96, PnL: 126.36, ReturnsPct: 6.35, DayChangePct: -0.32, Currency: "USD"},
		{ID: "H019", Symbol: "AMZN", Name: "Amazon.com Inc", Type: model.AssetUSStock, Quantity: 10.000, AvgPrice: 178.40, LTP: 186.27, InvestedVal: 1784.00, CurrentVal: 1862.70, PnL: 78.70, ReturnsPct: 4.41, DayChangePct: 0.54, Currency: "USD"},
		{ID: "H020", Symbol: "NVDA", Name: "NVIDIA Corp", Type: model.AssetUSStock, Quantity: 20.000, AvgPrice: 95.60, LTP: 131.29, InvestedVal: 1912.00, CurrentVal: 2625.80, PnL: 713.80, ReturnsPct: 37.33, DayChangePct: 2.41, Currency: "USD"},
		{ID: "H021", Symbol: "TSLA", Name: "Tesla Inc", Type: model.AssetUSStock, Quantity: 5.000, AvgPrice: 218.90, LTP: 248.42, InvestedVal: 1094.50, CurrentVal: 1242.10, PnL: 147.60, ReturnsPct: 13.49, DayChangePct: -1.23, Currency: "USD"},
		{ID: "H022", Symbol: "META", Name: "Meta Platforms Inc", Type: model.AssetUSStock, Quantity: 4.000, AvgPrice: 475.30, LTP: 503.28, InvestedVal: 1901.20, CurrentVal: 2013.12, PnL: 111.92, ReturnsPct: 5.89, DayChangePct: 0.73, Currency: "USD"},
		{ID: "H023", Symbol: "JPM", Name: "JPMorgan Chase & Co", Type: model.AssetUSStock, Quantity: 6.000, AvgPrice: 192.40, LTP: 200.00, InvestedVal: 1154.40, CurrentVal: 1200.00, PnL: 45.60, ReturnsPct: 3.95, DayChangePct: 0.28, Currency: "USD"},
	}

	s.transactions = []model.Transaction{
		{ID: "TX001", Type: model.TxBuy, Symbol: "RELIANCE", Name: "Reliance Industries Ltd", Quantity: 10, Price: 2495.00, Total: 24950.00, Date: now.AddDate(0, 0, -2)},
		{ID: "TX002", Type: model.TxSell, Symbol: "TCS", Name: "Tata Consultancy Services", Quantity: 5, Price: 3910.00, Total: 19550.00, Date: now.AddDate(0, 0, -3)},
		{ID: "TX003", Type: model.TxBuy, Symbol: "HDFCBANK", Name: "HDFC Bank Ltd", Quantity: 15, Price: 1610.25, Total: 24153.75, Date: now.AddDate(0, 0, -5)},
		{ID: "TX004", Type: model.TxBuy, Symbol: "QUANTSC", Name: "Quant Small Cap Fund", Quantity: 30.113, Price: 228.40, Total: 6877.81, Date: now.AddDate(0, 0, -7)},
		{ID: "TX005", Type: model.TxSell, Symbol: "INFY", Name: "Infosys Ltd", Quantity: 10, Price: 1520.00, Total: 15200.00, Date: now.AddDate(0, -1, 0)},
		{ID: "TX006", Type: model.TxBuy, Symbol: "ICICIBANK", Name: "ICICI Bank Ltd", Quantity: 20, Price: 1165.50, Total: 23310.00, Date: now.AddDate(0, -1, -5)},
		{ID: "TX007", Type: model.TxBuy, Symbol: "SGBAUG28", Name: "Sovereign Gold Bond 2028", Quantity: 4, Price: 6180.00, Total: 24720.00, Date: now.AddDate(0, -2, 0)},
		{ID: "TX008", Type: model.TxSell, Symbol: "NYKAA", Name: "Embassy Office Parks REIT", Quantity: 20, Price: 338.90, Total: 6778.00, Date: now.AddDate(0, -2, -10)},
		{ID: "TX009", Type: model.TxBuy, Symbol: "PGINVIT", Name: "PowerGrid Infrastructure Investment Trust", Quantity: 25, Price: 153.20, Total: 3830.00, Date: now.AddDate(0, -3, 0)},
		{ID: "TX010", Type: model.TxBuy, Symbol: "HDFCFLEXI", Name: "HDFC Flexi Cap Fund", Quantity: 42.650, Price: 165.10, Total: 7041.52, Date: now.AddDate(0, -3, -15)},
	}

	s.performance = []model.PerformancePoint{
		{Month: "2025-07", InvestedValue: 380000.00, PortfolioValue: 356200.00},
		{Month: "2025-08", InvestedValue: 380000.00, PortfolioValue: 362800.00},
		{Month: "2025-09", InvestedValue: 395000.00, PortfolioValue: 371500.00},
		{Month: "2025-10", InvestedValue: 395000.00, PortfolioValue: 380100.00},
		{Month: "2025-11", InvestedValue: 405000.00, PortfolioValue: 392400.00},
		{Month: "2025-12", InvestedValue: 405000.00, PortfolioValue: 398700.00},
		{Month: "2026-01", InvestedValue: 415000.00, PortfolioValue: 410200.00},
		{Month: "2026-02", InvestedValue: 415000.00, PortfolioValue: 405800.00},
		{Month: "2026-03", InvestedValue: 425000.00, PortfolioValue: 419600.00},
		{Month: "2026-04", InvestedValue: 425000.00, PortfolioValue: 428300.00},
		{Month: "2026-05", InvestedValue: 438000.00, PortfolioValue: 439100.00},
		{Month: "2026-06", InvestedValue: 438000.00, PortfolioValue: 445500.00},
		{Month: "2026-07", InvestedValue: 457100.00, PortfolioValue: 460951.75},
	}
}
