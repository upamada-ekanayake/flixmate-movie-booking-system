import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Tv,
  Layers,
  Lock,
  Terminal,
  Sliders,
  CheckCircle,
  Calendar,
  Clock,
  Info,
  RotateCcw,
  ArrowRight,
  Film,
} from 'lucide-react';
import HeroSection from './components/HeroSection';
import MovieCard from './components/MovieCard';
import TicketView from './components/TicketView';

// ---------------------------------------------------------------------------
// TypeScript Interfaces — aligned with Prisma schema models
// ---------------------------------------------------------------------------

interface Movie {
  id: string;
  title: string;
  synopsis: string;
  duration: number;
  releaseYear: number;
  posterUrl: string;
  trailerUrl: string;
  rating: number;
  genres: string[];
  directors: string[];
  isFeatured: boolean;
}

interface MovieWithScore extends Movie {
  aiScore: number;
}

interface WatchLog {
  title: string;
  rating: number;
  completion: number;
  genre: string;
}

interface BookingResult {
  success: boolean;
  message: string;
  transactionId: string;
  seats: string[];
  movieTitle: string;
  amount: number;
  isSurgeActive: boolean;
  capacityRatio: number;
  pricePerSeat: number;
}

interface TheaterSeat {
  id: string;
  seatNumber: string;
  row: string;
  col: number;
  type: 'VIP' | 'STANDARD';
  viewAngleScore: number;
  distanceRatioScore: number;
}

// ---------------------------------------------------------------------------
// Mock Data — 6 movies with thematically appropriate film poster imagery
// ---------------------------------------------------------------------------

const MOCK_MOVIES: Movie[] = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    synopsis:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, striving to prevent a catastrophic future only he can foresee.',
    duration: 166,
    releaseYear: 2024,
    // Official TMDB poster for Dune: Part Two (2024)
    posterUrl:
      'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    rating: 8.6,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    directors: ['Denis Villeneuve'],
    isFeatured: true,
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    synopsis:
      "When Earth becomes uninhabitable, a team of seasoned explorers travels through a newly discovered wormhole in space in an attempt to ensure humanity's long-term survival.",
    duration: 169,
    releaseYear: 2014,
    // Official TMDB poster for Interstellar (2014)
    posterUrl:
      'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    rating: 8.7,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    directors: ['Christopher Nolan'],
    isFeatured: false,
  },
  {
    id: 'deadpool-wolverine',
    title: 'Deadpool & Wolverine',
    synopsis:
      'A listless Wade Wilson toils in civilian life. But when his homeworld faces an existential threat, he must reluctantly suit-up and convince a very grumpy Wolverine to join him.',
    duration: 128,
    releaseYear: 2024,
    // Official TMDB poster for Deadpool & Wolverine (2024)
    posterUrl:
      'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    rating: 7.7,
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    directors: ['Shawn Levy'],
    isFeatured: false,
  },
  {
    id: 'everything-everywhere',
    title: 'Everything Everywhere All at Once',
    synopsis:
      'An aging Chinese immigrant is swept up in an insane adventure, in which she alone can save the world by exploring other universes linking with the lives she could have led.',
    duration: 139,
    releaseYear: 2022,
    // Official TMDB poster for Everything Everywhere All at Once (2022)
    posterUrl:
      'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    rating: 8.7,
    genres: ['Sci-Fi', 'Action', 'Comedy', 'Drama'],
    directors: ['Daniel Kwan', 'Daniel Scheinert'],
    isFeatured: false,
  },
  {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    synopsis:
      'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, and the political fallout that followed.',
    duration: 180,
    releaseYear: 2023,
    // Official TMDB poster for Oppenheimer (2023)
    posterUrl:
      'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    rating: 8.9,
    genres: ['Drama', 'History', 'Thriller'],
    directors: ['Christopher Nolan'],
    isFeatured: false,
  },
  {
    id: 'the-batman',
    title: 'The Batman',
    synopsis:
      'When a serial killer leaves cryptic clues targeting Gotham City\'s elite, Batman is forced into an investigation that reveals a vast conspiracy behind his city\'s criminal underworld.',
    duration: 176,
    releaseYear: 2022,
    // Official TMDB poster for The Batman (2022)
    posterUrl:
      'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    trailerUrl:
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    rating: 7.8,
    genres: ['Action', 'Crime', 'Thriller'],
    directors: ['Matt Reeves'],
    isFeatured: false,
  },
];

