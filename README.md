# SuperApp Unified

**AI-Native Multi-Asset Investment Platform for Retail Investors**

SuperApp Unified is a full-stack fintech platform that consolidates every asset class — equities, mutual funds, bonds, REITs, InvITs, gold, and more — into a single intelligent dashboard. It combines real-time portfolio aggregation, AI-powered advisory, gamified financial literacy, and a unified marketplace to make sophisticated investment tools accessible to every Indian investor.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Services](#services)
- [API Reference](#api-reference)
- [Infrastructure](#infrastructure)
- [Design System](#design-system)
- [Contributing](#contributing)

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│              Port 3000 · React · Tailwind                │
└──────────┬──────────────┬──────────────┬────────────────┘
           │              │              │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼────────┐
    │  Auth (Go)  │ │Portfolio   │ │Marketplace  │
    │  Port 8001  │ │(Go) 8002   │ │(Node) 8003  │
    └──────┬──────┘ └─────┬──────┘ └────┬────────┘
           │              │              │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼────────┐
    │  Advisory   │ │  Postgres  │ │   Redis     │
    │ (Python)    │ │  Port 5432 │ │  Port 6379  │
    │  Port 8004  │ └────────────┘ └─────────────┘
    └─────────────┘
```

The platform follows a **polyglot microservices architecture** — each service is implemented in the language best suited to its domain:

| Service | Language | Framework | Responsibility |
|---------|----------|-----------|----------------|
| Frontend | TypeScript | Next.js 14 (App Router) | UI, routing, client-side state |
| Auth | Go | Chi router | Registration, login, JWT, RBAC |
| Portfolio | Go | Chi router | Holdings aggregation, P&L, risk profiling |
| Marketplace | Node.js | Express | Product catalog, orders, filtering |
| Advisory | Python | FastAPI | Risk assessment, goal planning, AI recommendations |

---

## Tech Stack

### Frontend
- **Next.js 14** with App Router and Server Components
- **TypeScript** for end-to-end type safety
- **Tailwind CSS** with custom design tokens (Navy, Blue, Gold palette)
- **Framer Motion** for page transitions and micro-interactions
- **Recharts** for data visualization (area charts, pie charts, bar charts)
- **Glassmorphism** dark theme with backdrop blur effects

### Backend
- **Go 1.25** — Auth and Portfolio services (Chi router, bcrypt, JWT)
- **Node.js** — Marketplace service (Express, REST API)
- **Python 3.13** — Advisory service (FastAPI, Pydantic validation)

### Data & Infrastructure
- **PostgreSQL** — User data, tokens, session management
- **Redis** — Caching, rate limiting
- **Docker & Docker Compose** — Containerized development and deployment
- **Kubernetes** — Production manifests with HPA, Ingress, network policies
- **GitHub Actions** — CI/CD pipeline with lint, test, build, deploy stages

---

## Features

### Portfolio Management
- Consolidated view across all asset classes (equities, MFs, REITs, InvITs, bonds, gold)
- Real-time P&L tracking with day change alerts
- Asset allocation visualization with interactive pie charts
- Performance history with benchmark comparison
- Risk profile scoring with factor breakdown

### AI-Powered Advisory
- Risk profiling based on age, income, experience, and goals
- Portfolio optimization with suggested rebalancing actions
- Goal-based planning with Monte Carlo simulations
- Market insights with sector performance and trend analysis
- Personalized investment recommendations

### Marketplace
- Browse and filter across 15+ asset classes
- Advanced search with sorting (returns, rating, min investment)
- Product detail pages with risk ratings and expected returns
- Order placement with buy/sell/subscribe support

### Financial Literacy
- Structured learning paths from beginner to advanced
- Progress tracking with streaks and achievement badges
- Gamification system with XP, levels, and leaderboard

### Additional Tools
- **IPO Tracker** — upcoming, live, and past IPO tracking with AI predictions
- **Tax Optimizer** — capital gains analysis, loss harvesting opportunities, Section 80C recommendations
- **Advanced Analytics** — factor exposure, correlation matrix, Monte Carlo simulation, drawdown analysis

---

## Project Structure

```
superapp-unified/
├── apps/
│   └── web/                          # Next.js frontend
│       └── src/
│           ├── app/                   # App Router pages
│           │   ├── auth/              # Login, Register
│           │   └── dashboard/         # All dashboard routes
│           ├── components/            # Reusable UI components
│           │   ├── ui/                # Button, Card, Badge, etc.
│           │   ├── layout/            # Sidebar, Header, DashboardLayout
│           │   └── ai-assistant/      # Floating AI chat panel
│           └── lib/                   # API client, auth context, utils
├── services/
│   ├── auth/                          # Go auth service
│   │   ├── cmd/main.go
│   │   └── internal/
│   │       ├── handler/               # HTTP handlers
│   │       ├── middleware/            # JWT auth middleware
│   │       ├── model/                 # Request/response structs
│   │       └── repository/            # Data access layer
│   ├── portfolio/                     # Go portfolio service
│   ├── marketplace/                   # Node.js marketplace service
│   │   └── src/
│   │       ├── routes/                # Express route handlers
│   │       └── data/                  # Product catalog
│   └── advisory/                      # Python advisory service
│       └── src/
│           ├── routes/                # FastAPI routers
│           ├── risk_engine.py         # Risk profiling engine
│           ├── portfolio_optimizer.py # Portfolio optimization
│           └── monte_carlo.py         # Goal planning simulations
├── infra/
│   └── k8s/                           # Kubernetes manifests
├── .github/workflows/                 # CI/CD pipeline
├── docker-compose.yml                 # Full stack orchestration
├── turbo.json                         # Turborepo config
└── Makefile                           # Dev shortcuts
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Go** ≥ 1.21
- **Python** ≥ 3.11
- **Docker & Docker Compose** (optional, for full stack)

### Quick Start (Frontend Only)

```bash
# Clone the repository
git clone https://github.com/your-org/superapp-unified.git
cd superapp-unified

# Install dependencies
npm install

# Start the frontend
cd apps/web
npm run dev
```

The app will be available at `http://localhost:3000`.

### Full Stack with Docker

```bash
# Start all services
docker-compose up --build

# Or start individual services
docker-compose up auth-service
docker-compose up portfolio-service
docker-compose up marketplace-service
docker-compose up advisory-service
```

### Individual Service Setup

#### Auth Service (Go)
```bash
cd services/auth
go mod tidy
go run cmd/main.go
# Runs on http://localhost:8001
```

#### Portfolio Service (Go)
```bash
cd services/portfolio
go mod tidy
go run cmd/main.go
# Runs on http://localhost:8002
```

#### Marketplace Service (Node.js)
```bash
cd services/marketplace
npm install
npm start
# Runs on http://localhost:8003
```

#### Advisory Service (Python)
```bash
cd services/advisory
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --port 8004
# Runs on http://localhost:8004
```

---

## Services

### Auth Service
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | No | Create account |
| `/api/v1/auth/login` | POST | No | Sign in, receive JWT |
| `/api/v1/auth/refresh` | POST | No | Refresh access token |
| `/api/v1/auth/logout` | POST | Yes | Invalidate session |
| `/api/v1/auth/profile` | GET | Yes | Get user profile |
| `/api/v1/auth/profile` | PUT | Yes | Update profile |

### Portfolio Service
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/portfolio/summary` | GET | Portfolio summary (invested, current, P&L) |
| `/api/v1/portfolio/holdings` | GET | All holdings with live prices |
| `/api/v1/portfolio/asset-allocation` | GET | Allocation breakdown by asset class |
| `/api/v1/portfolio/performance` | GET | Historical performance data |
| `/api/v1/portfolio/transactions` | GET | Transaction history |
| `/api/v1/portfolio/risk-profile` | GET | Risk score and factor breakdown |

### Marketplace Service
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/marketplace/products` | GET | List/filter products |
| `/api/v1/marketplace/products/:id` | GET | Product details |
| `/api/v1/marketplace/categories` | GET | Category counts |
| `/api/v1/marketplace/featured` | GET | Featured products |
| `/api/v1/marketplace/orders` | POST | Place an order |

### Advisory Service
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/advisory/risk-profile` | POST | Generate risk profile |
| `/api/v1/advisory/recommendations` | GET | Investment recommendations |
| `/api/v1/advisory/portfolio-optimize` | POST | Portfolio optimization |
| `/api/v1/advisory/goal-plan` | POST | Goal-based planning |
| `/api/v1/advisory/market-insights` | GET | Market trends and sector data |

---

## Infrastructure

### Docker Compose
The `docker-compose.yml` orchestrates all services with:
- PostgreSQL with persistent volumes
- Redis for caching
- Kafka for event streaming (prepared for real-time data feeds)
- Health checks for all services

### Kubernetes
Production-ready manifests in `infra/k8s/`:
- **Deployments** with resource limits and health probes
- **Services** with ClusterIP networking
- **Ingress** with TLS termination
- **HPA** (Horizontal Pod Autoscaler) for auth, portfolio, and marketplace
- **Network Policies** for service-to-service communication
- **ConfigMaps & Secrets** for environment configuration

### CI/CD
GitHub Actions pipeline (`ci.yml`):
1. **Lint** — ESLint for frontend, golangci-lint for Go, ruff for Python
2. **Type Check** — TypeScript compilation
3. **Test** — Unit tests across all services
4. **Build** — Production builds for all services
5. **Docker** — Container image builds
6. **Deploy** — Kubernetes deployment (on main branch)

---

## Design System

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#0B1D3A` | Primary background |
| Blue | `#1A56DB` | Primary accent, CTAs |
| Gold | `#F5A623` | Secondary accent, highlights |
| Glass | `rgba(255,255,255,0.05)` | Card backgrounds |
| Blur | `backdrop-blur-xl` | Glassmorphism effect |

Typography: System font stack with `-apple-system, BlinkMacSystemFont, "Segoe UI"`.
All interactive elements include hover states, focus rings, and transitions (200ms ease).

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code restructuring without behavior change
- `docs:` — Documentation changes
- `chore:` — Maintenance tasks
- `test:` — Adding or updating tests

---

## License

This project is proprietary software. All rights reserved.

---

Built with a focus on accessibility, performance, and developer experience.
