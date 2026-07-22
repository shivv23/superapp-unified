from __future__ import annotations

from src.models import FactorBreakdown, RiskLevel, RiskProfileRequest, RiskProfileResponse


def calculate_risk_profile(req: RiskProfileRequest) -> RiskProfileResponse:
    factors: list[FactorBreakdown] = []

    # Age factor (younger = higher risk capacity, max 15%)
    age_score = max(0, 100 - (req.age - 18) * 1.5)
    age_score = min(age_score, 100)
    factors.append(FactorBreakdown(factor="age", weight=0.15, score=age_score, contribution=age_score * 0.15))

    # Income stability (higher income → more capacity, max 10%)
    income_score = min(req.income / 200_000 * 100, 100)
    factors.append(FactorBreakdown(factor="income", weight=0.10, score=income_score, contribution=income_score * 0.10))

    # Net worth (higher net worth → more buffer, max 10%)
    nw_score = min(req.net_worth / 1_000_000 * 100, 100)
    factors.append(FactorBreakdown(factor="net_worth", weight=0.10, score=nw_score, contribution=nw_score * 0.10))

    # Experience (max 15%)
    exp_score = min(req.investment_experience / 15 * 100, 100)
    factors.append(FactorBreakdown(factor="experience", weight=0.15, score=exp_score, contribution=exp_score * 0.15))

    # Risk tolerance – direct input (max 25%)
    tol_score = req.risk_tolerance * 10
    factors.append(FactorBreakdown(factor="risk_tolerance", weight=0.25, score=tol_score, contribution=tol_score * 0.25))

    # Time horizon (longer → more risk capacity, max 15%)
    horizon_score = min(req.time_horizon / 30 * 100, 100)
    factors.append(FactorBreakdown(factor="time_horizon", weight=0.15, score=horizon_score, contribution=horizon_score * 0.15))

    # Investment allocation % (higher % → more committed, max 10%)
    alloc_score = min(req.monthly_income_pct_invest / 50 * 100, 100)
    factors.append(FactorBreakdown(factor="monthly_investment_pct", weight=0.10, score=alloc_score, contribution=alloc_score * 0.10))

    # Goal-based adjustment
    goal_adj = 0.0
    if req.investment_goal.value == "growth":
        goal_adj = 5.0
    elif req.investment_goal.value == "income":
        goal_adj = -3.0

    risk_score = round(sum(f.contribution for f in factors) + goal_adj, 2)
    risk_score = max(0.0, min(100.0, risk_score))

    if risk_score <= 33:
        level = RiskLevel.CONSERVATIVE
    elif risk_score <= 66:
        level = RiskLevel.MODERATE
    else:
        level = RiskLevel.AGGRESSIVE

    summary = (
        f"You are a {level.value} investor with a risk score of {risk_score}/100. "
        f"Based on your age ({req.age}), {req.investment_experience} years of experience, "
        f"and a {req.time_horizon}-year horizon, we recommend a {level.value} portfolio allocation."
    )

    return RiskProfileResponse(
        risk_score=risk_score,
        risk_level=level,
        profile_summary=summary,
        factor_breakdown=factors,
    )