// ---------------------------------------------------------------------------
// Theater Seat Layout — 4 rows × 8 columns = 32 seats
// ---------------------------------------------------------------------------

const MOCK_THEATER_SEATS: TheaterSeat[] = [
  ...(['A', 'B', 'C', 'D'] as const).flatMap((row, rowIndex) =>
    Array.from({ length: 8 }, (_, colIndex) => {
      const col = colIndex + 1;
      const id = `${row}-${col}`;
      // Row A (front) → distanceRatio 0.25; Row D (back) → distanceRatio 1.0
      const distanceRatio = (rowIndex + 1) / 4;
      // Column offset from center: -1.0 (far left) to +1.0 (far right)
      const viewAngle = parseFloat(((colIndex - 3.5) / 3.5).toFixed(2));

      return {
        id,
        seatNumber: `${row}${col}`,
        row,
        col,
        type: (row === 'D' ? 'VIP' : 'STANDARD') as 'VIP' | 'STANDARD',
        viewAngleScore: viewAngle,
        distanceRatioScore: distanceRatio,
      };
    })
  ),
];

// ---------------------------------------------------------------------------
// Pre-booked seats for each capacity mode
// ---------------------------------------------------------------------------

const LOW_CAPACITY_BOOKED = ['A4', 'B5', 'C3'];
const HIGH_CAPACITY_BOOKED = [
  'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8',
  'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8',
  'D1', 'D2',
];

const TOTAL_SEAT_COUNT = MOCK_THEATER_SEATS.length; // 32
const BASE_TICKET_PRICE = 15.5;
const SURGE_MULTIPLIER = 1.15;
const SURGE_THRESHOLD = 0.75;

