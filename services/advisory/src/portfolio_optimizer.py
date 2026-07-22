from __future__ import annotations

from src.data import MARKET_DATA, MOCK_PRODUCTS
from src.models import (
    Allocation,
    PortfolioOptimizeRequest,
    PortfolioOptimizeResponse,
    RebalancingAction,
    Recommendation,
    RiskLevel,
)

TARGET_ALLOCATIONS: dict[RiskLevel, dict[str, float]] = {
    RiskLevel.CONSERVATIVE: {"equity": 30, "debt": 40, "gold": 15, "reit": 15},
    RiskLevel.MODERATE: {"equity": 50, "debt": 25, "gold": 10, "reit": 15},
    RiskLevel.AGGRESSIVE: {"equity": 70, "debt": 10, "gold": 5, "reit": 15},
}

EXPECTED_RETURNS: dict[str, str] = {
    "equity": "12-15%",
    "debt": "7-8%",
    "gold": "8-10%",
    "reit": "10-12%",
}

RISK_RATINGS: dict[RiskLevel, dict[str, str]] = {
    RiskLevel.CONSERVATIVE: {"equity": "Medium", "debt": "Low", "gold": "Low-Medium", "reit": "Medium"},
    RiskLevel.MODERATE: {"equity": "Medium-High", "debt": "Low", "gold": "Low-Medium", "reit": "Medium"},
    RiskLevel.AGGRESSIVE: {"equity": "High", "debt": "Low", "gold": "Low-Medium", "reit": "Medium"},
}


def optimize_portfolio(req: PortfolioOptimizeRequest) -> PortfolioOptimizeResponse:
    target = TARGET_ALLOCATIONS[req.risk_profile]

    # Current allocation by type
    current_by_type: dict[str, float] = {}
    for h in req.current_holdings:
        current_by_type[h.type] = current_by_type.get(h.type, 0) + h.percentage

    allocations = []
    rebalancing: list[RebalancingAction] = []
    for asset_class, target_pct in target.items():
        current_pct = round(current_by_type.get(asset_class, 0), 2)
        diff = round(target_pct - current_pct, 2)
        if abs(diff) < 1:
            action = "Hold"
        elif diff > 0:
            action = f"Increase by {diff}%"
        else:
            action = f"Decrease by {abs(diff)}%"
        allocations.append(Allocation(
            asset_class=asset_class,
            target_pct=target_pct,
            current_pct=current_pct,
            recommended_action=action,
        ))

    # Build rebalancing actions
    total_value = sum(h.value for h in req.current_holdings)
    for asset_class, target_pct in target.items():
        current_val = sum(h.value for h in req.current_holdings if h.type == asset_class)
        target_val = total_value * target_pct / 100
        diff_val = round(target_val - current_val, 2)
        if abs(diff_val) > total_value * 0.01:
            rebalancing.append(RebalancingAction(
                symbol=f"ALLOC-{asset_class.upper()}",
                type=asset_class,
                action="Buy" if diff_val > 0 else "Sell",
                amount=abs(diff_val),
                reason=f"Rebalance {asset_class} to {target_pct}% target",
            ))

    # Recommendations
    recommendations: list[Recommendation] = []
    for asset_class, target_pct in target.items():
        products = MOCK_PRODUCTS.get(asset_class, [])
        if products:
            p = products[0]
            recommendations.append(Recommendation(
                symbol=p["symbol"],
                name=p["name"],
                type=asset_class,
                reason=f"Suitable {asset_class} product for {req.risk_profile.value} profile",
                expected_return_range=EXPECTED_RETURNS[asset_class],
            ))

    return PortfolioOptimizeResponse(
        suggested_allocation=allocations,
        recommendations=recommendations,
        rebalancing_actions=rebalancing,
    )
