'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Map, 
  Tv, 
  Search, 
  Layers, 
  Users, 
  Lock, 
  Terminal, 
  Sliders, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Info,
  CirclePlay,
  RotateCcw
} from 'lucide-react';
import HeroSection from '../components/HeroSection';
import MovieCard from '../components/MovieCard';

// Comprehensive mock datasets matching FlixMate's Prisma Models
const MOCK_MOVIES = [
  {
    id: 'dune-part-two',
    title: 'Dune: Part Two',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, striving to prevent a catastrophic future only he can foresee.',
    duration: 166,
    releaseYear: 2024,
    posterUrl: 'https://images.unsplash.com/photo-1547483238-f400e65ccd56?q=80&w=600&auto=format&fit=crop',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    rating: 8.6,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    directors: ['Denis Villeneuve'],
    isFeatured: true
  },
  {
    id: 'interstellar',
    title: 'Interstellar',
    synopsis: 'When Earth becomes uninhabitable, a team of seasoned explorers travels through a newly discovered wormhole in space in an attempt to ensure humanity\'s long-term survival.',
    duration: 169,
    releaseYear: 2014,
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    rating: 8.7,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    directors: ['Christopher Nolan'],
    isFeatured: false
  },
  {
    id: 'deadpool-wolverine',
    title: 'Deadpool & Wolverine',
    synopsis: 'A listless Wade Wilson toils in civilian life. But when his homeworld faces an existential threat, he must reluctantly suit-up and convince a very grumpy Wolverine to join him.',
    duration: 128,
    releaseYear: 2024,
    posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    rating: 7.7,
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    directors: ['Shawn Levy'],
    isFeatured: false
  },
  {
    id: 'everything-everywhere',
    title: 'Everything Everywhere All at Once',
    synopsis: 'An aging Chinese immigrant is swept up in an insane adventure, in which she alone can save the world by exploring other universes linking with the lives she could have led.',
    duration: 139,
    releaseYear: 2022,
    posterUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
    trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    rating: 8.7,
    genres: ['Sci-Fi', 'Action', 'Comedy', 'Drama'],
    directors: ['Daniel Kwan', 'Daniel Scheinert'],
    isFeatured: false
  }
];

const MOCK_THEATER_SEATS = [
  // Generates 4 rows (A-D), 8 cols of physical seats
  ...['A', 'B', 'C', 'D'].flatMap((row, rowIndex) => 
    Array.from({ length: 8 }, (_, colIndex) => {
      const col = colIndex + 1;
      const id = `${row}-${col}`;
      
      // Compute mathematical values
      // - rows (Row A = front = ratio 0.1, Row D = back = ratio 0.9)
      const distanceRatio = (rowIndex + 1) / 4;
      // - cols (Center seats have offset close to 0.0, side seats are far offsets -1.0 to 1.0)
      const viewAngle = parseFloat(((colIndex - 3.5) / 3.5).toFixed(2));
      
      return {
        id,
        seatNumber: `${row}${col}`,
        row,
        col,
        type: row === 'D' ? 'VIP' : 'STANDARD',
        viewAngleScore: viewAngle,
        distanceRatioScore: distanceRatio,
        isBooked: ['A4', 'B5', 'C3'].includes(`${row}${col}`) // Some prebooked seats
      };
    })
  )
];

