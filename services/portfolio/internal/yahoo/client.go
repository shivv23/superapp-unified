package yahoo

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

type chartResponse struct {
	Chart struct {
		Result []struct {
			Meta struct {
				RegularMarketPrice float64 `json:"regularMarketPrice"`
				PreviousClose      float64 `json:"previousClose"`
				ChartPreviousClose float64 `json:"chartPreviousClose"`
			} `json:"meta"`
		} `json:"result"`
		Error *struct {
			Code        string `json:"code"`
			Description string `json:"description"`
		} `json:"error"`
	} `json:"chart"`
}

type PriceResult struct {
	Symbol       string
	Price        float64
	PrevClose    float64
	DayChange    float64
	DayChangePct float64
	Fetched      bool
}

var symbolMap = map[string]string{
	"RELIANCE":  "RELIANCE.NS",
	"TCS":       "TCS.NS",
	"HDFCBANK":  "HDFCBANK.NS",
	"INFY":      "INFY.NS",
	"ICICIBANK": "ICICIBANK.NS",
	"NYKAA":     "EMBASSY.NS",
	"BROOKFIELD":"BROOKFIND.NS",
	"IRBIT":     "IRBInvIT.NS",
	"PGINVIT":   "POWERGRID.NS",
	"AAPL":      "AAPL",
	"MSFT":      "MSFT",
	"GOOGL":     "GOOGL",
	"AMZN":      "AMZN",
	"NVDA":      "NVDA",
	"TSLA":      "TSLA",
	"META":      "META",
	"JPM":       "JPM",
}

var usStockSymbols = map[string]bool{
	"AAPL": true, "MSFT": true, "GOOGL": true, "AMZN": true,
	"NVDA": true, "TSLA": true, "META": true, "JPM": true,
}

func FetchPrices(symbols []string) map[string]PriceResult {
	results := make(map[string]PriceResult)
	var mu sync.Mutex
	var wg sync.WaitGroup

	client := &http.Client{Timeout: 10 * time.Second}

	seen := make(map[string]bool)
	for _, sym := range symbols {
		if seen[strings.ToUpper(sym)] {
			continue
		}
		seen[strings.ToUpper(sym)] = true

		yahooSym := sym
		if ys, ok := symbolMap[strings.ToUpper(sym)]; ok {
			yahooSym = ys
		}

		wg.Add(1)
		go func(original, yahoo string) {
			defer wg.Done()
			price := fetchSingle(client, yahoo)
			if price.Fetched {
				price.Symbol = original
				mu.Lock()
				results[original] = price
				mu.Unlock()
			}
		}(sym, yahooSym)
	}

	wg.Wait()
	return results
}

func fetchSingle(client *http.Client, yahooSymbol string) PriceResult {
	url := fmt.Sprintf("https://query1.finance.yahoo.com/v8/finance/chart/%s?interval=1d&range=5d", yahooSymbol)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return PriceResult{Fetched: false}
	}
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("[yahoo] Failed to fetch %s: %v\n", yahooSymbol, err)
		return PriceResult{Fetched: false}
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return PriceResult{Fetched: false}
	}

	var data chartResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return PriceResult{Fetched: false}
	}

	if data.Chart.Error != nil {
		fmt.Printf("[yahoo] API error for %s: %s\n", yahooSymbol, data.Chart.Error.Description)
		return PriceResult{Fetched: false}
	}

	if len(data.Chart.Result) == 0 {
		return PriceResult{Fetched: false}
	}

	meta := data.Chart.Result[0].Meta
	price := meta.RegularMarketPrice
	prevClose := meta.PreviousClose
	if prevClose == 0 {
		prevClose = meta.ChartPreviousClose
	}

	if price == 0 {
		return PriceResult{Fetched: false}
	}

	dayChange := price - prevClose
	dayChangePct := 0.0
	if prevClose > 0 {
		dayChangePct = (dayChange / prevClose) * 100
	}

	fmt.Printf("[yahoo] %s: %.2f (prev: %.2f, change: %.2f%%)\n", yahooSymbol, price, prevClose, dayChangePct)

	return PriceResult{
		Price:        price,
		PrevClose:    prevClose,
		DayChange:    dayChange,
		DayChangePct: dayChangePct,
		Fetched:      true,
	}
}

func FetchPrice(symbol string) PriceResult {
	results := FetchPrices([]string{symbol})
	if r, ok := results[symbol]; ok {
		return r
	}
	return PriceResult{Symbol: symbol, Fetched: false}
}

func MapSymbol(symbol string) string {
	if ys, ok := symbolMap[strings.ToUpper(symbol)]; ok {
		return ys
	}
	return symbol
}

func IsIndianEquity(symbol string) bool {
	_, ok := symbolMap[strings.ToUpper(symbol)]
	return ok && !usStockSymbols[strings.ToUpper(symbol)]
}

func IsUSStock(symbol string) bool {
	return usStockSymbols[strings.ToUpper(symbol)]
}

func GetAllUSStockSymbols() []string {
	syms := make([]string, 0, len(usStockSymbols))
	for s := range usStockSymbols {
		syms = append(syms, s)
	}
	return syms
}
