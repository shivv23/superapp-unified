from __future__ import annotations

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


# --- Enums ---

class InvestmentGoal(str, Enum):
    GROWTH = "growth"
    INCOME = "income"
    BALANCED = "balanced"


class RiskLevel(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


# --- Request Models ---

class RiskProfileRequest(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age of the investor")
    income: float = Field(..., gt=0, description="Annual income")
    net_worth: float = Field(..., ge=0, description="Total net worth")
    investment_experience: int = Field(
        ..., ge=0, le=60, description="Years of investment experience"
    )
    investment_goal: InvestmentGoal = Field(..., description="Primary investment goal")
    risk_tolerance: int = Field(
        ..., ge=1, le=10, description="Self-reported risk tolerance 1-10"
    )
    time_horizon: int = Field(..., ge=1, le=50, description="Investment horizon in years")
    monthly_income_pct_invest: float = Field(
        ..., ge=0, le=100, description="% of monthly income invested"
    )


class Holding(BaseModel):
    symbol: str = Field(..., min_length=1, description="Asset symbol")
    type: Literal["equity", "debt", "gold", "reit"] = Field(..., description="Asset class")
    value: float = Field(..., gt=0, description="Current market value")
    percentage: float = Field(..., ge=0, le=100, description="% of portfolio")


class PortfolioOptimizeRequest(BaseModel):
    current_holdings: list[Holding] = Field(..., min_length=1, description="Current holdings")
    risk_profile: RiskLevel = Field(..., description="Risk profile level")


class GoalPlanRequest(BaseModel):
    goal_name: str = Field(..., min_length=1, max_length=100, description="Name of the goal")
    target_amount: float = Field(..., gt=0, description="Target corpus amount")
    timeline_years: int = Field(..., ge=1, le=50, description="Timeline in years")
    monthly_investment: float = Field(..., gt=0, description="Current monthly investment")
    current_savings: float = Field(..., ge=0, description="Current savings towards goal")
    risk_profile: RiskLevel = Field(..., description="Risk profile level")


# --- Response Models ---

class FactorBreakdown(BaseModel):
    factor: str
    weight: float
    score: float
    contribution: float


class RiskProfileResponse(BaseModel):
    risk_score: float = Field(..., ge=0, le=100)
    risk_level: RiskLevel
    profile_summary: str
    factor_breakdown: list[FactorBreakdown]


class Allocation(BaseModel):
    asset_class: str
    target_pct: float
    current_pct: float
    recommended_action: str


class Recommendation(BaseModel):
    symbol: str
    name: str
    type: str
    reason: str
    expected_return_range: str


class RebalancingAction(BaseModel):
    symbol: str
    type: str
    action: str
    amount: float
    reason: str


class PortfolioOptimizeResponse(BaseModel):
    suggested_allocation: list[Allocation]
    recommendations: list[Recommendation]
    rebalancing_actions: list[RebalancingAction]


class TrajectoryPoint(BaseModel):
    year: int
    portfolio_value: float
    cumulative_invested: float
    growth: float


class AlternativeScenario(BaseModel):
    name: str
    monthly_investment: float
    final_value: float
    shortfall_surplus: float


class GoalPlanResponse(BaseModel):
    goal_name: str
    probability_of_success: float
    suggested_monthly_investment: float
    projected_trajectory: list[TrajectoryPoint]
    alternative_scenarios: list[AlternativeScenario]


class ProductRecommendation(BaseModel):
    symbol: str
    name: str
    asset_class: str
    expected_annual_return: str
    risk_rating: str
    reason: str


class RecommendationsResponse(BaseModel):
    risk_profile: RiskLevel
    investment_amount: float
    recommendations: list[ProductRecommendation]


class MarketInsightsResponse(BaseModel):
    market_trends: list[dict]
    sector_performance: list[dict]
    top_picks: list[dict]
