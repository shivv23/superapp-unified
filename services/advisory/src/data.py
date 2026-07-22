from __future__ import annotations

MARKET_DATA: dict = {
    "indices": [
        {"name": "NIFTY 50", "value": 24_850.75, "change_pct": 0.42},
        {"name": "SENSEX", "value": 81_245.30, "change_pct": 0.38},
        {"name": "NIFTY Bank", "value": 52_130.60, "change_pct": -0.15},
        {"name": "NIFTY IT", "value": 42_310.20, "change_pct": 1.12},
    ],
    "trends": [
        {"theme": "AI & Tech", "outlook": "Positive", "detail": "Enterprise AI adoption driving sustained IT sector growth."},
        {"theme": "Rate Cuts", "outlook": "Positive", "detail": "Central bank expected to cut rates by 25-50 bps in coming quarters."},
        {"theme": "Global Geopolitics", "outlook": "Cautious", "detail": "Trade tensions creating short-term volatility in export-heavy sectors."},
        {"theme": "Domestic Consumption", "outlook": "Positive", "detail": "Rural demand recovering; FMCG and auto sectors benefiting."},
    ],
    "sector_performance": [
        {"sector": "Information Technology", "ytd_return_pct": 18.5, "outlook": "Strong"},
        {"sector": "Financial Services", "ytd_return_pct": 12.3, "outlook": "Stable"},
        {"sector": "Healthcare", "ytd_return_pct": 9.8, "outlook": "Moderate"},
        {"sector": "Consumer Discretionary", "ytd_return_pct": 14.1, "outlook": "Positive"},
        {"sector": "Energy", "ytd_return_pct": -3.2, "outlook": "Cautious"},
        {"sector": "Infrastructure", "ytd_return_pct": 22.0, "outlook": "Strong"},
    ],
}

MOCK_PRODUCTS: dict[str, list[dict]] = {
    "equity": [
        {"symbol": "NIFTY50ETF", "name": "Nifty 50 Index Fund"},
        {"symbol": "MIDCAP100", "name": "Midcap 100 ETF"},
        {"symbol": "FLEXICAP01", "name": "Flexi Cap Fund - Growth"},
    ],
    "debt": [
        {"symbol": "GILTBF", "name": "Government Bond Fund"},
        {"symbol": "SCBF", "name": "Short Duration Corporate Bond Fund"},
        {"symbol": "ULTRSTBF", "name": "Ultra Short Duration Fund"},
    ],
    "gold": [
        {"symbol": "GOLDETF", "name": "Gold BeES ETF"},
        {"symbol": "SAVERGOLD", "name": "Sovereign Gold Bond"},
    ],
    "reit": [
        {"symbol": "MINDREIT", "name": " Mindspace Business REIT"},
        {"symbol": "EMBREIT", "name": "Embassy Office Parks REIT"},
    ],
}
