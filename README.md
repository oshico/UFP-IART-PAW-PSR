# TerraWatch — Wildfire & Event Monitoring Platform

A full-stack platform for monitoring wildfires and other events across Portugal, featuring an interactive map, data import from Excel files, and user authentication.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Leaflet (react-leaflet) |
| **Backend** | Go 1.25, Gin, GORM, PostgreSQL/PostGIS |
| **Auth** | JWT (access + refresh tokens) |
| **Infra** | Docker Compose, Traefik (reverse proxy), Minio (S3-compatible storage) |

## Project Structure

```
UFP-IART-PAW-PSR/
├── Backend/                      # Go API server
│   ├── cmd/main.go              # Entry point
│   └── internal/
│       ├── db/                  # Database connection & migrations
│       ├── handlers/            # HTTP handlers
│       ├── middleware/          # JWT auth middleware
│       ├── models/              # GORM models (Fire, User, RefreshToken)
│       ├── routes/              # Route definitions
│       └── services/            # Business logic
├── frontend/                     # React SPA
│   └── src/
│       ├── components/          # Shared UI (Navbar, MapView, FilterBar)
│       ├── features/            # Per-tab features (fires, auth, map)
│       ├── services/            # API client layer
│       ├── types/               # TypeScript interfaces
│       └── utils/               # Constants, helpers
├── docker-compose.yaml          # Production (Traefik)
├── docker-compose.dev.yaml      # Development (direct ports)
└── .env                         # Shared environment variables
```

---

## Backend (`Backend/`)

### Stack
- **Go 1.25** + **Gin** web framework
- **GORM** ORM with PostgreSQL/PostGIS
- **JWT** authentication (golang-jwt)
- **Air** for hot reload during development

### Setup

```bash
cd Backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run with hot reload (requires Air)
air

# Or run directly
go run ./cmd/
```

The server starts on `http://localhost:8080`.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `password` | Database password |
| `DB_NAME` | `incendios` | Database name |
| `JWT_SECRET` | `default-secret-...` | JWT signing key |
| `JWT_ACCESS_EXPIRY` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | `720h` | Refresh token lifetime |
| `CORS_ALLOWED_ORIGINS` | `localhost:5173,localhost:4173` | Allowed CORS origins (comma-separated) |

### API Endpoints

All endpoints are prefixed with `/api/v1`.

#### Fire Data

| Method | Path | Description |
|---|---|---|
| `GET` | `/locations/fires` | Query fire locations by date range and/or location |
| `POST` | `/import/fires` | Import fires from XLSX file (multipart upload, field `file`) |

**`GET /locations/fires`** query parameters:

| Param | Type | Example | Description |
|---|---|---|---|
| `startDate` | string (YYYY-MM-DD) | `2025-01-01` | Filter fires on or after this date |
| `endDate` | string (YYYY-MM-DD) | `2025-12-31` | Filter fires on or before this date |
| `local` | string | `Porto` | Filter by location name (ILIKE search) |
| `year` | int | `2025` | Filter by exact year |
| `month` | int | `3` | Filter by exact month |
| `day` | int | `15` | Filter by exact day |

Response: `[{ local, lat, long, date, hour }]`

**Note:** `startDate`/`endDate` is the recommended filter for date ranges. Individual `year`/`month`/`day` params are available for exact matches.

#### Auth

| Method | Path | Auth Required | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Login, returns JWT tokens |
| `POST` | `/auth/refresh` | No | Refresh access token using refresh token |
| `POST` | `/auth/logout` | No | Revoke refresh token |
| `GET` | `/auth/me` | **Yes** | Get current authenticated user |

**Auth request/response:**

- `POST /auth/register` — body: `{ email, password, name }`
- `POST /auth/login` — body: `{ email, password }`
- Both return: `{ access_token, refresh_token, token_type, expires_in }`
- `POST /auth/refresh` — body: `{ refresh_token }`
- `GET /auth/me` — header: `Authorization: Bearer <access_token>`
  - Response: `{ id, email, name }`

#### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/ping` | Health check — returns `{ "message": "pong" }` |

---

## Frontend (`frontend/`)

### Stack
- **React 19** + **TypeScript**
- **Vite** for dev server and builds
- **react-leaflet** (Leaflet) for map visualization
- Native `fetch` (no Axios)

### Setup

