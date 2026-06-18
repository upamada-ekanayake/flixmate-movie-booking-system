'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Info, Calendar, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeroSectionProps {
  title: string;
  synopsis: string;
  trailerUrl: string; // Direct video streaming link or standard mp4
  duration: number;
  releaseYear: number;
  rating: number;
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
  onBookClick,
  onLearnMoreClick,
}: HeroSectionProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync mute state to physical element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleVideoLoad = () => {
    setIsVideoLoaded(true);
  };

  return (
    <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-black text-white">
      {/* 1. Cinematic Background Video Loop */}
      <div className="absolute inset-0 w-full h-full object-cover">
        <video
          ref={videoRef}
          src={trailerUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          onCanPlay={handleVideoLoad}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-70 scale-100' : 'opacity-0 scale-105'
          }`}
        />
        {/* Dark Film Noir ambient gradients layering */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0f12] via-[#0e0f12]/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e0f12]/90 via-[#0e0f12]/30 to-transparent" />
      </div>

      {/* 2. Glassmorphism Dynamic Content Card */}
      <div className="absolute inset-0 flex items-end justify-start px-6 md:px-16 pb-12 md:pb-24 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-xl p-6 md:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        >
          {/* Tag Line indicating Recommended status / High affinity score */}
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 text-xs px-2.5 py-1 rounded-full border border-amber-500/30 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              98% AI Match Score
            </span>
            <span className="bg-white/10 text-white/80 text-xs px-2 py-0.5 rounded font-mono">IMDb {rating}</span>
          </div>

          {/* Heading with exquisite spacing */}
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 text-white">
            {title}
          </h1>

          {/* Meta Tags rows */}
          <div className="flex items-center gap-4 text-xs text-zinc-300 font-medium mb-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              {releaseYear}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {duration} Mins
            </span>
          </div>

          {/* Film Synopsis */}
          <p className="text-zinc-200 text-sm md:text-base leading-relaxed mb-6 line-clamp-3">
            {synopsis}
          </p>

          {/* Glass Actions Layer */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="hero-book-now-button"
              onClick={onBookClick}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-semibold px-6 py-3 rounded-xl transition duration-300 hover:scale-[1.02] shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Book Now
            </button>
            <button
              id="hero-learn-more-button"
              onClick={onLearnMoreClick}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-sm font-semibold px-6 py-3 rounded-xl transition duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <Info className="w-4 h-4" />
              Learn More
            </button>
          </div>
        </motion.div>
      </div>

      {/* 3. Audio Controls positioned at critical vantage points */}
      <div className="absolute right-6 md:right-16 bottom-12 md:bottom-24 z-20">
        <motion.button
          id="hero-mute-toggle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMuted(!isMuted)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white cursor-pointer transition shadow-2xl"
          title={isMuted ? 'Unmute Trailer' : 'Mute Trailer'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
}
