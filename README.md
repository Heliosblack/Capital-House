# 🏠 Capital House — كابيتال هاوس

> Jordan's premier real estate platform — Arabic-first, agent-focused, QR-powered.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-000000?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Cache-Redis%207-DC382D?logo=redis)](https://redis.io)

---

## Overview

Capital House is a full-stack real estate marketplace built for the Jordanian market. It covers all 12 governorates and all property types — apartments, villas, homes, land, agricultural farms, and commercial units.

**Key differentiators:**
- Arabic-first RTL design with full English bilingual support
- QR code marketing assets for yard signs and flyers
- Built-in CRM replacing WhatsApp chaos for agents
- Farm and land specialization with dedicated filters
- Property verification with trust badges
- PWA — installable on mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, next-intl (ar/en) |
| Backend | FastAPI (Python), async SQLAlchemy 2.0, Pydantic v2 |
| Database | PostgreSQL 16 |
| Cache / Sessions | Redis 7 |
| Search | Meilisearch v1.7 |
| Media Storage | Cloudflare R2 |
| Auth | Phone OTP via Twilio + JWT (access + refresh) |
| Payments | MyFatoorah (JOD) |
| Email | Resend |
| Maps | Leaflet (react-leaflet) |

---

## Project Structure

```
Capital-House/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/           # Route handlers
│   │   │   ├── auth.py       # OTP + JWT auth
│   │   │   ├── listings.py   # Listings CRUD
│   │   │   ├── leads.py      # Lead inbox
│   │   │   └── qrcodes.py    # QR generation + scan tracking
│   │   ├── core/
│   │   │   ├── config.py     # Pydantic settings
│   │   │   ├── database.py   # Async SQLAlchemy engine
│   │   │   └── security.py   # JWT + password helpers
│   │   ├── models/           # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── listing.py
│   │   │   ├── lead.py
│   │   │   ├── qr_code.py
│   │   │   ├── subscription.py
│   │   │   └── otp.py
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── otp_service.py  # Rate-limited OTP send/verify
│   │   │   └── qr_service.py   # QR code image generation
│   │   └── main.py           # FastAPI app + lifespan
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   └── [locale]/     # ar / en locale routing
│   │   │       ├── page.tsx              # Homepage
│   │   │       ├── listings/
│   │   │       │   ├── page.tsx          # Browse + filters
│   │   │       │   └── [short_id]/       # Listing detail
│   │   │       ├── login/page.tsx        # Phone OTP login
│   │   │       └── dashboard/
│   │   │           ├── page.tsx          # Agent dashboard
│   │   │           └── listings/new/     # Create listing
│   │   ├── components/
│   │   │   ├── layout/       # Header, Footer
│   │   │   ├── listings/     # ListingCard, SearchBar
│   │   │   ├── home/         # HeroSection, FeaturedListings
│   │   │   └── ui/           # Button, Badge, Input
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios instance (auto token refresh)
│   │   │   ├── store.ts      # Zustand auth + UI state
│   │   │   └── utils.ts      # formatPrice, formatDate, cn
│   │   ├── types/index.ts    # TypeScript interfaces
│   │   ├── i18n/
│   │   │   ├── routing.ts    # next-intl locale config
│   │   │   └── request.ts    # Server-side message loader
│   │   └── middleware.ts     # next-intl locale routing
│   ├── messages/
│   │   ├── ar.json           # Arabic translations
│   │   └── en.json           # English translations
│   └── public/manifest.json  # PWA manifest
├── docker-compose.yml        # postgres, redis, meilisearch
└── .env                      # Environment variables (see below)
```

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 20+

### 1. Clone and configure

```bash
git clone <repo-url>
cd Capital-House
cp .env.example .env
# Edit .env with your credentials
```

### 2. Start infrastructure

```bash
docker compose up -d
# Services: PostgreSQL (:5433), Redis (:6379), Meilisearch (:7700)
```

### 3. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Tables are auto-created on first run
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Backend runs at **http://localhost:8001**  
API docs at **http://localhost:8001/docs**

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev -- --port 3001
```

Frontend runs at **http://localhost:3001**  
Default locale: **Arabic RTL** (`/ar/...`)

---

## Environment Variables

Create a `.env` file in the project root:

```env
# App
APP_ENV=development
SECRET_KEY=your-secret-key-min-32-chars

# Database
DATABASE_URL=postgresql+asyncpg://capitalhouse:capitalhouse_dev@localhost:5433/capitalhouse
POSTGRES_USER=capitalhouse
POSTGRES_PASSWORD=capitalhouse_dev
POSTGRES_DB=capitalhouse

# Redis
REDIS_URL=redis://:redis_dev@localhost:6379/0
REDIS_PASSWORD=redis_dev

