# 🎬 FlixMate — AI-Powered Cinema Booking & Personalization Engine

> **Enterprise Production Repository**
> An advanced movie ticketing and personalization platform integrating behavioral AI recommendation algorithms, 3D seat scheduling math, atomic database isolation checkouts, capacity-based surge pricing, and client-encrypted digital ticket validation.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2d3748.svg?logo=prisma)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue.svg?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

---

## 🚀 Core Architecture

FlixMate is built as a modular micro-architectured monorepo enabling clean boundaries between UI layout rendering, relational mapping schemas, API routing, and AI affinity scoring.

```
flixmate/
├── prisma/
│   └── schema.prisma                 # Core schema containing Relational & AI-Cache Tables
├── src/                              # Frontend (React 19 + TypeScript + Vite)
│   ├── App.tsx                       # Root Component executing Client AI & State Engines
│   └── components/
│       ├── HeroSection.tsx           # Auto-playing Cinematic Trailer Hero
│       ├── MovieCard.tsx             # Performance-optimized Movie Card Component
│       └── TicketView.tsx            # perforated Digital Ticket with Encrypted QR
├── backend/
│   └── src/                          # Express.js HTTP/1.1 API Gateway
│       ├── server.ts                 # Gateway entrypoint & CORS Configurations
│       ├── routes/                   # Endpoint routers (bookings, recommendations)
│       └── controllers/
│           ├── bookingController.ts  # Database locking & seat reservation controllers
│           └── recommendationController.ts # Content-Based Filtering affinity builders
```

### Monorepo Layer Responsibilities

1. **Frontend (React 19 & Vite SPA)**: Focuses on highly-animated, responsive layouts using **Vite + Tailwind CSS v4** and **Motion** (Framer). Integrates real-time, zero-latency versions of the AI affinity model and seating preference formulas to provide immediate user feedback on slider modifications.
2. **Backend (Node.js Express + TypeScript)**: Standardized Express gateway translating Client requests into transactional database mutations. Protects resources with CORS and serves computed JSON responses.
3. **Database (Prisma ORM + PostgreSQL)**: Employs PostgreSQL as the single source of truth. The Prisma schema defines indexes and constraint keys directly in SQL to enforce referential integrity and transaction boundaries.

---

## 🧠 Deep Dive: AI & System Features

### 1. Content-Based Filtering Engine & Affinity Maps

The recommendation engine measures a user's affinity profile by evaluating historical watch patterns. It dynamically parses implicit and explicit feedback signals to generate a **Genre & Director Affinity Matrix**:

*   **Implicit Signals**: Captured through the `completionRate` (range $0.0 - 1.0$) of past watch logs. High completion indicates interest, even without active user rating.
*   **Explicit Signals**: Evaluated through the `explicitRating` ($1.0 - 5.0$ stars) indicating a deliberate, conscious statement of preference.

#### Mathematical Model
Let $W$ be the set of watched movies by user $u$. The affinity score for a genre or director $A$ is computed as:

$$Affinity(A) = \sum_{w \in W} \left( CompletionRate(w) \times 0.45 + \frac{Rating(w)}{5} \times 0.55 \right)$$

This computed map determines the match percentage displayed as an badge on each movie. On the backend, computed matrices are stored inside the `AIRecommendationCache` with a **24-Hour TTL** to eliminate query overhead:

```typescript
// backend/src/controllers/recommendationController.ts
const cachedRecommendations = await prisma.aIRecommendationCache.findFirst({
  where: {
    userId,
    expiresAt: { gt: new Date() }
  }
});
```

---

### 2. Smart Seating Spatial Scoring Model

The Smart Seat Selector matches user seating preferences against physical theater space. Seats are mapped on a coordinate grid containing:
- $\text{viewAngleScore}$: Horizontal offset from the screen center (normalized to $[-1.0, 1.0]$).
- $\text{distanceRatioScore}$: Vertical distance from the front row (normalized to $[0.0, 1.0]$).

Users position horizontal and vertical sliders to define their visual/acoustic preference matrix. The spatial algorithm evaluates every seat $S$ using a weighted distance formula:

$$\text{Affinity}(S) = (1 - |S_{\text{angle}} - \text{pref}_{\text{angle}}|) \times 0.55 + (1 - |S_{\text{dist}} - \text{pref}_{\text{dist}}|) \times 0.45$$

- **Angle Alignment (55%)**: Prioritized heavily to target audio-visual center staging.
- **Distance Alignment (45%)**: Calibrates screen size preferences (IMAX wide fields vs rear rows).

Matches scoring $> 85\%$ are instantly highlighted with interactive **orange ring outlines** directly in the isometric 3D theater viewport.

---

### 3. Concurrency Protection: Row-Level Transaction Locks

To prevent double-bookings during checkout, FlixMate implements a robust reservation controller using **PostgreSQL Row-Level Locking** within an atomic Prisma transaction. 

