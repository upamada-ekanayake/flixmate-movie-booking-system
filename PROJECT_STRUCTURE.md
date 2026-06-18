# FlixMate — Project Structure

A complete annotated map of every directory and file in the repository.

```
flixmate/
│
├── index.html                         # Vite HTML entry point (root SPA shell)
├── package.json                       # Root dependencies, scripts, and metadata
├── tsconfig.json                      # Root TypeScript configuration
├── vite.config.ts                     # Vite build tool configuration
├── .env.example                       # Environment variable template (safe to commit)
├── .gitignore                         # Git ignore rules
├── LICENSE                            # MIT License
├── README.md                          # Project overview and setup guide
├── CONTRIBUTING.md                    # Contributor guidelines
├── PROJECT_STRUCTURE.md               # This file
│
├── prisma/
│   └── schema.prisma                  # Full PostgreSQL database schema (Prisma ORM)
│                                      # Models: User, Movie, Genre, Director, ShowTime,
│                                      #         Seat, Booking, BookingSeat,
│                                      #         WatchHistory, AIRecommendationCache,
│                                      #         UserAIPreference
│
├── src/                               # Active frontend source (Vite + React SPA)
│   ├── main.tsx                       # React DOM entry point
│   ├── index.css                      # Global styles: Tailwind v4 + Google Fonts
│   ├── App.tsx                        # Root application component
│   │                                  # Contains: movie data, recommendation engine,
│   │                                  #           seat scoring, booking state,
│   │                                  #           surge pricing logic
│   └── components/
│       ├── HeroSection.tsx            # Full-viewport cinematic video hero
│       │                              # Features: autoplay loop, mute toggle,
│       │                              #           dynamic AI match score badge,
│       │                              #           animated content card
│       ├── MovieCard.tsx              # Movie grid card with AI affinity score badge
│       │                              # Features: hover animations, Book button,
│       │                              #           genre tags, rating overlay
│       └── TicketView.tsx             # Post-booking digital ticket
│                                      # Features: QR code (Base64 payload),
│                                      #           conditional surge label,
│                                      #           perforated ticket design
│
├── backend/
│   └── src/
│       ├── server.ts                  # Express.js API Gateway entry point
│       │                              # Health check: GET /api/health
│       ├── routes/
│       │   ├── bookingRoutes.ts       # POST /api/bookings
│       │   └── recommendationRoutes.ts # GET /api/recommendations/:userId
│       └── controllers/
│           ├── bookingController.ts   # Atomic seat booking with Prisma transactions
│           │                          # Uses: SELECT ... FOR UPDATE (row-level locks)
│           │                          # Implements: surge pricing, double-booking prevention
│           └── recommendationController.ts # Content-based filtering AI engine
│                                      # Features: genre/director affinity maps,
│                                      #           24-hour recommendation cache,
│                                      #           weighted scoring algorithm
│
└── frontend/                          # Legacy Next.js-style reference code
    └── src/                           # (Not connected to the Vite build)
        ├── app/page.tsx               # Earlier iteration of the main page
        └── components/                # Earlier component versions
```

---

## Key File Relationships

```
index.html
  └── src/main.tsx
        └── src/App.tsx
              ├── src/components/HeroSection.tsx
              ├── src/components/MovieCard.tsx
              └── src/components/TicketView.tsx

backend/src/server.ts
  ├── backend/src/routes/bookingRoutes.ts
  │     └── backend/src/controllers/bookingController.ts
  │           └── prisma/schema.prisma (Booking, BookingSeat, Seat models)
  └── backend/src/routes/recommendationRoutes.ts
        └── backend/src/controllers/recommendationController.ts
              └── prisma/schema.prisma (WatchHistory, AIRecommendationCache models)
```

---

## Database Model Summary

| Model | Purpose |
|-------|---------|
| `User` | Account management with RBAC (USER / ADMIN) |
| `UserAIPreference` | Stores seat angle/distance preferences |
| `Movie` | Film metadata, posters, trailers, ratings |
| `Genre` | Many-to-many genre tags for movies |
| `Director` | Many-to-many director records for movies |
| `ShowTime` | Scheduled screenings linked to movies |
| `Seat` | Physical seat layout with spatial coordinates |
| `Booking` | Parent booking record per transaction |
| `BookingSeat` | Bridge table enforcing unique seat-per-showtime |
| `WatchHistory` | Tracks completion rates and ratings for AI |
| `AIRecommendationCache` | Caches computed recommendations (24h TTL) |

---

*FlixMate — AI Engineering Portfolio Project by Upe*
