'use client';

import React from 'react';
import { Calendar, Clock, Star, Sparkles, Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface MovieCardProps {
  key?: React.Key | string;
  id: string;
  title: string;
  posterUrl: string;
  releaseYear: number;
  duration: number;
  rating: number;
  genres: string[];
  aiScore?: number; // Optional content-based matching score (0.0 to 1.0)
  onBookClick: () => void;
  onSelect: () => void;
}

export default function MovieCard({
  id,
  title,
  posterUrl,
  releaseYear,
  duration,
  rating,
  genres,
  aiScore,
  onBookClick,
  onSelect,
}: MovieCardProps) {
  // Convert score indicator to a visual percentage (e.g. 0.95 -> 95%)
  const matchPercentage = aiScore ? Math.round(aiScore * 100) : null;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onSelect}
      className="group relative flex flex-col w-full h-[420px] rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800/80 shadow-2xl cursor-pointer"
    >
      {/* 1. Base Image with Scale Transition */}
      <div className="relative w-full h-[280px] overflow-hidden">
        <img
          src={posterUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Ambient Darkened Image Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/20" />

        {/* 2. Intelligent Match Score overlay badge */}
        {matchPercentage && (
          <div className="absolute top-4 left-4 z-10">
            <span className="flex items-center gap-1 bg-violet-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow-[0_4px_12px_rgba(109,40,217,0.4)] border border-violet-500/30">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              {matchPercentage}% Match
            </span>
          </div>
        )}

        {/* Traditional IMDb rating layout badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="flex items-center gap-1 bg-black/75 backdrop-blur-md text-yellow-500 text-xs font-bold px-2.5 py-1 rounded-xl border border-zinc-700/55">
            <Star className="w-3.5 h-3.5 fill-current" />
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* 3. Glassmorphic Text and CTA Panel */}
      <div className="relative flex-1 p-5 flex flex-col justify-between bg-zinc-950 border-t border-zinc-900">
        <div>
          {/* Genre list wrapping */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {genres.slice(0, 3).map((genre) => (
              <span
                key={genre}
                className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-zinc-900/90 text-zinc-400 border border-zinc-800/60"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Title and metadata */}
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:text-red-500 transition-colors duration-200">
            {title}
          </h3>

          <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium mt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              {releaseYear}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              {duration}m
            </span>
          </div>
        </div>

        {/* Card Interactive glass drawer button appearing on hover */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-900">
          <span className="text-zinc-500 text-xs group-hover:text-zinc-200 transition-colors duration-300 font-medium">
            View Details
          </span>
          <button
            id={`movie-card-book-${id}`}
            onClick={(e) => {
              e.stopPropagation(); // Stop triggering select
              onBookClick();
            }}
            className="flex items-center justify-center p-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white hover:scale-105 transition duration-300 shadow-md shadow-red-600/20 cursor-pointer"
            title="Book Seats for this Movie"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
