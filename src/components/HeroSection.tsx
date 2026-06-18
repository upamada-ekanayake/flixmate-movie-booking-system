import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Info, Calendar, Clock, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroSectionProps {
  title: string;
  synopsis: string;
  trailerUrl: string;
  duration: number;
  releaseYear: number;
  rating: number;
  /** Normalized AI affinity score (0.0 – 1.0) for the currently featured movie */
  aiScore?: number;
  onBookClick: () => void;
  onLearnMoreClick: () => void;
}

export default function HeroSection({
  title,
  synopsis,
  trailerUrl,
  duration,
  releaseYear,
  rating,
  aiScore,
  onBookClick,
  onLearnMoreClick,
}: HeroSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync muted state with the underlying video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Reset video-loaded state when the trailer URL changes (movie swap)
  useEffect(() => {
    setIsVideoLoaded(false);
  }, [trailerUrl]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  // Convert normalized score (0–1) to a human-readable percentage badge
  const matchPercentage = aiScore !== undefined ? Math.round(aiScore * 100) : null;

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden bg-black text-white">

      {/* ── Cinematic Background Video Loop ────────────────────────── */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          src={trailerUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onCanPlay={handleVideoLoad}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-80 scale-100' : 'opacity-0 scale-105'
          }`}
        />
        {/* Film noir depth gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/30 to-transparent" />
      </div>

      {/* ── Hero Content Card ───────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-end justify-start px-6 md:px-16 pb-12 md:pb-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-xl md:max-w-2xl p-6 md:p-8 rounded-none bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl"
        >
          {/* Badge row: AI match score + IMDb rating */}
          <div className="flex items-center gap-2 mb-4">
            {matchPercentage !== null && (
              <span className="flex items-center gap-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-tighter px-2.5 py-1">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {matchPercentage}% AI Match
              </span>
            )}
            <span className="bg-white/10 text-white/80 text-[10px] px-2.5 py-1 rounded-none uppercase font-black tracking-wider border border-white/5">
              IMDb {rating}
            </span>
          </div>

          {/* Movie title — single h1 per page for SEO */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter leading-none mb-4 text-white">
            {title}
          </h1>

          {/* Meta row: year + runtime */}
          <div className="flex items-center gap-4 text-[10px] text-zinc-300 font-bold uppercase tracking-widest mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              {releaseYear}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              {duration} Mins
            </span>
          </div>

          {/* Synopsis — clamped to 3 lines for visual balance */}
          <p className="text-zinc-300 text-xs md:text-sm leading-relaxed mb-6 line-clamp-3">
            {synopsis}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-book-now-button"
              onClick={onBookClick}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black uppercase tracking-wider px-6 py-3 rounded-none transition duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Book Now
            </button>
            <button
              id="hero-learn-more-button"
              onClick={onLearnMoreClick}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-wider px-6 py-3 rounded-none transition duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              Learn More
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Audio Toggle Control ────────────────────────────────────── */}
      <div className="absolute right-6 md:right-16 bottom-12 md:bottom-20 z-20">
        <motion.button
          id="hero-mute-toggle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center justify-center w-10 h-10 rounded-none bg-black/80 hover:bg-orange-600 backdrop-blur-md border border-white/20 text-white cursor-pointer transition shadow-2xl"
          title={isMuted ? 'Unmute Trailer' : 'Mute Trailer'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  );
}
