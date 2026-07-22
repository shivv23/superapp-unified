const AUTH_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";
const PORTFOLIO_BASE = process.env.NEXT_PUBLIC_PORTFOLIO_API_URL || "http://localhost:8002";
const MARKETPLACE_BASE = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || "http://localhost:8003";
const ADVISORY_BASE = process.env.NEXT_PUBLIC_ADVISORY_API_URL || "http://localhost:8004";

const TOKEN_KEY = "superapp_access_token";
const REFRESH_KEY = "superapp_refresh_token";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem("superapp_auth");
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${AUTH_BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const data = await res.json();
    if (data.status === "success" && data.data?.tokens?.access_token) {
      setTokens(data.data.tokens.access_token, data.data.tokens.refresh_token);
      return data.data.tokens.access_token;
    }
  } catch {}
  return null;
}

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

async function apiFetch(url: string, options: ApiOptions = {}): Promise<unknown> {
  const { requireAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string> || {}),
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  if (res.status === 401 && requireAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      const retryRes = await fetch(url, { ...fetchOptions, headers });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({ message: "Request failed" }));
        throw new Error(err.message || `HTTP ${retryRes.status}`);
      }
      return retryRes.json();
    }
    clearTokens();
    window.location.href = "/auth/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Auth Service ───────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
}

export async function apiRegister(email: string, password: string, fullName: string, phone: string) {
  const data = (await apiFetch(`${AUTH_BASE}/api/v1/auth/register`, {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName, phone }),
  })) as AuthResponse;

  if (data.status === "success") {
    setTokens(data.data.tokens.access_token, data.data.tokens.refresh_token);
    localStorage.setItem("superapp_auth", JSON.stringify(data.data.user));
  }

  return data;
}

