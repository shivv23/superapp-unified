from __future__ import annotations

import logging

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from src.data import MARKET_DATA, MOCK_PRODUCTS
from src.goal_planner import plan_goal
from src.models import (
    GoalPlanRequest,
    GoalPlanResponse,
    MarketInsightsResponse,
    PortfolioOptimizeRequest,
    PortfolioOptimizeResponse,
    ProductRecommendation,
    RecommendationsResponse,
    RiskLevel,
    RiskProfileRequest,
    RiskProfileResponse,
)
from src.portfolio_optimizer import optimize_portfolio
from src.risk_engine import calculate_risk_profile

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")
logger = logging.getLogger("advisory")

app = FastAPI(
    title="SuperApp Unified – Advisory Service",
    description="AI-powered investment advisory microservice for SuperApp Unified.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/advisory/health")
def health_check() -> dict:
    logger.info("Health check requested")
    return {"status": "healthy", "service": "advisory", "version": "1.0.0"}


@app.post("/api/v1/advisory/risk-profile", response_model=RiskProfileResponse)
def get_risk_profile(req: RiskProfileRequest) -> RiskProfileResponse:
    logger.info("Risk profile calculation requested for age=%d", req.age)
    return calculate_risk_profile(req)


@app.post("/api/v1/advisory/portfolio-optimize", response_model=PortfolioOptimizeResponse)
def get_portfolio_optimization(req: PortfolioOptimizeRequest) -> PortfolioOptimizeResponse:
    logger.info("Portfolio optimization requested, risk_profile=%s", req.risk_profile)
    return optimize_portfolio(req)


@app.post("/api/v1/advisory/goal-plan", response_model=GoalPlanResponse)
def get_goal_plan(req: GoalPlanRequest) -> GoalPlanResponse:
    logger.info("Goal plan requested: %s", req.goal_name)
    return plan_goal(req)


@app.get("/api/v1/advisory/recommendations", response_model=RecommendationsResponse)
def get_recommendations(
    risk_profile: RiskLevel = Query(..., description="Risk profile level"),
    investment_amount: float = Query(..., gt=0, description="Amount to invest"),
) -> RecommendationsResponse:
    logger.info("Recommendations requested, risk_profile=%s, amount=%.0f", risk_profile, investment_amount)
    recs: list[ProductRecommendation] = []
    risk_ratings = {
        RiskLevel.CONSERVATIVE: {"equity": "Low-Medium", "debt": "Low", "gold": "Low", "reit": "Low-Medium"},
        RiskLevel.MODERATE: {"equity": "Medium", "debt": "Low", "gold": "Low-Medium", "reit": "Medium"},
        RiskLevel.AGGRESSIVE: {"equity": "High", "debt": "Low", "gold": "Low-Medium", "reit": "Medium"},
    }
    returns_map = {"equity": "12-15%", "debt": "7-8%", "gold": "8-10%", "reit": "10-12%"}
    for asset_class, products in MOCK_PRODUCTS.items():
        if products:
            p = products[0]
            recs.append(ProductRecommendation(
                symbol=p["symbol"],
                name=p["name"],
                asset_class=asset_class,
                expected_annual_return=returns_map[asset_class],
                risk_rating=risk_ratings[risk_profile][asset_class],
                reason=f"Recommended {asset_class} product for {risk_profile.value} risk profile with ₹{investment_amount:,.0f} allocation.",
            ))
    return RecommendationsResponse(
        risk_profile=risk_profile,
        investment_amount=investment_amount,
        recommendations=recs,
    )


@app.get("/api/v1/advisory/market-insights", response_model=MarketInsightsResponse)
def get_market_insights() -> MarketInsightsResponse:
    logger.info("Market insights requested")
    return MarketInsightsResponse(
        market_trends=MARKET_DATA["trends"],
        sector_performance=MARKET_DATA["sector_performance"],
        top_picks=[
            {"symbol": "NIFTY50ETF", "name": "Nifty 50 Index Fund", "rationale": "Broad market exposure with low cost."},
            {"symbol": "GOLDETF", "name": "Gold BeES ETF", "rationale": "Inflation hedge and portfolio diversifier."},
            {"symbol": "SCBF", "name": "Short Duration Corporate Bond Fund", "rationale": "Stable returns with low interest rate risk."},
        ],
    )