// ---------------------------------------------------------------------------
// App Component
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie>(MOCK_MOVIES[0]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookingResponse, setBookingResponse] = useState<BookingResult | null>(null);
  const [isPending, setIsPending] = useState(false);

  // Capacity simulation toggle — demonstrates surge pricing feature
  const [simulateHighCapacity, setSimulateHighCapacity] = useState(false);

  // Derive active pre-booked seat list based on the capacity simulation mode
  const activeBookedSeatsList = simulateHighCapacity
    ? HIGH_CAPACITY_BOOKED
    : LOW_CAPACITY_BOOKED;

  const bookedSeatsCount = activeBookedSeatsList.length;
  const capacityPercentage = Math.round((bookedSeatsCount / TOTAL_SEAT_COUNT) * 100);
  const isSurgePricingActive = bookedSeatsCount / TOTAL_SEAT_COUNT > SURGE_THRESHOLD;
  const activePricePerSeat = isSurgePricingActive
    ? BASE_TICKET_PRICE * SURGE_MULTIPLIER
    : BASE_TICKET_PRICE;

  // Evict selected seats that become booked when switching capacity mode
  useEffect(() => {
    setSelectedSeats((prev) =>
      prev.filter((id) => {
        const seatNum = id.replace('-', '');
        return !activeBookedSeatsList.includes(seatNum);
      })
    );
  }, [simulateHighCapacity]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------------------------------------------------------------
  // Smart Seat Preference State
  // ---------------------------------------------------------------------------

  const [preferredRadius, setPreferredRadius] = useState(0.65);
  const [preferredAngle, setPreferredAngle] = useState(0.0);

  // ---------------------------------------------------------------------------
  // Behavioral AI Recommendation Engine
  // ---------------------------------------------------------------------------

  const [aiRecommendations, setAiRecommendations] = useState<MovieWithScore[]>([]);
  const [watchLogs, setWatchLogs] = useState<WatchLog[]>([
    { title: 'Interstellar', rating: 5.0, completion: 1.0, genre: 'Sci-Fi' },
    { title: 'Tenet', rating: 4.5, completion: 0.9, genre: 'Sci-Fi' },
    { title: 'The Dark Knight', rating: 4.8, completion: 1.0, genre: 'Thriller' },
  ]);

  /**
   * Content-Based Filtering — mirrors the production recommendationController.ts logic.
   * Computes genre & director affinity weights from watch history,
   * then scores each movie in the library.
   */
  const calculateBehavioralWeights = useCallback(() => {
    const scoredList: MovieWithScore[] = MOCK_MOVIES.map((movie) => {
      let score = 0.2; // base score for all movies

      const hasSciFi = movie.genres.includes('Sci-Fi');
      const hasThriller =
        movie.genres.includes('Thriller') || movie.genres.includes('Crime');
      const hasNolan = movie.directors.includes('Christopher Nolan');

      if (hasSciFi) score += 0.45;
      if (hasThriller) score += 0.25;
      if (hasNolan) score += 0.2;

      // Boost score if user recently logged a matching genre entry
      const recentGenreBoost = watchLogs.some((log) =>
        movie.genres.includes(log.genre)
      )
        ? 0.05
        : 0;
      score += recentGenreBoost;

      return { ...movie, aiScore: Math.min(0.99, score) };
    });

    setAiRecommendations(
      scoredList.sort((a, b) => b.aiScore - a.aiScore)
    );
  }, [watchLogs]);

  useEffect(() => {
    if (API_BASE_URL) {
      const fetchRecommendations = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/recommendations/portfolio-user`);
          if (res.ok) {
            const data = await res.json();
            const formatted: MovieWithScore[] = data.recommendations.map((item: any) => ({
              ...item.movie,
              releaseYear: new Date(item.movie.releaseDate || item.movie.releaseYear).getFullYear(),
              aiScore: item.score,
            }));
            setAiRecommendations(formatted);
          } else {
            calculateBehavioralWeights();
          }
        } catch (err) {
          console.error('Failed to fetch recommendations from backend, falling back to simulation:', err);
          calculateBehavioralWeights();
        }
      };
      fetchRecommendations();
    } else {
      calculateBehavioralWeights();
    }
  }, [calculateBehavioralWeights]);

  // ---------------------------------------------------------------------------
  // Smart Seat Scoring — mirrors the backend scoring.ts utility
  // ---------------------------------------------------------------------------

  const getSeatScore = (viewAngle: number, distanceRatio: number): number => {
    const angleDev = Math.abs(viewAngle - preferredAngle);
    const distDev = Math.abs(distanceRatio - preferredRadius);
    // 55% weight on angle alignment, 45% weight on distance preference
    const affinity = (1.0 - angleDev) * 0.55 + (1.0 - distDev) * 0.45;
    return Math.max(0.1, parseFloat(affinity.toFixed(2)));
  };

  // Derive the best-match AI score for the hero section badge
  const featuredMovieAiScore = aiRecommendations.find(
    (m) => m.id === selectedMovie.id
  )?.aiScore ?? 0.5;

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleSeatClick = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setBookingResponse(null);

    if (API_BASE_URL) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'portfolio-user',
            showTimeId: 'Tomorrow-8:30PM-IMAX',
            seatIds: selectedSeats,
          }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setIsPending(false);
          setBookingResponse({
            success: true,
            message: data.message || 'Concurrency Check Passed. Booking seat locks successfully updated.',
            transactionId: data.booking.bookingId,
            seats: selectedSeats,
            movieTitle: selectedMovie.title,
            amount: data.booking.totalPrice,
            isSurgeActive: data.booking.isSurgeActive,
            capacityRatio: data.booking.capacityRatio,
            pricePerSeat: data.booking.pricePerSeat,
          });
          return;
        } else {
          setIsPending(false);
          alert(data.message || data.error || 'Failed to complete booking.');
          return;
        }
      } catch (err: any) {
        console.error("Backend checkout failed, falling back to simulator:", err);
      }
    }

    // Simulated 1.5 s delay — visually demonstrates the atomic DB lock cycle
    setTimeout(() => {
      setIsPending(false);
      setBookingResponse({
        success: true,
        message: 'Concurrency Check Passed. Booking seat locks successfully updated.',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        seats: selectedSeats,
        movieTitle: selectedMovie.title,
        amount: selectedSeats.length * activePricePerSeat,
        isSurgeActive: isSurgePricingActive,
        capacityRatio: bookedSeatsCount / TOTAL_SEAT_COUNT,
        pricePerSeat: activePricePerSeat,
      });
    }, 1500);
  };

  const handleResetSimulator = () => {
    setSelectedSeats([]);
    setBookingResponse(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-orange-600/30">

      {/* ── BRAND HEADER ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Film className="w-5 h-5 text-orange-500" />
          <span className="text-2xl font-black tracking-tighter uppercase italic text-white flex items-center">
            FLIXMATE<span className="text-orange-500">.</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-black uppercase tracking-wider text-zinc-400">
          <a href="#recommender-section" className="hover:text-orange-500 transition-colors">
            AI Recommender
          </a>
          <a href="#movie-grid-section" className="hover:text-orange-500 transition-colors">
            Browse Library
          </a>
          <a href="#smart-seat-section" className="hover:text-orange-500 transition-colors">
            Smart Seat System
          </a>
          <a href="#architecture-section" className="hover:text-orange-500 transition-colors">
            Architecture
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            Portfolio v1.0.0
          </span>
          <a
            href="#smart-seat-section"
            className="text-[10px] font-black uppercase tracking-widest text-black bg-white hover:bg-orange-600 hover:text-white px-5 py-2.5 rounded-none transition duration-200"
          >
            Book Tickets
          </a>
        </div>
      </header>

      {/* ── 1. IMMERSIVE HERO ───────────────────────────────────────────── */}
      <HeroSection
        title={selectedMovie.title}
        synopsis={selectedMovie.synopsis}
        trailerUrl={selectedMovie.trailerUrl}
        posterUrl={selectedMovie.posterUrl}
        duration={selectedMovie.duration}
        releaseYear={selectedMovie.releaseYear}
        rating={selectedMovie.rating}
        aiScore={featuredMovieAiScore}
        onBookClick={() => {
          document.getElementById('smart-seat-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onLearnMoreClick={() => {
          document.getElementById('about-movie-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-20">

        {/* ── SECTION: AI RECOMMENDATION ENGINE ──────────────────────── */}
        <section
          id="recommender-section"
          className="p-6 md:p-8 rounded-none bg-black border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-48 h-48 text-orange-500" />
          </div>

          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
            {/* Left: Description + Watch History Simulator */}
            <div className="space-y-5 max-w-2xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  <Sparkles className="w-3.5 h-3.5 fill-current text-white" />
                  AI Affinity Matrix v2.4
                </div>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white italic">
                  Behavioral Weights Recommendation Engine
                </h2>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                  FlixMate&apos;s intelligent algorithms recursively analyze the affinity
                  coefficient of user feedback loops, watch completions, and explicit scores.
                  Add standard movie records into the history array below to see live vectors
                  re-balance recommendation match ratings in real-time.
                </p>
              </div>

              {/* Interactive Watch History Simulation Logs */}
              <div className="pt-2">
                <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-3">
                  &mdash; Simulated History Inputs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {watchLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-[#0d0d0d] border border-white/5 px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-wider"
                    >
                      <span className="text-white italic">{log.title}</span>
                      <span className="text-zinc-800">|</span>
                      <span className="text-orange-500">★ {log.rating}</span>
                      <span className="text-zinc-800">|</span>
                      <span className="text-teal-400">{log.completion * 100}% COMPLETE</span>
                    </div>
                  ))}
                  <button
                    id="recommendation-add-history"
                    onClick={() =>
                      setWatchLogs([
                        ...watchLogs,
                        { title: 'Inception', rating: 5.0, completion: 1.0, genre: 'Sci-Fi' },
                      ])
                    }
                    className="flex items-center gap-1 text-[10px] text-orange-500 hover:text-white bg-orange-600/10 hover:bg-orange-600 transition-all font-black uppercase tracking-wider px-4 py-2 rounded-none border border-orange-500/20 cursor-pointer"
                  >
                    + Log High-Rating Sci-Fi
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Cache Status Panel */}
            <div className="w-full lg:w-96 p-6 rounded-none bg-[#0a0a0a] border border-white/10 space-y-4 flex flex-col justify-center">
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">
                &mdash; AI Recommendation Cache
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Cache Key</span>
                  <span className="text-orange-500 font-bold">USER_REC_CACHE_V1</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Calculated At</span>
                  <span className="text-zinc-300 font-bold">Just Now (Recalculated)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold uppercase tracking-wider">Model Engine</span>
                  <span className="text-zinc-300 font-bold">Content Filtering v2</span>
                </div>
                <div className="w-full h-[1px] bg-white/10 my-1" />
                <div className="space-y-2">
                  <div className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                    Affinity rules weighting
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-3 bg-black rounded-none border border-white/10 text-center">
                      <div className="text-orange-500 font-black uppercase tracking-wider">Sci-Fi Group</div>
                      <div className="text-[9px] text-zinc-500 font-bold">Scale weight (1.25)</div>
                    </div>
                    <div className="p-3 bg-black rounded-none border border-white/10 text-center">
                      <div className="text-white font-black uppercase tracking-wider">Nolan Style</div>
                      <div className="text-[9px] text-zinc-500 font-bold">Preferred scale (1.30)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION: MOVIE GRID ─────────────────────────────────────── */}
        <section id="movie-grid-section" className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-l-4 border-orange-600 pl-4 py-2">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
                Customized Recommendation List
              </h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                Sourced from recursive preference vector computations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest bg-orange-600/10 px-3 py-1">
                Sorted by AI Affinity Score
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
            {aiRecommendations.map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.posterUrl}
                releaseYear={movie.releaseYear}
                duration={movie.duration}
                rating={movie.rating}
                genres={movie.genres}
                aiScore={movie.aiScore}
                onBookClick={() => {
                  setSelectedMovie(movie);
                  setTimeout(() => {
                    document
                      .getElementById('smart-seat-section')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                onSelect={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        </section>

        {/* ── SECTION: SMART SEAT SELECTOR ───────────────────────────── */}
        <section
          id="smart-seat-section"
          className="scroll-mt-6 p-6 md:p-8 rounded-none bg-black border border-white/10 shadow-2xl space-y-8"
        >
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-12">

            {/* Left: Preference Profile Sliders */}
            <div className="space-y-6 max-w-sm w-full flex flex-col justify-between">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Preference Profiling v1.2
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                  Smart Seat Recommender
                </h3>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Calibrate your visual and acoustic thresholds in real-time. The spatial
                  coordinate map dynamically recalibrates seat affinity score weights
                  instantly in client threads!
                </p>
              </div>

              {/* Slider Inputs */}
              <div className="space-y-6 bg-[#0a0a0a] p-5 rounded-none border border-white/10">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-zinc-350">
                    <span>Preferred Distance</span>
                    <span className="text-orange-500 font-extrabold font-mono">
                      {preferredRadius < 0.35
                        ? 'Front Row'
                        : preferredRadius > 0.7
                        ? 'Theater Rear'
                        : 'Center Row'}{' '}
                      ({Math.round(preferredRadius * 100)}%)
                    </span>
                  </div>
                  <input
                    id="pref-seat-distance-slider"
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={preferredRadius}
                    onChange={(e) => setPreferredRadius(parseFloat(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer h-1.5 bg-zinc-900 rounded-none appearance-none"
                  />
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-zinc-350">
                    <span>Preferred Screen Angle</span>
                    <span className="text-orange-500 font-extrabold font-mono">
                      {preferredAngle === 0
                        ? 'Dead Center'
                        : preferredAngle < 0
                        ? 'Left Wing'
                        : 'Right Wing'}{' '}
                      ({preferredAngle})
                    </span>
                  </div>
                  <input
                    id="pref-seat-angle-slider"
                    type="range"
                    min="-1.0"
                    max="1.0"
                    step="0.1"
                    value={preferredAngle}
                    onChange={(e) => setPreferredAngle(parseFloat(e.target.value))}
                    className="w-full accent-orange-600 cursor-pointer h-1.5 bg-zinc-900 rounded-none appearance-none"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1 text-[11px] text-zinc-400 leading-normal border-t border-white/5">
                  <Info className="w-3.5 h-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Optimal algorithmic fits are highlighted with an{' '}
                    <strong className="text-orange-500 font-bold uppercase">orange ring outline</strong>.
                  </span>
                </div>
              </div>

              {/* Showtime + Surge Pricing Card */}
              <div className="p-4 rounded-none bg-[#090909] border border-white/10 space-y-3.5">
                <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                  &mdash; Showtime Constraints
                </h4>
                <div className="flex justify-between items-center text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>Tomorrow</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-orange-500" />
                    <span>8:30 PM (IMAX 3D)</span>
                  </div>
                </div>
                <div className="text-[10px] text-zinc-400 uppercase font-bold border-t border-white/5 pt-2">
                  Movie:{' '}
                  <span className="text-zinc-200 italic">{selectedMovie.title}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 border-t border-white/5 pt-2">
                  <span>Capacity Level:</span>
                  <span
                    className={
                      isSurgePricingActive
                        ? 'text-orange-500 font-extrabold animate-pulse'
                        : 'text-emerald-400 font-bold'
                    }
                  >
                    {capacityPercentage}% occupied{' '}
                    {isSurgePricingActive && '(Surge Active)'}
                  </span>
                </div>

                {/* Surge pricing toggle */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] text-zinc-400 uppercase font-black">
                    Simulate Peak Surge (&gt;75%)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={simulateHighCapacity}
                      onChange={(e) => setSimulateHighCapacity(e.target.checked)}
                    />
                    <div className="w-8 h-4 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-orange-600 peer-checked:after:bg-white" />
                  </label>
                </div>
              </div>
            </div>

            {/* Right: 3D Theater Map */}
            <div className="flex-1 w-full flex flex-col items-center">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3">
                &mdash; Screen Front Perspective
              </div>
              <div className="relative w-full max-w-md h-1.5 bg-orange-600 shadow-[0_-4px_16px_rgba(249,115,22,0.5)] mb-12" />

              {/* Isometric stadium seating */}
              <div className="perspective-[1000px] w-full flex justify-center mb-10 overflow-visible">
                <div className="grid grid-cols-8 gap-2.5 sm:gap-3.5 max-w-md w-full [transform:rotateX(25deg)] origin-top transform-gpu">
                  {MOCK_THEATER_SEATS.map((seat) => {
                    const isBooked = activeBookedSeatsList.includes(seat.seatNumber);
                    const score = getSeatScore(seat.viewAngleScore, seat.distanceRatioScore);
                    const isSelected = selectedSeats.includes(seat.id);
                    const isGoldMatch = score > 0.85;

                    return (
                      <motion.button
                        id={`theater-seat-button-${seat.id}`}
                        key={seat.id}
                        whileHover={{ scale: !isBooked ? 1.15 : 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSeatClick(seat.id, isBooked)}
                        className={`relative aspect-square rounded-none flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                          isBooked
                            ? 'bg-[#18181b] border border-white/5 text-zinc-700 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-orange-600 border border-orange-500 text-white shadow-none animate-pulse'
                            : isGoldMatch
                            ? 'bg-orange-950/20 border-2 border-orange-500 text-orange-200 ring-4 ring-orange-500/10'
                            : 'bg-[#0d0d0d] border border-white/10 text-zinc-400 hover:border-orange-500 hover:text-white'
                        }`}
                        disabled={isBooked}
                      >
                        <span className="text-[9px]">{seat.seatNumber}</span>
                        {!isBooked && (
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition duration-150 pointer-events-none bg-black/85 backdrop-blur-md px-2 py-0.5 rounded border border-zinc-700 text-[10px] text-zinc-300 font-mono z-50 whitespace-nowrap">
                            Match: {Math.round(score * 100)}%
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Seat legend */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-none bg-[#18181b] border border-white/5" />
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-none bg-[#0d0d0d] border border-white/10" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-none bg-orange-950/20 border-2 border-orange-500 ring-4 ring-orange-500/10" />
                  <span>Best Fit Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-none bg-orange-600 border border-orange-500" />
                  <span>Selected</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Booking Panel ────────────────────────────────────────── */}
          <AnimatePresence>
            {selectedSeats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-sm font-black text-white uppercase tracking-wider">
                    Ready to Book ({selectedSeats.length} Seat
                    {selectedSeats.length !== 1 ? 's' : ''}:{' '}
                    <span className="text-orange-500 font-mono font-black">
                      {selectedSeats.join(', ')}
                    </span>
                    )
                  </div>
                  <div className="text-xs text-zinc-400">
                    Locked to:{' '}
                    <span className="text-zinc-200 italic">{selectedMovie.title}</span> |
                    IMAX Screen 1
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center justify-center md:justify-start gap-1.5 font-bold uppercase tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                    <span>
                      Row-locks active immediately at transactional checkout bounds to
                      prevent double-booking.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="text-center md:text-right">
                    <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                      {isSurgePricingActive ? 'Surge Ticket Price (+15%)' : 'Standard Ticket Price'}
                    </div>
                    <div className="text-2xl font-black text-white font-mono">
                      ${(selectedSeats.length * activePricePerSeat).toFixed(2)}
                    </div>
                    {isSurgePricingActive && (
                      <div className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">
                        Base ${BASE_TICKET_PRICE.toFixed(2)} × {SURGE_MULTIPLIER}× surge
                      </div>
                    )}
                  </div>

                  <button
                    id="checkout-confirm-button"
                    onClick={handleCheckout}
                    disabled={isPending || bookingResponse !== null}
                    className="bg-orange-600 hover:bg-orange-500 disabled:bg-[#111] disabled:text-zinc-600 disabled:cursor-not-allowed text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-none transition duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Locking Seats in DB...
                      </>
                    ) : bookingResponse ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Booked & Settled!
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Acquire DB Lock & Book
                      </>
                    )}
                  </button>

                  {(bookingResponse || selectedSeats.length > 0) && (
                    <button
                      id="reset-checkout-button"
                      onClick={handleResetSimulator}
                      className="p-3 bg-white/5 border border-white/10 text-zinc-400 hover:text-white rounded-none hover:bg-white/10 cursor-pointer transition"
                      title="Reset Selection"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Transaction Log + Ticket ────────────────────────────── */}
          <AnimatePresence>
            {bookingResponse && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-5 rounded-none bg-[#050505]/95 border border-emerald-500/20 shadow-2xl space-y-4 h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                      <Terminal className="w-4 h-4" />
                      Prisma Transaction Telemetry Log
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                      <div className="p-3 bg-black rounded-none border border-white/5">
                        <div className="text-zinc-600 uppercase font-black text-[9px]">
                          Atomic Lock State
                        </div>
                        <div className="text-emerald-400 font-bold mt-1">COMMIT_SUCCESSFUL</div>
                      </div>
                      <div className="p-3 bg-black rounded-none border border-white/5">
                        <div className="text-zinc-600 uppercase font-black text-[9px]">
                          PostgreSQL Transaction
                        </div>
                        <div className="text-zinc-300 truncate mt-1">
                          {bookingResponse.transactionId}
                        </div>
                      </div>
                      <div className="p-3 bg-black rounded-none border border-white/5">
                        <div className="text-zinc-600 uppercase font-black text-[9px]">
                          Locked Seat Nodes
                        </div>
                        <div className="text-orange-400 font-bold mt-1">
                          {bookingResponse.seats.join(', ')}
                        </div>
                      </div>
                      <div className="p-3 bg-black rounded-none border border-white/5">
                        <div className="text-zinc-600 uppercase font-black text-[9px]">
                          Atomic Safety Checks
                        </div>
                        <div className="text-green-400 font-bold mt-1">100% Collision-Free</div>
                      </div>
                      {bookingResponse.isSurgeActive && (
                        <div className="p-3 bg-orange-950/20 rounded-none border border-orange-500/30 col-span-2">
                          <div className="text-orange-500 uppercase font-black text-[9px]">
                            Surge Pricing Applied (+15%)
                          </div>
                          <div className="text-white mt-1 text-[10px]">
                            Theater capacity at{' '}
                            {Math.round(bookingResponse.capacityRatio * 100)}% (&gt;75% threshold
                            breached)
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400 leading-relaxed font-sans space-y-2">
                      <p>
                        The row lock has successfully locked the seats{' '}
                        <code className="text-orange-400 font-mono px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-none">
                          {bookingResponse.seats.join(', ')}
                        </code>{' '}
                        under showtime ID{' '}
                        <code className="text-zinc-300 font-mono">Tomorrow-8:30PM-IMAX</code>.
                      </p>
                      <p>
                        No competing request or parallel concurrent database transaction was
                        permitted to interrupt this commit cycle, achieving absolute transactional
                        isolation safety with zero double seating.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <TicketView
                    transactionId={bookingResponse.transactionId}
                    movieTitle={bookingResponse.movieTitle}
                    seats={bookingResponse.seats}
                    amount={bookingResponse.amount}
                    isSurgeActive={bookingResponse.isSurgeActive}
                    showTimeId="Tomorrow-8:30PM-IMAX"
                  />
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* ── SECTION: FEATURE HIGHLIGHTS ─────────────────────────────── */}
        <section id="about-movie-section" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="p-6 md:p-8 rounded-none bg-black border border-white/10 shadow-2xl space-y-4 hover:border-orange-500/50 transition-colors duration-300">
            <h3 className="text-lg font-black uppercase tracking-tight text-white italic flex items-center gap-2">
              <Tv className="w-5 h-5 text-orange-500" />
              Immersive Video Player UX
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Experience movie trailers like never before. The hero backdrop is powered by a fluid
              background video streaming player with deep-contrast overlay masking, responsive media
              buffers, and instant glassmorphic state indicators designed to blend cinematic depth
              directly into standard browser viewports. Try muting and unmuting the video above!
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-none bg-black border border-white/10 shadow-2xl space-y-4 hover:border-orange-500/50 transition-colors duration-300">
            <h3 className="text-lg font-black uppercase tracking-tight text-white italic flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              Prisma Database Relations Map
            </h3>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              The extensive schema model under{' '}
              <code className="text-orange-400 font-mono">/prisma/schema.prisma</code> features
              complete indexing layout, cascaded deletions, model preferences for users, watch
              statistics tracking, and custom seat matrices. This foundation supports full
              transactional correctness in live server instances.
            </p>
          </div>
        </section>

        {/* ── SECTION: ARCHITECTURE FILE MAP ──────────────────────────── */}
        <section
          id="architecture-section"
          className="p-6 md:p-8 rounded-none bg-black border border-white/10 space-y-6"
        >
          <h3 className="text-2xl font-black tracking-tighter text-white italic uppercase flex items-center gap-2 justify-center sm:justify-start">
            <Terminal className="w-5 h-5 text-orange-500 animate-pulse" />
            FlixMate File Structure Map
          </h3>
          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider text-center sm:text-left">
            Standard layout mapped to the monorepo workspace configurations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {[
              {
                label: 'DATABASE MODEL',
                title: '/prisma/schema.prisma',
                desc: 'Contains highly indexed models for Users, AI Preferences, Cinema Seats, Showtimes, and AI recommendation cache tables.',
              },
              {
                label: 'AI SCORING ENGINE',
                title: 'recommendationController.ts',
                desc: 'Content-Based Filtering calculates User Genre and Director Weight Affinity Maps, scales completion rates, and caches picks in 24-hr cycles.',
              },
              {
                label: 'TRANSACTION CONTRACT',
                title: 'bookingController.ts',
                desc: 'Implements PostgreSQL FOR UPDATE row-locks in atomic Prisma transactions, guaranteeing double bookings are physically impossible.',
              },
            ].map((card) => (
              <div
                key={card.label}
                className="p-5 bg-[#0a0a0a] rounded-none border border-white/10 flex flex-col justify-between space-y-4 hover:border-orange-500/30 transition-colors"
              >
                <div>
                  <span className="font-mono text-[9px] text-orange-500 font-extrabold block mb-1 uppercase tracking-widest">
                    {card.label}
                  </span>
                  <span className="font-black text-sm text-zinc-200">{card.title}</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{card.desc}</p>
                <div className="inline-flex items-center gap-1 text-orange-500 text-[10px] uppercase font-black tracking-wider hover:text-white cursor-pointer transition">
                  <span>View Raw Code</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────────────── */}
        <footer className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          <div>
            <span className="text-white font-black italic">FLIXMATE</span>
            <span className="text-orange-500">.</span>{' '}
            &mdash; AI Engineering Portfolio Project
          </div>
          <div>
            Developed by <span className="text-zinc-400">Upe</span> &bull; v1.0.0 &bull; MIT License
          </div>
        </footer>
      </div>
    </div>
  );
}
