# 🎬 FlixMate — AI-Powered Movie Booking System

> An intelligent cinema ticket booking and recommendation platform built with modern full-stack technologies.
> Developed as a university portfolio project demonstrating AI engineering, backend transaction design, and production-quality frontend development.

![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748.svg)

---

## Overview

**FlixMate** is a full-stack cinema booking platform that combines behavioral AI recommendation algorithms with a robust transactional booking engine. The project was developed to demonstrate the practical integration of AI/ML concepts with production-grade database design patterns — making it ideal as a portfolio piece for AI Engineering students.

The live application is a React SPA (Single Page Application) that simulates the complete booking workflow:

1. Browse an AI-ranked movie library personalised to watch history
2. Click through to an interactive 3D theater map with smart seat suggestions
3. Select seats and confirm a booking — which demonstrates atomic transaction locking
4. Receive a digital ticket with a unique QR code

---

## Features

### 🧠 Behavioral AI Recommendation Engine
- **Content-Based Filtering** algorithm that scores movies against a user's genre and director affinity profile
- Weighted combination of **implicit signals** (watch completion rate) and **explicit signals** (user ratings)
- Results cached in `AIRecommendationCache` with a **24-hour TTL** to avoid expensive recalculations
- Real-time recalculation triggered by changes to the simulated watch history

### 🪑 Smart Seat Selector
- Mathematical spatial scoring model using **viewAngleScore** and **distanceRatioScore** per seat
- User-configurable preference sliders for distance-from-screen and viewing angle
- Scoring formula: `Score = (1 - |viewAngle - prefAngle|) × 0.55 + (1 - |distRatio - prefDist|) × 0.45`
- Top-matching seats highlighted with orange ring overlays in real-time

### 🔐 Double-Booking Prevention via Row-Level Transaction Locks
- Uses **Prisma `$transaction`** wrapping `SELECT ... FOR UPDATE` PostgreSQL row locks
- Enforces unique `[showTimeId, seatId]` constraint at the database level (BookingSeat model)
- Atomic rollback on any collision or concurrent write conflict
- Zero double-seating guarantee under high concurrency

### 💥 Dynamic Surge Pricing
- Capacity-based pricing: when theater occupancy exceeds **75%**, a **15% price surcharge** is applied
- Toggle-able simulation mode to demonstrate the pricing model visually
- Price breakdowns reflected in the booking panel and digital ticket

### 🎥 Immersive Video Hero
- Full-viewport autoplay video trailer background with glassmorphic content overlay
- Mute/unmute control with smooth transitions
- Film noir depth gradient overlays for cinematic effect
- Dynamic AI match score badge per selected movie

### 🎟️ Digital Ticket with QR Code
- Post-booking ticket rendered with cinema-style perforated design
- Unique QR code encoding booking metadata (seats, showtime, transaction ID, timestamp) as a Base64 payload
- Conditional surge pricing label

---

## Technologies Used

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI component framework |
| TypeScript | 5.8 | Type-safe JavaScript |
| Vite | 6.2 | Build tool and dev server |
| Tailwind CSS | 4.1 | Utility-first styling |
| Motion (Framer) | 12.x | Animations and transitions |
| Lucide React | 0.546 | Icon library |
| qrcode.react | 4.2 | QR code generation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.21 | HTTP API framework |
| TypeScript | 5.8 | Type-safe server code |
| tsx | 4.21 | TypeScript execution for Node |

### Database
| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 14+ | Primary relational database |
| Prisma ORM | 5.22 | Type-safe database access layer |

### AI / Algorithms
| Technique | Description |
|-----------|-------------|
| Content-Based Filtering | Genre & Director affinity weight map from WatchHistory |
| Spatial Scoring | Mathematical angle/distance seat preference model |
| Surge Pricing | Capacity-ratio threshold pricing algorithm |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                         │
│                                                                 │
│  ┌──────────────┐  ┌────────────────┐  ┌───────────────────┐   │
│  │  HeroSection  │  │   MovieCard    │  │   TicketView      │   │
│  │  (Video bg)   │  │   (AI Score)   │  │   (QR Ticket)     │   │
│  └──────────────┘  └────────────────┘  └───────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      App.tsx                             │   │
│  │  • Behavioral AI Engine (content-based filtering)        │   │
│  │  • Smart Seat Scorer (spatial coordinate math)           │   │
│  │  • Surge Pricing Calculator (capacity threshold)         │   │
│  │  • Booking State Manager (simulated DB transactions)      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP (REST)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Express API Gateway                           │
│               backend/src/server.ts :4000                       │
│                                                                 │
│  POST /api/bookings          GET /api/recommendations/:userId   │
│  bookingController.ts        recommendationController.ts        │
│         │                              │                        │
│         └──────────────┬───────────────┘                        │
│                        ▼                                        │
│                  Prisma ORM Client                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                         │
│                                                                 │
│  Users · Movies · Genres · Directors · ShowTimes · Seats        │
│  Bookings · BookingSeats · WatchHistory · AIRecommendationCache │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Design

### Entity Relationship Overview

```
User ──< Booking ──< BookingSeat >── Seat
  │                      │
  │                   ShowTime >── Movie ──< Genre
  │                                   ──< Director
  ├──< WatchHistory >── Movie
  ├──  UserAIPreference
  └──< AIRecommendationCache
```

### Models

