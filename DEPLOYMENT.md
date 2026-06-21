# 🚀 FlixMate — Deployment Guide

This document provides step-by-step instructions to host the FlixMate application. 
*   **Backend & Database**: Hosted on **Render** (Node.js + PostgreSQL)
*   **Frontend**: Hosted on **Vercel** (Vite + React SPA)

---

## 📦 Prerequisites

1.  A **GitHub** repository containing your project code.
2.  A free account on **[Render](https://render.com/)**.
3.  A free account on **[Vercel](https://vercel.com/)**.

---

## 🗄️ Step 1: Deploy the Database & Backend on Render

You can deploy the backend and the PostgreSQL database together using Render's Blueprint feature (recommended) or set them up manually.

### Option A: Blueprint Deployment (Recommended)

1.  Log in to your **Render Dashboard**.
2.  Click **New** (top right) and select **Blueprint**.
3.  Connect your GitHub repository.
4.  Render will automatically detect the `render.yaml` file in the root.
5.  Provide a Service Group Name (e.g., `flixmate`).
6.  You will be prompted to configure variables:
    *   `APP_URL`: Set this temporarily to `https://localhost:3000`. You will update this with your actual Vercel URL once the frontend is deployed.
    *   `GEMINI_API_KEY` (Optional): Set this if you use Gemini features.
7.  Click **Apply**. Render will provision:
    *   A **PostgreSQL Database** (`flixmate-db`).
    *   A **Web Service** (`flixmate-backend`) which runs migrations, seeds default data, builds the TypeScript code, and starts the Express gateway.

### Option B: Manual Deployment

If you prefer manual setup:

#### 1. Create a PostgreSQL Database
1.  On the Render dashboard, click **New** -> **PostgreSQL**.
2.  Name it `flixmate-db`, select the **Free** tier, and click **Create Database**.
3.  Once active, copy the **External Connection String**.

#### 2. Create the Backend Web Service
1.  Click **New** -> **Web Service**.
2.  Connect your GitHub repository.
3.  Configure the service details:
    *   **Name**: `flixmate-backend`
    *   **Environment**: `Node`
    *   **Region**: Select the closest region to your users.
    *   **Branch**: `main`
    *   **Build Command**: `npm install && npx prisma generate && npm run build:backend`
    *   **Start Command**: `npx prisma db push --accept-data-loss && npx prisma db seed && npm run start:backend`
4.  Add the following **Environment Variables**:
    *   `DATABASE_URL`: *Paste the connection string copied from your Render PostgreSQL database.*
    *   `PORT`: `10000` (Render's default)
    *   `NODE_ENV`: `production`
    *   `APP_URL`: *Your Vercel URL (e.g., `https://flixmate.vercel.app` — update this after Vercel deployment).*
5.  Click **Create Web Service**.

---

## 💻 Step 2: Deploy the Frontend on Vercel

1.  Log in to the **Vercel Dashboard**.
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  Vercel will auto-detect **Vite** as the framework.
5.  Configure the build settings:
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
6.  Under **Environment Variables**, add:
    *   `VITE_API_URL`: *Set this to the URL of your Render backend web service (e.g., `https://flixmate-backend.onrender.com`). Do not include a trailing slash.*
7.  Click **Deploy**. Vercel will build the frontend and host it.
8.  **Copy the generated Vercel URL** (e.g., `https://flixmate-six.vercel.app`).

---

## 🔗 Step 3: Complete the Connection (CORS Setup)

For security, the Express backend restricts API requests to the domain specified in `APP_URL`. Now that your frontend is live:

1.  Go back to your **Render Web Service** dashboard (`flixmate-backend`).
2.  Click **Environment** in the left sidebar.
3.  Update the `APP_URL` variable to your **Vercel URL** (e.g., `https://flixmate-six.vercel.app`).
4.  Save changes. Render will automatically redeploy the service with the updated environment.

---

## 🔍 Step 4: Verification

### 1. Check Backend Health
Open a browser and navigate to `https://your-backend-url.onrender.com/api/health`. You should receive a JSON response:
```json
{
  "status": "ok",
  "service": "FlixMate API Gateway",
  "version": "1.0.0",
  "timestamp": "2026-06-21T09:41:00.000Z"
}
```

### 2. Verify Database Seeding
Check the logs of the Render web service build/start process. You should see outputs like:
*   `🌱 Starting database seeding...`
*   `🧹 Cleaning existing tables...`
*   `👤 Creating default portfolio user...`
*   `🪑 Seeding theater seats...`
*   `✨ Seeding complete! Database is ready.`

### 3. Verify Live App Integration
1.  Go to your Vercel deployment URL.
2.  Open your browser DevTools (F12) -> Console.
3.  Look at recommendations or attempt a seat booking. 
4.  If the backend URL is correctly configured, the console will show queries going to your Render URL, and bookings will be locked directly in the cloud database!