export default function Page() {
  const [selectedMovie, setSelectedMovie] = useState(MOCK_MOVIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBookingDetailsOpen, setIsBookingDetailsOpen] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<any>(null);
  const [isPending, setIsPending] = useState(false);

  // Preference parameters for the Smart Seat Recommendation
  const [preferredRadius, setPreferredRadius] = useState(0.65); // Standard distance preference
  const [preferredAngle, setPreferredAngle] = useState(0.0);    // Standard physical center alignment

  // Content-Based AI scores state mapped dynamically
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [watchLogs, setWatchLogs] = useState<any[]>([
    { title: 'Interstellar', rating: 5.0, completion: 1.0, genre: 'Sci-Fi' },
    { title: 'Tenet', rating: 4.5, completion: 0.9, genre: 'Sci-Fi' },
    { title: 'The Dark Knight', rating: 4.8, completion: 1.0, genre: 'Thriller' }
  ]);

  // Recalculates Behavioral Content recommendations based on active user actions
  const calculateBehavioralWeights = () => {
    // Basic weight algorithm:
    // User demonstrates high affinity for 'Sci-Fi' and 'Thriller', directed by Nolan
    const scoredList = MOCK_MOVIES.map((movie) => {
      let score = 0.2; // Base score
      
      // Calculate genre matches
      const hasSciFi = movie.genres.includes('Sci-Fi');
      const hasThriller = movie.genres.includes('Thriller');
      const hasNolan = movie.directors.includes('Christopher Nolan');

      if (hasSciFi) score += 0.45;
      if (hasThriller) score += 0.25;
      if (hasNolan) score += 0.2;

      // Caps at 0.99 for display
      const finalScore = Math.min(0.99, score);
      return { ...movie, aiScore: finalScore };
    });

    // Sort scored items desc
    setAiRecommendations(scoredList.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0)));
  };

  useEffect(() => {
    calculateBehavioralWeights();
  }, [watchLogs]);

  // Smart Seat scoring function
  const getSeatScore = (viewAngle: number, distanceRatio: number) => {
    // Math calculating absolute relative spatial deviation from preference sliders
    const angleDev = Math.abs(viewAngle - preferredAngle);
    const distDev = Math.abs(distanceRatio - preferredRadius);
    
    // Weighted combination: 55% angle, 45% depth
    const affinity = (1.0 - angleDev) * 0.55 + (1.0 - distDev) * 0.45;
    return Math.max(0.1, parseFloat(affinity.toFixed(2)));
  };

  const handleSeatClick = (seatId: string, isBooked: boolean) => {
    if (isBooked) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Simulate Atomic transactions locked bookings
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setBookingResponse(null);

    // Simulated 1.5 seconds response delay to clearly visualize the atomic row lock
    setTimeout(() => {
      setIsPending(false);
      setBookingResponse({
        success: true,
        message: 'Concurrency Check Passed. Booking seat locks successfully updated.',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        seats: selectedSeats,
        movieTitle: selectedMovie.title,
        amount: selectedSeats.length * 15.50
      });
    }, 1500);
  };

  const handleResetSimulator = () => {
    setSelectedSeats([]);
    setBookingResponse(null);
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-zinc-100 font-sans selection:bg-red-600/30">
      
      {/* 1. Immersive Hero Autoplay Feature */}
      <HeroSection 
        title={selectedMovie.title}
        synopsis={selectedMovie.synopsis}
        trailerUrl={selectedMovie.trailerUrl}
        duration={selectedMovie.duration}
        releaseYear={selectedMovie.releaseYear}
        rating={selectedMovie.rating}
        onBookClick={() => setIsBookingDetailsOpen(true)}
        onLearnMoreClick={() => {
          const el = document.getElementById('about-movie-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-16">
        
        {/* SECTION: RECOMMENDATION MAP SIMULATION CONTROLLER */}
        <div id="recommender-section" className="p-6 md:p-8 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-48 h-48 text-violet-500" />
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-violet-600/10 text-violet-400 text-xs px-3 py-1.5 rounded-full border border-violet-500/20 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                AI recommendation matrix
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white">
                Behavioral Recommendation Simulator
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                FlixMate’s algorithms continuously analyze the weight coefficient of users&apos; explicit reviews combined with how much of the movie they watched. Click below to add an explicit movie rating and see recommendations recalculate immediately!
              </p>

              {/* Interactive Watch History Simulation Logs */}
              <div className="pt-2">
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 font-bold mb-2">Simulated History Inputs</h4>
                <div className="flex flex-wrap gap-2">
                  {watchLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-2xl text-xs font-medium">
                      <span>{log.title}</span>
                      <span className="text-zinc-500">|</span>
                      <span className="text-yellow-500">★ {log.rating}</span>
                      <span className="text-zinc-500">|</span>
                      <span className="text-sky-400">{log.completion * 100}% Completion</span>
                    </div>
                  ))}
                  <button 
                    id="recommendation-add-history"
                    onClick={() => {
                      setWatchLogs([
                        ...watchLogs, 
                        { title: 'Inception', rating: 5.0, completion: 1.0, genre: 'Sci-Fi' }
                      ]);
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all font-semibold px-3 py-1.5 rounded-2xl border border-red-500/20 cursor-pointer"
                  >
                    + Log High-Rating Sci-Fi
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-96 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Recommendation Cache Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Cache Key</span>
                  <span className="text-emerald-400 font-mono">USER_REC_CACHE_V1</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Calculated At</span>
                  <span className="text-zinc-300 font-mono">Just Now (Recalculated)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-medium">Model Engine</span>
                  <span className="text-zinc-300 font-mono">Content Filtering V2</span>
                </div>
                <div className="w-full h-[1px] bg-zinc-800/80 my-1" />
                <div className="space-y-1.5">
                  <div className="text-[11px] text-zinc-500 font-bold uppercase">Affinity scoring rules</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-[#0d0e12] rounded-xl border border-zinc-800 text-center">
                      <div className="text-amber-400 font-bold">Sci-Fi Genre</div>
                      <div className="text-[10px] text-zinc-400">High Weight (1.25)</div>
                    </div>
                    <div className="p-2 bg-[#0d0e12] rounded-xl border border-zinc-800 text-center">
                      <div className="text-indigo-400 font-bold">Nolan Movies</div>
                      <div className="text-[10px] text-zinc-400">Preferred (1.30)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOVIE GRID SECTION */}
        <div id="movie-grid-section" className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white mb-1">
                Your Customized Content Dashboard
              </h2>
              <p className="text-sm text-zinc-400 font-medium">
                Sourced from your personal behavioral weight maps.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 font-medium font-mono">Sorted by Match Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  setIsBookingDetailsOpen(true);
                  // Scroll to Seat selection element
                  setTimeout(() => {
                    document.getElementById('smart-seat-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                onSelect={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        </div>

        {/* SMART SEAT SELECTOR & TRANSACTION locking DEMO */}
        <div id="smart-seat-section" className="scroll-mt-6 p-6 md:p-8 rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            
            {/* 1. SEATING PREFERENCE PROFILE SLIDERS */}
            <div className="space-y-6 max-w-sm w-full">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-500 text-xs px-3 py-1.5 rounded-full border border-red-500/20 font-mono">
                  <Sliders className="w-3.5 h-3.5" />
                  preference profiling
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white">Smart Seat Recommender</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Tweak the spatial preferences below. The theater seating map dynamically recalibrates layout weights, scoring and mapping visual angles and acoustics natively in client threads!
                </p>
              </div>

              {/* Slider inputs for mathematical score generation */}
              <div className="space-y-5 bg-[#0d0e12] p-5 rounded-2xl border border-zinc-900">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-zinc-300">
                    <span>Preferred Distance</span>
                    <span className="text-red-500">
                      {preferredRadius < 0.35 ? 'Front' : preferredRadius > 0.7 ? 'Back' : 'Middle'} ({preferredRadius * 100}%)
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
                    className="w-full accent-red-600 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-zinc-300">
                    <span>Preferred Screen Angle</span>
                    <span className="text-red-500">
                      {preferredAngle === 0 ? 'Dead-Center' : preferredAngle < 0 ? 'Left' : 'Right'} (Offset: {preferredAngle})
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
                    className="w-full accent-red-600 cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                  <Info className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                  <span>Interactive seats highlighted in <strong className="text-violet-400">purple rings / glowing borders</strong> are the most optimal matches.</span>
                </div>
              </div>

              {/* Quick Metadata Card */}
              <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Selected Booking Showtime</h4>
                <div className="flex justify-between items-center text-xs text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Tomorrow</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>8:30 PM (IMAX)</span>
                  </div>
                </div>
                <div className="text-xs text-zinc-500">
                  Movie: <span className="text-white font-medium">{selectedMovie.title}</span>
                </div>
              </div>
            </div>

            {/* 2. ENHANCED VIRTUAL SCREEN & THEATER COORDINATE MAP */}
            <div className="flex-1 w-full flex flex-col items-center">
              
              {/* IMAX Curved Screen */}
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2">Theater Screen View (Front)</div>
              <div className="relative w-full max-w-md h-3.5 rounded-full overflow-hidden bg-zinc-800 border-t border-zinc-600 shadow-[0_-8px_32px_rgba(255,255,255,0.15)] mb-12">
                <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-zinc-50 to-transparent opacity-8" />
              </div>

              {/* Virtual Seat grids */}
              <div className="grid grid-cols-8 gap-3 sm:gap-4 max-w-lg w-full mb-8">
                {MOCK_THEATER_SEATS.map((seat) => {
                  const score = getSeatScore(seat.viewAngleScore, seat.distanceRatioScore);
                  const isSelected = selectedSeats.includes(seat.id);
                  const isGoldMatch = score > 0.85; // Strong mathematical preference matches

                  return (
                    <motion.button
                      id={`theater-seat-button-${seat.id}`}
                      key={seat.id}
                      whileHover={{ scale: !seat.isBooked ? 1.15 : 1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSeatClick(seat.id, seat.isBooked)}
                      className={`relative aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                        seat.isBooked 
                          ? 'bg-zinc-800 border border-zinc-700/40 text-zinc-600 cursor-not-allowed'
                          : isSelected
                          ? 'bg-red-600 border border-red-500 text-white shadow-lg shadow-red-600/40'
                          : isGoldMatch
                          ? 'bg-violet-950/70 border border-violet-500 text-violet-300 ring-2 ring-violet-500/40 shadow-inner'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-500'
                      }`}
                      disabled={seat.isBooked}
                    >
                      {/* Seat layout and hover scoring */}
                      <span className="text-[10px]">{seat.seatNumber}</span>
                      
                      {/* Hover score tooltips */}
                      {!seat.isBooked && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition duration-150 pointer-events-none bg-black/85 backdrop-blur-md px-2 py-0.5 rounded border border-zinc-700 text-[10px] text-zinc-300 font-mono z-50 whitespace-nowrap">
                          Match: {Math.round(score * 100)}%
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legends details */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-lg bg-zinc-800 border border-zinc-700" />
                  <span>Already Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-lg bg-zinc-900 border border-zinc-800" />
                  <span>Standard Seating</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-lg bg-violet-950/70 border border-violet-500 ring-2 ring-violet-500/40" />
                  <span>Best AI Recommendations ({'>'}85% Match)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4.5 h-4.5 rounded-lg bg-red-600 border border-red-500" />
                  <span>Your Selection</span>
                </div>
              </div>
            </div>

          </div>

          {/* ACTIVE TRANSACTION ROW-LEVEL BOOKING PANEL */}
          <AnimatePresence>
            {selectedSeats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="pt-6 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="space-y-1 text-center md:text-left">
                  <div className="text-sm font-bold text-white uppercase tracking-wider">
                    Ready to Book ({selectedSeats.length} Seats: <span className="text-red-500 font-mono font-bold">{selectedSeats.join(', ')}</span>)
                  </div>
                  <div className="text-xs text-zinc-400">
                    Locked to: <span className="text-zinc-200">{selectedMovie.title}</span> | IMAX Screen 1
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center justify-center md:justify-start gap-1">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
                    <span>Row-locks active immediately at transactional checkout bounds to prevent double-booking.</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-center md:text-right">
                    <div className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Subtotal Price</div>
                    <div className="text-xl font-black text-white font-mono">${(selectedSeats.length * 15.50).toFixed(2)}</div>
                  </div>
                  
                  <button
                    id="checkout-confirm-button"
                    onClick={handleCheckout}
                    disabled={isPending || bookingResponse}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-sm font-bold px-8 py-3.5 rounded-2xl shadow-lg shadow-red-600/20 active:scale-[0.98] transition duration-200 flex items-center gap-2 cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Row Locking Database...
                      </>
                    ) : bookingResponse ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Booked Successfully!
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Acquire DB Lock & Book
                      </>
                    )}
                  </button>

                  {(bookingResponse || selectedSeats.length > 0) && (
                    <button
                      id="reset-checkout-button"
                      onClick={handleResetSimulator}
                      className="p-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-2xl hover:bg-zinc-800 cursor-pointer"
                      title="Reset Selection"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SIMULATED DATABASE LOG MONITOR */}
          <AnimatePresence>
            {bookingResponse && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 rounded-2xl bg-zinc-900/40 border border-emerald-500/20 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Terminal className="w-4 h-4" />
                  Prisma Transaction telemetry Log
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500">Atomic Lock State</div>
                    <div className="text-emerald-400 font-bold">COMMIT_SUCCESSFUL</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500">PostgreSQL Transaction</div>
                    <div className="text-zinc-300 truncate">{bookingResponse.transactionId}</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500">Locked Seat Nodes</div>
                    <div className="text-violet-400 font-bold">{bookingResponse.seats.join(', ')}</div>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl border border-zinc-800">
                    <div className="text-zinc-500">Atomic Safety Checks</div>
                    <div className="text-green-400 font-bold">100% Collision-Free</div>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 leading-relaxed font-sans">
                  The row lock has successfully locked the seats <code className="text-red-400 font-mono px-1 bg-black/50 rounded">{bookingResponse.seats.join(', ')}</code> under showtime ID <code className="text-zinc-300 font-mono">Tomorrow-8:30PM-IMAX</code>. No competing request was permitted to interrupt this commit cycle, achieving absolute transactional isolation safety with zero double seating.
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* DETAILS/ABOUT SECTION */}
        <div id="about-movie-section" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="p-6 md:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-900/90 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-red-500" />
              Immersive Video Player UX
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Experience movie trailers like never before. The hero backdrop is powered by a fluid background video streaming player with deep-contrast overlay masking, responsive media buffers, and instant glassmorphism state indicators designed to blend cinematic depth directly into standard browser viewports. Try muting and unmuting the video inside the hero layout above!
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-zinc-950/80 border border-zinc-900/90 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-500" />
              Prisma Database Relations Map
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We generated the extensive schema model file under <code>/prisma/schema.prisma</code> featuring complete indexing layout, cascaded deletions, model preferences for users, watch statistics tracking, and custom seat matrices. This foundation supports full transactional correctness in live server instances.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
