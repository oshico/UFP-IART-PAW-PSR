<div align="center">

# TerraWatch

[![Website](https://img.shields.io/website?url=https://terrawatch.oshico.org&label=terrawatch.oshico.org)](https://terrawatch.oshico.org)
[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go)](https://go.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet)](https://leafletjs.com)
[![License](https://img.shields.io/badge/license-GPLv3-blue)](LICENSE)

**Authors:** [![oshico](https://img.shields.io/badge/GitHub-oshico-181717?logo=github)](https://github.com/oshico) [![NunoSilva24](https://img.shields.io/badge/GitHub-NunoSilva24-181717?logo=github)](https://github.com/NunoSilva24)

</div>

A platform for monitoring wildfires and other events across Portugal with an interactive map, XLSX data import, and JWT-authenticated user management.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, TypeScript 6, Vite 8, Leaflet 1.9 |
| Backend | Go 1.25, Gin, GORM, PostgreSQL 16 / PostGIS |
| Auth | JWT (access + refresh tokens) |
| Infra | Docker Compose, Traefik, Minio |

## Quick start

```bash
# Backend
cd Backend && cp .env.example .env && air

# Frontend
cd frontend && bun install && bun dev

# Full stack (Docker)
docker compose up -d
```

## Backend (`Backend/`)

### API (`/api/v1`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/ping` | — | Health check |
| `GET` | `/locations/fires` | — | Fire locations. Params: `startDate`, `endDate`, `local`, `year`, `month`, `day` |
| `POST` | `/import/fires` | — | Import fires from XLSX (`file` field) |
| `POST` | `/auth/register` | — | `{ email, password, name }` |
| `POST` | `/auth/login` | — | `{ email, password }` → `{ access_token, refresh_token, expires_in }` |
| `POST` | `/auth/refresh` | — | `{ refresh_token }` |
| `POST` | `/auth/logout` | — | `{ refresh_token }` |
| `GET` | `/auth/me` | Bearer | Current user `{ id, email, name }` |

### Env vars

| Var | Default | Description |
|---|---|---|
| `DB_HOST` / `DB_PORT` | `localhost` / `5432` | PostgreSQL connection |
| `DB_USER` / `DB_PASSWORD` | `postgres` / `password` | Database credentials |
| `DB_NAME` | `terrawatch` | Database name |
| `JWT_SECRET` | — | Signing key |
| `JWT_ACCESS_EXPIRY` / `JWT_REFRESH_EXPIRY` | `15m` / `720h` | Token lifetimes |
| `CORS_ALLOWED_ORIGINS` | `localhost:5173,localhost:4173` | Allowed origins |

## Frontend (`frontend/`)

### Layout

```
src/
├── components/     # Navbar, MapView, FilterBar, Modal
├── features/       # fires/, auth/, map/, disasters/, rescues/, accidents/
├── services/       # api.ts, auth.ts, fireLocation.ts, events.ts, prediction.ts
├── types/          # auth.ts, events.ts, api.ts
└── hooks/          # useLocalStorage, useDebounce
```

### Auth flow

Login/register → backend returns JWT tokens → service fetches user via `GET /auth/me` → tokens + user stored in `localStorage`. `AuthContext` exposes `user`, `isAuthenticated`, `login`, `register`, `logout` to all components.

### Data flow (fires)

```
FilterBar → useFiresData({ startDate, endDate, local })
         → GET /locations/fires?startDate=...&endDate=...&local=...
         → MapView renders <Marker><Popup> on Leaflet
```

### Env var

| Var | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Backend base URL |

## Docker

### Production (`docker-compose.yaml`)

Requires root `.env` with `DOMAIN`, `DB_*`, `VITE_API_URL`. Traefik routes:

| Service | External |
|---|---|
| Backend | `https://terrawatch-api.${DOMAIN}` |
| Frontend | `https://terrawatch.${DOMAIN}` |
| Minio | `https://terrawatch-s3.${DOMAIN}` |

### Dev (`docker-compose.dev.yaml`)

Exposes ports directly: backend `:8080`, frontend `:4173`, PostGIS `:5432`, Minio `:9000`/`:9001`.

### CORS

`CORS_ALLOWED_ORIGINS` controls allowed frontend origins. Defaults to localhost; set to `https://terrawatch.oshico.org` in production.

---

## License

GNU General Public License v3.0 — see [LICENSE](LICENSE).
