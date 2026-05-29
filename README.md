<div align="center">

# TerraWatch

[![Website](https://img.shields.io/website?url=https://terrawatch.oshico.org&label=terrawatch.oshico.org)](https://terrawatch.oshico.org)
[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go)](https://go.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)](https://leafletjs.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![License](https://img.shields.io/badge/license-GPLv3-blue)](LICENSE)

**Authors:** [![oshico](https://img.shields.io/badge/GitHub-oshico-181717?logo=github)](https://github.com/oshico) [![NunoSilva24](https://img.shields.io/badge/GitHub-NunoSilva24-181717?logo=github)](https://github.com/NunoSilva24)

</div>

A platform for monitoring and predicting wildfires and rainfall across Portugal. Features an interactive Leaflet map, statistics dashboard, XLSX data import with async processing, and Prophet-based time-series forecasting.

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌───────────────────┐
│  Frontend    │────▶│  Backend     │────▶│  PostGIS          │
│  (React 19)  │     │  (Go/Gin)    │     │  (PostgreSQL +    │
│  :4173       │     │  :8080       │     │   PostGIS) :5432  │
└──────┬───────┘     └──────┬───────┘     └───────────────────┘
       │                    │                      ▲
       │           ┌────────▼───────┐              │
       └──────────▶│  Prediction   │───────────────┘
                   │  Engine       │
                   │  (FastAPI)    │
                   │  :8000        │
                   └───────┬───────┘
                           │
                   ┌───────▼───────┐
                   │  MinIO        │
                   │  (S3 storage) │
                   │  :9000        │
                   └───────────────┘
```

| Service | Language | Framework | Port | Purpose |
|---|---|---|---|---|
| **Frontend** | TypeScript 6 | React 19, Vite 8, Leaflet 1.9 | 4173 | SPA with interactive maps, dashboard, predictions UI |
| **Backend** | Go 1.25 | Gin, GORM | 8080 | REST API — auth, locations, stats, file import |
| **Prediction Engine** | Python 3.12 | FastAPI, Prophet | 8000 | ML forecasting for fire and rainfall |
| **PostGIS** | PostgreSQL 16 | PostGIS | 5432 | Geospatial database |
| **MinIO** | Go | MinIO S3 | 9000 / 9001 | Object storage for ML model artifacts |

## Features

- **Wildfire monitoring** — view fire locations on a map filtered by date range, district, and location name
- **Rainfall monitoring** — precipitation data by city and year
- **Statistics dashboard** — bar charts for fires by district, month, cause group, and year
- **ML predictions** — Prophet-based forecasts for fire counts (monthly, per district) and precipitation (yearly, per city), with 80% confidence intervals
- **Data import** — drag-and-drop XLSX upload for fires (SGIF format) and rainfall data, with async processing and status polling
- **Authentication** — JWT access/refresh tokens with registration, login, and token rotation

## Quick start

### Docker (recommended)

```bash
# Development — all services with exposed ports
docker compose -f docker-compose.dev.yaml up -d

# Production — requires Traefik on a shared 'proxy' network
docker compose up -d
```

### Manual

```bash
# Backend
cd backend && cp .env.example .env && air

# Prediction engine
cd predictionEngine && uv sync --no-dev && uv run uvicorn app.main:app --reload

# Frontend
cd frontend && bun install && bun dev
```

## Project structure

```
├── backend/              # Go REST API (Gin + GORM)
├── frontend/             # React SPA (Vite + TypeScript)
├── predictionEngine/     # Python ML service (FastAPI + Prophet)
├── docker-compose.yaml       # Production (Traefik reverse-proxy)
└── docker-compose.dev.yaml   # Development (direct port mapping)
```

## Backend

**Base path:** `/api/v1` — full reference on the [Wiki](https://github.com/oshico/UFP-IART-PAW-PSR/wiki).

| Group | Endpoints | Auth |
|---|---|---|
| `GET /ping` | Health check | — |
| `/auth/*` | register, login, refresh, logout, me | me requires Bearer |
| `/locations/*` | fires, rains | — |
| `/stats/*` | fires/by-district, by-year, by-cause-group, by-month | — |
| `/meta/*` | cause-groups, cause-descriptions, alert-sources | — |
| `/import/*` | fires, rains (XLSX upload + status polling) | Bearer |

### Env vars

```
❯ cat backend/.env.example

DB_HOST=localhost           DB_USER=postgres
DB_PASSWORD=password        DB_NAME=terrawatch     DB_PORT=5432
JWT_SECRET=change-me        JWT_ACCESS_EXPIRY=15m  JWT_REFRESH_EXPIRY=720h
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:4173
```

## Frontend

### Tabs

| Tab | Component | Auth | Description |
|---|---|---|---|
| Fires | `FiresTab` | — | Map with fire markers, date/location filters |
| Rainfall | `RainTab` | — | Map with rain markers, city/year filters |
| Disasters / Rescues / Accidents | Stubs | — | Placeholder tabs |
| Predictions | `PredictionsTab` | Required | Fire/rain forecasts with model training |
| Dashboard | `DashboardTab` | Required | Statistics charts + XLSX import |

### Auth flow

Login/register → backend returns JWT tokens → service fetches user via `GET /auth/me` → tokens + user stored in `localStorage`. `AuthContext` exposes `user`, `isAuthenticated`, `login`, `register`, `logout` to all components.

### Layout

```
src/
├── components/       # Navbar, MapView, FilterBar, Modal, LoadingSpinner, TimeFilter
├── features/         # fires/, rain/, auth/, map/, dashboard/, disasters/, rescues/, accidents/, prediction/
├── services/         # api, auth, fireLocation, rainLocation, dashboard, import, predictions
├── types/            # auth, events, api
├── hooks/            # useLocalStorage, useDebounce
└── utils/            # constants, dateUtils
```

### Env vars

```
❯ cat frontend/.env.example

VITE_API_URL=http://localhost:8080/api/v1
VITE_PE_API_URL=http://localhost:8000
```

## Prediction Engine

FastAPI service that trains and serves **Prophet** time-series models for fire and rainfall forecasts.

### Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service health + loaded model counts |
| `POST` | `/train/fires` | Train Prophet models per district from database data |
| `POST` | `/train/rains` | Train Prophet models per city from database data |
| `GET` | `/predictions/fires?district=&months=` | Generate fire predictions (1–60 months, default 12) |
| `GET` | `/predictions/rains?city=&years=` | Generate rain predictions (1–20 years, default 5) |
| `GET` | `/models` | List all trained models (MinIO + in-memory) |

- Models are serialised with pickle and stored in MinIO under `models/fire/{district}.pkl` / `models/rain/{city}.pkl`
- Predictions are cached to the `predictions` table in PostGIS

## Docker

### Production (`docker-compose.yaml`)

Requires root `.env` with `DOMAIN`, `DB_*`, `JWT_*`, `MINIO_*`, `PE_BUCKET_NAME`, `VITE_*`. All services are behind **Traefik** (external `proxy` network with Cloudflare TLS resolver).

| Service | Traefik hostname |
|---|---|
| Backend | `https://terrawatch-api.${DOMAIN}` |
| Prediction Engine | `https://terrawatch-pe.${DOMAIN}` |
| Frontend | `https://terrawatch.${DOMAIN}` |
| MinIO API | `https://terrawatch-s3.${DOMAIN}` |
| MinIO Console | `https://minio.${DOMAIN}` |

### Development (`docker-compose.dev.yaml`)

Exposes ports directly with dev-friendly defaults. No Traefik required.

| Service | Port |
|---|---|
| PostGIS | `5432` |
| MinIO | `9000` (S3) / `9001` (Console) |
| Backend | `8080` |
| Prediction Engine | `8000` |
| Frontend | `4173` |

### CORS

`CORS_ALLOWED_ORIGINS` is set on both the backend (Go/Gin) and prediction engine (FastAPI). Defaults to `http://localhost:5173,http://localhost:4173` in dev; set to `https://terrawatch.${DOMAIN}` in production.

## Environment variables

```
❯ cat .env.example

# PostGIS
POSTGRES_USER=           POSTGRES_PASSWORD=        POSTGRES_DB=

# MinIO
MINIO_ROOT_USER=         MINIO_ROOT_PASSWORD=

# Backend
DB_HOST=                 DB_USER=                  DB_PASSWORD=
DB_NAME=                 DB_PORT=
JWT_SECRET=              JWT_ACCESS_EXPIRY=        JWT_REFRESH_EXPIRY=

# Frontend (build args)
VITE_API_URL=

# Prediction Engine
PE_BUCKET_NAME=          VITE_PE_API_URL=

# Traefik routing
DOMAIN=
```

---

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