export async function apiLogin(email: string, password: string) {
  const data = (await apiFetch(`${AUTH_BASE}/api/v1/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })) as AuthResponse;

  if (data.status === "success") {
    setTokens(data.data.tokens.access_token, data.data.tokens.refresh_token);
    localStorage.setItem("superapp_auth", JSON.stringify(data.data.user));
  }

  return data;
}

export async function apiLogout() {
  try {
    const refreshToken = getRefreshToken();
    await apiFetch(`${AUTH_BASE}/api/v1/auth/logout`, {
      method: "POST",
      requireAuth: true,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {}
  clearTokens();
}

export async function apiGetProfile() {
  return apiFetch(`${AUTH_BASE}/api/v1/auth/profile`, { requireAuth: true }) as Promise<{
    status: string;
    data: { user: AuthUser };
  }>;
}

// ─── Portfolio Service ──────────────────────────────────────

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  overall_pnl: number;
  day_change: number;
  day_change_pct: number;
  total_returns_pct: number;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  avg_price: number;
  ltp: number;
  invested_value: number;
  current_value: number;
  pnl: number;
  returns_pct: number;
  day_change_pct: number;
}

export interface AssetAllocation {
  type: string;
  value: number;
  percentage: number;
}

export interface PerformancePoint {
  month: string;
  invested_value: number;
  portfolio_value: number;
}

export interface Transaction {
  id: string;
  type: string;
  symbol: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

export interface RiskProfile {
  risk_score: number;
  risk_level: string;
  factors: { name: string; score: number; description: string }[];
}

export async function apiGetPortfolioSummary() {
  return apiFetch(`${PORTFOLIO_BASE}/api/v1/portfolio/summary`) as Promise<{ status: string; data: PortfolioSummary }>;
}

export async function apiGetHoldings() {
  return apiFetch(`${PORTFOLIO_BASE}/api/v1/portfolio/holdings`) as Promise<{ status: string; data: Holding[] }>;
}

export async function apiGetAssetAllocation() {
  return apiFetch(`${PORTFOLIO_BASE}/api/v1/portfolio/asset-allocation`) as Promise<{ status: string; data: AssetAllocation[] }>;
}

export async function apiGetPerformance() {
  return apiFetch(`${PORTFOLIO_BASE}/api/v1/portfolio/performance`) as Promise<{ status: string; data: PerformancePoint[] }>;
}

export async function apiGetTransactions() {
  return apiFetch(`${PORTFOLIO_BASE}/api/v1/portfolio/transactions`) as Promise<{ status: string; data: Transaction[] }>;
}

export async function apiGetRiskProfile() {
  return apiFetch(`${PORTFOLIO_BASE}/api/v1/portfolio/risk-profile`) as Promise<{ status: string; data: RiskProfile }>;
}

// ─── Marketplace Service ────────────────────────────────────

export interface MarketProduct {
  id: string;
  name: string;
  ticker: string;
  type: string;
  sub_type: string;
  description: string;
  min_investment: number;
  risk_level: string;
  expected_returns: string;
  current_price: number;
  rating: number;
  isin: string;
  sector?: string;
  market_cap_cr?: number;
  pe_ratio?: number;
  expense_ratio?: number;
  fund_manager?: string;
  aum_crores?: number;
  coupon_rate?: number;
  maturity_date?: string;
  credit_rating?: string;
  issuer?: string;
  distribution_yield?: number;
  occupancy_rate?: number;
  is_featured: boolean;
}

export interface MarketplaceResponse {
  success: boolean;
  data: MarketProduct[];
  meta: { page: number; limit: number; total: number; total_pages: number };
}

export interface CategoryCount {
  type: string;
  count: number;
}

export async function apiGetProducts(params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch(`${MARKETPLACE_BASE}/api/v1/marketplace/products${qs}`) as Promise<MarketplaceResponse>;
}

export async function apiGetProduct(id: string) {
  return apiFetch(`${MARKETPLACE_BASE}/api/v1/marketplace/products/${id}`) as Promise<{ success: boolean; data: MarketProduct }>;
}

export async function apiGetCategories() {
  return apiFetch(`${MARKETPLACE_BASE}/api/v1/marketplace/categories`) as Promise<{ success: boolean; data: CategoryCount[] }>;
}

export async function apiGetFeatured() {
  return apiFetch(`${MARKETPLACE_BASE}/api/v1/marketplace/featured`) as Promise<{ success: boolean; data: MarketProduct[] }>;
}

export async function apiCreateOrder(productId: string, quantity: number, orderType: string, userId: string) {
  return apiFetch(`${MARKETPLACE_BASE}/api/v1/marketplace/orders`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity, order_type: orderType, user_id: userId }),
  }) as Promise<{ success: boolean; data: { id: string; status: string; total_amount: number } }>;
}

// ─── Advisory Service ───────────────────────────────────────

export interface RiskProfileRequest {
  age: number;
  income: number;
  net_worth: number;
  investment_experience: number;
  investment_goal: string;
  risk_tolerance: number;
  time_horizon: number;
  monthly_income_pct_invest: number;
}

export interface RiskProfileResponse {
  risk_score: number;
  risk_level: string;
  profile_summary: string;
  factor_breakdown: { factor: string; weight: number; score: number; contribution: number }[];
}

export interface GoalPlanRequest {
  goal_name: string;
  target_amount: number;
  timeline_years: number;
  monthly_investment: number;
  current_savings: number;
  risk_profile: string;
}

export interface GoalPlanResponse {
  goal_name: string;
  probability_of_success: number;
  suggested_monthly_investment: number;
  projected_trajectory: { year: number; portfolio_value: number; cumulative_invested: number; growth: number }[];
  alternative_scenarios: { name: string; monthly_investment: number; final_value: number; shortfall_surplus: number }[];
}

export interface Recommendation {
  symbol: string;
  name: string;
  asset_class: string;
  expected_annual_return: string;
  risk_rating: string;
  reason: string;
}

export interface MarketTrend {
  theme: string;
  outlook: string;
  detail: string;
}

export interface SectorPerformance {
  sector: string;
  ytd_return_pct: number;
  outlook: string;
}

export interface TopPick {
  symbol: string;
  name: string;
  rationale: string;
}

export async function apiGetRiskProfileAdvisory(params: RiskProfileRequest) {
  return apiFetch(`${ADVISORY_BASE}/api/v1/advisory/risk-profile`, {
    method: "POST",
    body: JSON.stringify(params),
  }) as Promise<{ status: string; data: RiskProfileResponse }>;
}

export async function apiGetRecommendations(riskProfile: string, investmentAmount: number) {
  const qs = new URLSearchParams({ risk_profile: riskProfile, investment_amount: String(investmentAmount) }).toString();
  return apiFetch(`${ADVISORY_BASE}/api/v1/advisory/recommendations?${qs}`) as Promise<{
    status: string;
    data: { recommendations: Recommendation[] };
  }>;
}

export async function apiGetMarketInsights() {
  return apiFetch(`${ADVISORY_BASE}/api/v1/advisory/market-insights`) as Promise<{
    status: string;
    data: { market_trends: MarketTrend[]; sector_performance: SectorPerformance[]; top_picks: TopPick[] };
  }>;
}

export async function apiGoalPlan(params: GoalPlanRequest) {
  return apiFetch(`${ADVISORY_BASE}/api/v1/advisory/goal-plan`, {
    method: "POST",
    body: JSON.stringify(params),
  }) as Promise<{ status: string; data: GoalPlanResponse }>;
}

export async function apiPortfolioOptimize(currentHoldings: { symbol: string; type: string; value: number; percentage: number }[], riskProfile: string) {
  return apiFetch(`${ADVISORY_BASE}/api/v1/advisory/portfolio-optimize`, {
    method: "POST",
    body: JSON.stringify({ current_holdings: currentHoldings, risk_profile: riskProfile }),
  }) as Promise<{ status: string; data: { suggested_allocation: unknown[]; recommendations: unknown[]; rebalancing_actions: unknown[] } }>;
}