# Meilisearch
MEILI_URL=http://localhost:7700
MEILI_MASTER_KEY=your_meili_key

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# Frontend URL (used in QR code redirect links)
FRONTEND_URL=http://localhost:3001

# CORS
ALLOWED_ORIGINS=http://localhost:3001

# Twilio SMS (OTP) — leave empty for dev mode (OTP printed to logs)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Cloudflare R2 (media uploads)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=capital-house-media
R2_PUBLIC_URL=

# MyFatoorah (payments)
MYFATOORAH_API_KEY=
MYFATOORAH_BASE_URL=https://apitest.myfatoorah.com

# Resend (email)
RESEND_API_KEY=
```

> **Dev mode OTP:** When `TWILIO_ACCOUNT_SID` is empty, the OTP code is printed directly to the backend log: `[DEV OTP] +9627xxxxxxxx -> 123456`

---

## API Overview

```
Authentication
  POST  /api/v1/auth/otp/send        Send OTP to phone number
  POST  /api/v1/auth/otp/verify      Verify OTP → returns JWT tokens + user
  POST  /api/v1/auth/refresh         Refresh access token
  GET   /api/v1/auth/me              Get current user profile

Listings
  GET   /api/v1/listings             Browse listings (filters: type, governorate, price, bedrooms…)
  POST  /api/v1/listings             Create listing (agent role required)
  GET   /api/v1/listings/{short_id}  Get listing detail (increments view count)
  PATCH /api/v1/listings/{short_id}  Update listing
  DELETE /api/v1/listings/{short_id} Delete listing

Leads
  POST  /api/v1/leads                Submit buyer inquiry (public)
  GET   /api/v1/leads/my             Agent's lead inbox
  PATCH /api/v1/leads/{id}           Update lead status/notes

QR Codes
  POST  /api/v1/qr/listings/{short_id}   Generate QR code for listing
  GET   /api/v1/qr/{short_code}/image    Download QR PNG
  GET   /api/v1/qr/{short_code}/scan     Track scan + redirect to listing

System
  GET   /health
```

---

## User Roles

| Role | Permissions |
|---|---|
| `buyer` | Browse listings, submit leads |
| `agent` | All buyer permissions + create/edit/delete own listings, generate QR codes, view lead inbox |
| `agency_admin` | All agent permissions + manage agency listings |
| `platform_admin` | Approve listings, moderate content |
| `superadmin` | Full access |

> New users are assigned `buyer` role by default. Promote to `agent` via the admin panel or directly in the database.

---

## Listing Status Flow

```
DRAFT → PENDING_REVIEW → ACTIVE → SOLD / RENTED / OFF_MARKET
                       ↘ REJECTED
```

Listings created via the API start as `pending_review` and require admin approval before appearing in public search results.

---

## Property Types

- `apartment` — شقة
- `villa` — فيلا  
- `home` — منزل
- `land` — أرض
- `farm` — مزرعة (agricultural farms with dedicated filters)
- `commercial` — تجاري

---

## Supported Governorates

All 12 Jordanian governorates: Amman, Zarqa, Irbid, Aqaba, Madaba, Karak, Tafilah, Maan, Jerash, Ajloun, Mafraq, Balqa.

---

## Roadmap

### Phase 1 — MVP (current)
- [x] Property listings CRUD
- [x] Search and filters
- [x] Phone OTP authentication
- [x] Agent dashboard
- [x] QR code generation
- [x] Lead management
- [x] Arabic RTL + bilingual UI
- [x] PWA manifest
- [ ] Image upload (Cloudflare R2)
- [ ] Map view (Leaflet)
- [ ] Meilisearch full-text search
- [ ] Admin listing approval panel

### Phase 2 — Revenue & Trust
- [ ] Featured listings (paid)
- [ ] Agent Pro subscription (25 JOD/mo)
- [ ] Agency plan (80 JOD/mo)
- [ ] Property verification with trust badge
- [ ] PDF brochure generation
- [ ] Property comparison tool

### Phase 3 — Growth
- [ ] Saved searches + email alerts
- [ ] Advanced agent analytics
- [ ] Rental listings calendar
- [ ] Reviews and ratings
- [ ] Mortgage calculator
- [ ] Full map search

---

## Development Notes

- The backend uses **async SQLAlchemy 2.0** — always use `selectinload()` for relationships to avoid `MissingGreenlet` errors in async context.
- **OTP rate limit**: 5 requests per phone number per hour (enforced via Redis).
- **Short IDs**: Listings use 12-character `shortuuid` IDs for clean URLs (e.g., `/listings/cQBsBGM7eGXV`).
- The `middleware.ts` file handles locale routing via next-intl. URLs are always prefixed: `/ar/...` or `/en/...`.
- Tailwind CSS v4 is used — the RTL `rtl:` variant is built-in, controlled by `dir="rtl"` on the `<html>` element.

---

## License

Private — All rights reserved © 2025 Capital House
