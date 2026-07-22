from __future__ import annotations

import random

from src.models import (
    AlternativeScenario,
    GoalPlanRequest,
    GoalPlanResponse,
    RiskLevel,
    TrajectoryPoint,
)

EXPECTED_RETURNS: dict[RiskLevel, float] = {
    RiskLevel.CONSERVATIVE: 0.08,
    RiskLevel.MODERATE: 0.11,
    RiskLevel.AGGRESSIVE: 0.14,
}

VOLATILITY: dict[RiskLevel, float] = {
    RiskLevel.CONSERVATIVE: 0.04,
    RiskLevel.MODERATE: 0.08,
    RiskLevel.AGGRESSIVE: 0.14,
}

MONTE_CARLO_RUNS = 500


def _simulate(
    monthly_investment: float,
    current_savings: float,
    years: int,
    expected_return: float,
    volatility: float,
    target: float,
    rng: random.Random,
) -> float:
    """Run a single Monte Carlo path, return final portfolio value."""
    portfolio = current_savings
    monthly_r = expected_return / 12
    monthly_v = volatility / (12 ** 0.5)
    for _ in range(years * 12):
        shock = rng.gauss(0, 1) * monthly_v
        portfolio *= 1 + monthly_r + shock
        portfolio += monthly_investment
    return portfolio


def _projected_trajectory(
    monthly_investment: float,
    current_savings: float,
    years: int,
    expected_return: float,
) -> list[TrajectoryPoint]:
    trajectory: list[TrajectoryPoint] = []
    portfolio = current_savings
    cumulative = current_savings
    monthly_r = expected_return / 12
    for y in range(1, years + 1):
        for _ in range(12):
            portfolio *= 1 + monthly_r
            portfolio += monthly_investment
        cumulative += monthly_investment * 12
        trajectory.append(TrajectoryPoint(
            year=y,
            portfolio_value=round(portfolio, 2),
            cumulative_invested=round(cumulative, 2),
            growth=round(portfolio - cumulative, 2),
        ))
    return trajectory


def plan_goal(req: GoalPlanRequest) -> GoalPlanResponse:
    er = EXPECTED_RETURNS[req.risk_profile]
    vol = VOLATILITY[req.risk_profile]
    rng = random.Random(42)

    # Monte Carlo success probability
    successes = 0
    finals: list[float] = []
    for _ in range(MONTE_CARLO_RUNS):
        final = _simulate(req.monthly_investment, req.current_savings, req.timeline_years, er, vol, req.target_amount, rng)
        finals.append(final)
        if final >= req.target_amount:
            successes += 1
    probability = round(successes / MONTE_CARLO_RUNS * 100, 2)

    # Suggest monthly investment if probability is low
    suggested_monthly = req.monthly_investment
    if probability < 70:
        # Binary search for required monthly investment
        lo, hi = 0.0, req.target_amount / max(req.timeline_years * 12, 1) * 2
        for _ in range(50):
            mid = (lo + hi) / 2
            ok = 0
            rng2 = random.Random(42)
            for _ in range(200):
                if _simulate(mid, req.current_savings, req.timeline_years, er, vol, req.target_amount, rng2) >= req.target_amount:
                    ok += 1
            if ok / 200 >= 0.80:
                hi = mid
            else:
                lo = mid
        suggested_monthly = round((lo + hi) / 2, 2)

    trajectory = _projected_trajectory(req.monthly_investment, req.current_savings, req.timeline_years, er)

    # Alternative scenarios
    alternatives: list[AlternativeScenario] = []
    for label, factor in [("Conservative path", 0.85), ("Aggressive path", 1.15), ("Minimal path", 0.70)]:
        alt_monthly = round(req.monthly_investment * factor, 2)
        rng_alt = random.Random(42)
        finals_alt = [_simulate(alt_monthly, req.current_savings, req.timeline_years, er, vol, req.target_amount, rng_alt) for _ in range(200)]
        avg_final = round(sum(finals_alt) / len(finals_alt), 2)
        alternatives.append(AlternativeScenario(
            name=label,
            monthly_investment=alt_monthly,
            final_value=avg_final,
            shortfall_surplus=round(avg_final - req.target_amount, 2),
        ))

    return GoalPlanResponse(
        goal_name=req.goal_name,
        probability_of_success=probability,
        suggested_monthly_investment=suggested_monthly,
        projected_trajectory=trajectory,
        alternative_scenarios=alternatives,
    )