```
          Concurrent Client A                    Concurrent Client B
                  │                                      │
                  │ POST /api/bookings                   │ POST /api/bookings
                  ▼                                      ▼
      ┌───────────────────────┐              ┌───────────────────────┐
      │  Prisma $transaction  │              │  Prisma $transaction  │
      └───────────────────────┘              └───────────────────────┘
                  │                                      │
      ┌───────────────────────┐              ┌───────────────────────┐
      │  SELECT FOR UPDATE    │              │  SELECT FOR UPDATE    │
      │   (Acquires Row Lock) │              │  (Blocked - Waiting)  │
      └───────────────────────┘              └───────────────────────┘
                  │                                      │
       [Writes Booking Records]                          │
                  │                                      │
      ┌───────────────────────┐                          │
      │   Transaction Commit  │                          │
      │   (Releases Row Lock) │                          │
      └───────────────────────┘                          ▼
                  │                          ┌───────────────────────┐
         Response: Success!                  │  SELECT FOR UPDATE    │
                                             │  (Reads updated state)│
                                             └───────────────────────┘
                                                         │
                                             ┌───────────────────────┐
                                             │  Collision Detected!  │
                                             │  Transaction Rollback │
                                             └───────────────────────┘
                                                         │
                                                Response: 409 Conflict
```

The transactional block performs these sequential steps:
1. Locks the requested `Seat` rows using `SELECT FOR UPDATE` syntax to prevent other transactions from reading or mutating availability.
2. Inspects `BookingSeat` records to verify if the seat remains open.
3. If open, commits the booking, writes to `BookingSeat`, and returns a success response.
4. If already booked, triggers an **immediate rollback** and aborts, guaranteeing a zero double-booking rate.

```typescript
// backend/src/controllers/bookingController.ts
await prisma.$transaction(async (tx) => {
  // 1. Lock candidate seats programmatically
  await tx.$executeRaw`SELECT * FROM "Seat" WHERE id IN (${Prisma.join(seatIds)}) FOR UPDATE`;

  // 2. Query booking overlap
  const existingBookings = await tx.bookingSeat.findFirst({
    where: { showTimeId, seatId: { in: seatIds } }
  });

  if (existingBookings) {
    throw new Error("Transactional Collision: Seat already reserved.");
  }
  
  // 3. Commit seat booking records
  // ...
});
```

---

### 4. Capacity-Based Surge Pricing

The ticket pricing algorithm dynamically adjusts prices based on theater demand:
- **Base Ticket Cost**: \$15.50
- **Surge Pricing Threshold**: Activated when showtime occupancy exceeds **75%**.
- **Surge Rate**: A **15% surcharge** ($1.15\times$ base rate) is applied to all remaining seats.

The calculation is executed server-side prior to reservation locking:

```typescript
const bookedCount = await prisma.bookingSeat.count({ where: { showTimeId } });
const capacityRatio = bookedCount / TOTAL_THEATER_SEATS;
const isSurgeActive = capacityRatio > 0.75;
const finalPrice = isSurgeActive ? BASE_PRICE * 1.15 : BASE_PRICE;
```

---

## 🖼️ Application Screenshots

### 1. Cinematic Hero Section
The responsive hero section features an auto-playing cinematic background trailer, an IMDb rating badge, and a real-time AI match indicator:
![Hero Section Preview](docs/screenshots/hero.png)

### 2. Smart Seat Selector
An interactive, isometric 3D grid mapping viewing angles and screen distances with live match overlays:
![3D Seating Grid Preview](docs/screenshots/3d-seating.png)

### 3. Digitally Encrypted Ticket Pass
The post-booking ticket layout featuring a perforating card border, surge indicator, and a Base64-payload QR ticket pass:
![Ticket QR Code Preview](docs/screenshots/ticket-qr.png)

---

## 🔧 Setup & Launch Instructions

### Prerequisites
- **Node.js** v18.0.0 or higher
- **PostgreSQL** v14.0.0 or higher
- **npm** (v9+) or **pnpm** (v8+)

### 1. Clone & Install
```bash
git clone https://github.com/upe/flixmate-movie-booking-system.git
cd flixmate-movie-booking-system
npm install
```

### 2. Configure Local Environment
Create your `.env` configuration file in the project root:
```bash
cp .env.example .env
```

Ensure your database connection string and ports are defined correctly:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flixmate?schema=public"
PORT=4000
APP_URL="http://localhost:3000"
```

### 3. Initialize Database & Run Migrations
Run the initial Prisma migration to construct the database schema and compile the client library:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Execute Microservices Locally
Start the frontend development server and backend Express gateway in separate shells:

#### Run Frontend (Port 3000)
```bash
npm run dev
```

#### Run Backend API Gateway (Port 4000)
```bash
npx tsx backend/src/server.ts
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)** to launch the platform.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
