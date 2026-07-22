package repository

import (
	"sync"
	"time"

	"github.com/superapp-unified/portfolio/internal/model"
)

type Store struct {
	mu           sync.RWMutex
	holdings     []model.Holding
	transactions []model.Transaction
	performance  []model.PerformancePoint
}

func NewStore() *Store {
	s := &Store{}
	s.seedData()
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

func (s *Store) seedData() {
	now := time.Now()

	s.holdings = []model.Holding{
		{ID: "H001", Symbol: "RELIANCE", Name: "Reliance Industries Ltd", Type: model.AssetEquity, Quantity: 25, AvgPrice: 2380.50, LTP: 2512.35, InvestedVal: 59512.50, CurrentVal: 62808.75, PnL: 3296.25, ReturnsPct: 5.54, DayChangePct: 1.25},
		{ID: "H002", Symbol: "TCS", Name: "Tata Consultancy Services", Type: model.AssetEquity, Quantity: 15, AvgPrice: 3650.00, LTP: 3891.20, InvestedVal: 54750.00, CurrentVal: 58368.00, PnL: 3618.00, ReturnsPct: 6.61, DayChangePct: -0.43},
		{ID: "H003", Symbol: "HDFCBANK", Name: "HDFC Bank Ltd", Type: model.AssetEquity, Quantity: 30, AvgPrice: 1540.75, LTP: 1623.80, InvestedVal: 46222.50, CurrentVal: 48714.00, PnL: 2491.50, ReturnsPct: 5.39, DayChangePct: 0.87},
		{ID: "H004", Symbol: "INFY", Name: "Infosys Ltd", Type: model.AssetEquity, Quantity: 40, AvgPrice: 1425.30, LTP: 1512.60, InvestedVal: 57012.00, CurrentVal: 60504.00, PnL: 3492.00, ReturnsPct: 6.12, DayChangePct: -0.28},
		{ID: "H005", Symbol: "ICICIBANK", Name: "ICICI Bank Ltd", Type: model.AssetEquity, Quantity: 35, AvgPrice: 1085.40, LTP: 1178.90, InvestedVal: 37989.00, CurrentVal: 41261.50, PnL: 3272.50, ReturnsPct: 8.62, DayChangePct: 1.15},
		{ID: "H006", Symbol: "QUANTSC", Name: "Quant Small Cap Fund - Direct Growth", Type: model.AssetMF, Quantity: 120.452, AvgPrice: 210.80, LTP: 235.16, InvestedVal: 25391.00, CurrentVal: 28323.00, PnL: 2932.00, ReturnsPct: 11.55, DayChangePct: 0.92},
		{ID: "H007", Symbol: "HDFCFLEXI", Name: "HDFC Flexi Cap Fund - Direct Growth", Type: model.AssetMF, Quantity: 85.300, AvgPrice: 152.60, LTP: 168.42, InvestedVal: 13017.00, CurrentVal: 14366.00, PnL: 1349.00, ReturnsPct: 10.36, DayChangePct: 0.54},
		{ID: "H008", Symbol: "PARAGPARI", Name: "Parag Parikh Flexi Cap Fund - Direct Growth", Type: model.AssetMF, Quantity: 65.200, AvgPrice: 68.45, LTP: 76.90, InvestedVal: 4463.00, CurrentVal: 5014.00, PnL: 551.00, ReturnsPct: 12.34, DayChangePct: 0.38},
		{ID: "H009", Symbol: "SGBAUG28", Name: "Sovereign Gold Bond 2028 Series", Type: model.AssetGold, Quantity: 20.000, AvgPrice: 5420.00, LTP: 6285.50, InvestedVal: 108400.00, CurrentVal: 125710.00, PnL: 17310.00, ReturnsPct: 15.97, DayChangePct: 0.22},
		{ID: "H010", Symbol: "NYKAA", Name: "Embassy Office Parks REIT", Type: model.AssetREIT, Quantity: 50, AvgPrice: 318.20, LTP: 342.75, InvestedVal: 15910.00, CurrentVal: 17137.50, PnL: 1227.50, ReturnsPct: 7.72, DayChangePct: -0.65},
		{ID: "H011", Symbol: "BROOKFIELD", Name: "Brookfield India Real Estate Trust", Type: model.AssetREIT, Quantity: 40, AvgPrice: 275.90, LTP: 291.40, InvestedVal: 11036.00, CurrentVal: 11656.00, PnL: 620.00, ReturnsPct: 5.62, DayChangePct: 0.31},
		{ID: "H012", Symbol: "IRBIT", Name: "IRB InvIT Fund", Type: model.AssetInvIT, Quantity: 100, AvgPrice: 58.40, LTP: 63.15, InvestedVal: 5840.00, CurrentVal: 6315.00, PnL: 475.00, ReturnsPct: 8.13, DayChangePct: 0.19},
		{ID: "H013", Symbol: "PGINVIT", Name: "PowerGrid Infrastructure Investment Trust", Type: model.AssetInvIT, Quantity: 75, AvgPrice: 142.60, LTP: 155.80, InvestedVal: 10695.00, CurrentVal: 11685.00, PnL: 990.00, ReturnsPct: 9.26, DayChangePct: 0.44},
		{ID: "H014", Symbol: "INDIAGILT", Name: "Nippon India Gilt Fund", Type: model.AssetBond, Quantity: 150.200, AvgPrice: 48.75, LTP: 50.62, InvestedVal: 7322.00, CurrentVal: 7603.00, PnL: 281.00, ReturnsPct: 3.84, DayChangePct: 0.08},
		{ID: "H015", Symbol: "HDFCSDLT", Name: "HDFC Short Term Debt Fund - Direct Growth", Type: model.AssetBond, Quantity: 200.000, AvgPrice: 22.80, LTP: 23.45, InvestedVal: 4560.00, CurrentVal: 4690.00, PnL: 130.00, ReturnsPct: 2.85, DayChangePct: 0.03},
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