| Model | Key Fields | Purpose |
|-------|-----------|---------|
| **User** | `id`, `email`, `passwordHash`, `role` | User accounts with RBAC (USER/ADMIN) |
| **UserAIPreference** | `preferredGenres[]`, `preferredViewAngle`, `preferredDistanceRatio` | AI and seat preference profile |
| **Movie** | `title`, `synopsis`, `posterUrl`, `trailerUrl`, `averageRating`, `isFeatured` | Film catalog |
| **Genre** | `name` | Many-to-many genre tags |
| **Director** | `name`, `bio` | Many-to-many director records |
| **ShowTime** | `startTime`, `endTime`, `theaterName`, `price` | Scheduled screenings |
| **Seat** | `seatNumber`, `row`, `col`, `type`, `viewAngleScore`, `distanceRatioScore` | Physical seat layout with spatial metadata |
| **Booking** | `userId`, `showTimeId`, `totalPrice`, `status` | Parent booking record |
| **BookingSeat** | `bookingId`, `showTimeId`, `seatId` — `@@unique([showTimeId, seatId])` | Bridge table — unique constraint prevents double booking |
| **WatchHistory** | `completionRate`, `explicitRating` | User viewing behavior for AI recommendations |
| **AIRecommendationCache** | `recommendations (Json)`, `expiresAt` | 24-hour cached recommendation results |

---

## Installation Guide

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher (for backend database features)
- **npm** v9 or higher

### 1. Clone the Repository

```bash
git clone https://github.com/upe/flixmate-movie-booking-system.git
cd flixmate-movie-booking-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flixmate?schema=public"
APP_URL="http://localhost:3000"
PORT=4000
```

### 4. Set Up the Database (Backend Features)

```bash
# Generate Prisma Client from schema
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 5. Run the Frontend (Vite Dev Server)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run the Backend API (Optional)

In a separate terminal:

```bash
npx tsx backend/src/server.ts
```

API will be available at [http://localhost:4000](http://localhost:4000).

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes (backend) | — | PostgreSQL connection string for Prisma |
| `GEMINI_API_KEY` | No | — | Google Gemini AI API key (future use) |
| `APP_URL` | No | `http://localhost:3000` | Frontend base URL (CORS config) |
| `PORT` | No | `4000` | Backend Express server port |
| `NODE_ENV` | No | `development` | Node environment |

---

## API Documentation

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "FlixMate API Gateway",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Create Booking

```
POST /api/bookings
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId":     "uuid-of-authenticated-user",
  "showTimeId": "uuid-of-target-showtime",
  "seatIds":    ["uuid-seat-1", "uuid-seat-2"]
}
```

**Response 201 (Success):**
```json
{
  "success": true,
  "message": "Booking completed successfully with row-level transaction safety.",
  "booking": {
    "bookingId":     "uuid",
    "totalPrice":    35.65,
    "seatCount":     2,
    "status":        "CONFIRMED",
    "isSurgeActive": true,
    "capacityRatio": 0.84,
    "pricePerSeat":  17.83,
    "originalPrice": 15.50
  }
}
```

**Response 409 (Conflict):**
```json
{
  "success": false,
  "error":   "Transactional Collision or Constraint Prevented Booking",
  "message": "Booking Collision detected. Seat IDs already booked."
}
```

---

### Get AI Movie Recommendations

```
GET /api/recommendations/:userId
```

**Response 200:**
```json
{
  "source":        "recalculated_engine",
  "calculatedAt":  "2024-01-01T00:00:00.000Z",
  "recommendations": [
    {
      "movie": {
        "id":            "uuid",
        "title":         "Interstellar",
        "averageRating": 8.7,
        "genres":        ["Sci-Fi", "Adventure"],
        "directors":     ["Christopher Nolan"]
      },
      "score": 0.9400
    }
  ]
}
```

---

## Screenshots

> The following screenshots demonstrate the key features of FlixMate.

| Feature | Preview |
|---------|---------|
| Hero Section | *Cinematic video hero with AI match badge and booking CTA* |
| Movie Grid | *6 AI-ranked movie cards with affinity scores* |
| Smart Seat Selector | *3D perspective theater map with preference sliders* |
| Digital Ticket | *Post-booking QR code ticket with transaction details* |

---

## Future Improvements

### Short-term
- [ ] **User Authentication** — JWT-based login/register with bcrypt password hashing
- [ ] **Real Database Integration** — Wire the frontend to the Express backend API
- [ ] **Movie Search** — Full-text search across title, genre, and director
- [ ] **Booking History** — User dashboard showing past and upcoming bookings

### Medium-term
- [ ] **Collaborative Filtering** — Upgrade from content-based to hybrid recommendation (CF + CB)
- [ ] **Payment Integration** — Stripe payment gateway for real transactions
- [ ] **Admin Dashboard** — CRUD interface for managing movies, showtimes, and seats
- [ ] **Email Confirmations** — Booking confirmation emails with ticket attachments

### Long-term
- [ ] **Real-time Seat Updates** — WebSocket-based live seat availability (no page refresh)
- [ ] **Mobile App** — React Native app sharing the same backend API
- [ ] **Generative AI Reviews** — Gemini-powered personalized movie synopses
- [ ] **Loyalty Points System** — Points earned per booking, redeemable for discounts

---

## Author

**Name:** Upe
**Role:** AI Engineering Student
**Program:** AI Engineering, University Portfolio Project

> This project was developed as part of an AI Engineering curriculum to demonstrate practical integration of machine learning concepts (content-based recommendation systems), backend engineering (transactional database design with PostgreSQL and Prisma), and modern frontend development (React 19, TypeScript, Tailwind CSS).

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

*⭐ If you found this project useful or educational, please consider giving it a star on GitHub!*