```bash
cd frontend
bun install

# Development server (default http://localhost:5173)
bun dev

# Production build
bun run build
bun run preview  # serves build on http://localhost:4173
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Backend API base URL |

### Project Layout (src)

```
src/
├── components/
│   ├── filterBar/     # Year/date range + location filter
│   ├── map/           # Leaflet map view with markers
│   ├── modal/         # Reusable modal component
│   ├── navbar/        # Top navigation bar
│   └── timeFilter/    # Deprecated — replaced by FilterBar
├── features/
│   ├── auth/          # Login/Register modals, AuthContext, ProtectedRoute
│   ├── fires/         # Fires tab (active) — uses backend fire endpoint
│   ├── disasters/     # Placeholder tab
│   ├── rescues/       # Placeholder tab
│   ├── accidents/     # Placeholder tab
│   └── map/           # Map hooks and components
├── services/
│   ├── api.ts         # Generic fetch wrapper (apiFetch, apiGet, apiPost)
│   ├── auth.ts        # Auth API calls (login, register, logout, refresh)
│   ├── events.ts      # Generic event API calls (for future endpoints)
│   ├── fireLocation.ts # Fire locations API call
│   └── prediction.ts  # Prediction API calls
├── types/
│   ├── api.ts         # Pagination, API response types
│   ├── auth.ts        # User, AuthTokens, AuthState
│   └── events.ts      # FireEvent, DisasterEvent, TerraWatchEvent union
└── hooks/
    ├── useLocalStorage.ts
    ├── useDebounce.ts
    └── ...
```

### Auth Flow

1. User opens Login/Register modal
2. On submit, service calls `POST /auth/login` or `POST /auth/register`
3. Backend returns JWT tokens, service fetches user via `GET /auth/me`
4. Tokens and user are stored in `localStorage` (`auth_tokens`, `auth_user`)
5. `AuthContext` provides `user`, `isAuthenticated`, `login`, `register`, `logout`
6. On logout, `POST /auth/logout` revokes the refresh token, local state is cleared
7. Protected routes (Predictions tab) show auth modals if not authenticated

### Data Flow (Fires Tab)

```
FiresTab
  └─ FilterBar — user selects date range + location
       └─ onFilterChange({ startDate, endDate, local })
            └─ useFiresData(filters)
                 └─ GET /api/v1/locations/fires?startDate=...&endDate=...&local=...
                      └─ FireLocation[] mapped to MapMarker[]
                           └─ MapView renders <Marker><Popup> on Leaflet
```

---

## Docker Compose

### Prerequisites

- Docker and Docker Compose
- A `.env` file at the project root with required variables (see `.env.example`)

### Production (`docker-compose.yaml`)

Uses **Traefik** as a reverse proxy with automatic HTTPS via Cloudflare.

```bash
# Required .env variables:
# DOMAIN=oshico.org
# DB_HOST=postgis_db
# DB_USER=...
# DB_PASSWORD=...
# DB_NAME=terrawatch
# VITE_API_URL=https://terrawatch-api.${DOMAIN}

docker compose up -d
```

Services:

| Service | Internal Port | External (via Traefik) |
|---|---|---|
| `go_backend` | `:8080` | `https://terrawatch-api.${DOMAIN}` |
| `react_frontend` | `:4173` | `https://terrawatch.${DOMAIN}` |
| `postgis_db` | `:5432` | — (internal only) |
| `minio_bucket` | `:9000` / `:9001` | `https://terrawatch-s3.${DOMAIN}` / `https://minio.${DOMAIN}` |

### Development (`docker-compose.dev.yaml`)

Exposes ports directly for local development without Traefik.

```bash
docker compose -f docker-compose.dev.yaml up -d
```

Services:

| Service | Port |
|---|---|
| `go_backend` | `localhost:8080` |
| `react_frontend` | `localhost:4173` |
| `postgis_db` | `localhost:5432` |
| `minio_bucket` | `localhost:9000` / `localhost:9001` |

### CORS Configuration

The backend reads `CORS_ALLOWED_ORIGINS` to control which frontend origins are allowed:

| Environment | Typical Value |
|---|---|
| Local development | `http://localhost:5173,http://localhost:4173` |
| Production | `https://terrawatch.oshico.org` |

If not set, the backend defaults to allowing `localhost:5173` and `localhost:4173`.

---

## Development Workflow

### Local (without Docker)

```bash
# Terminal 1 — Backend
cd Backend
cp .env.example .env
# Edit .env with your local PostgreSQL credentials (DB_HOST=localhost, DB_NAME=incendios)
air

# Terminal 2 — Frontend
cd frontend
bun install
bun dev
```

Visit `http://localhost:5173` — the frontend auto-proxies API calls to `http://localhost:8080/api/v1`.

### Importing Fire Data

1. Ensure the backend is running and connected to the database
2. Upload an XLSX file matching the SGIF format:
   ```bash
   curl -X POST http://localhost:8080/api/v1/import/fires \
     -F "file=@path/to/incendios.xlsx"
   ```

---

## License

See [LICENSE](./LICENSE) for details.
