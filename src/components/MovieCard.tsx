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
  aiScore?: number;
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
  const matchPercentage = aiScore ? Math.round(aiScore * 100) : null;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onSelect}
      className="group relative flex flex-col w-full h-[380px] rounded-none overflow-hidden bg-zinc-950 border border-white/10 shadow-2xl cursor-pointer"
    >
      <div className="relative w-full h-[240px] overflow-hidden bg-black">
        <img
          src={posterUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-75 group-hover:opacity-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/20" />

        {matchPercentage && (
          <div className="absolute top-3 left-3 z-10">
            <span className="flex items-center gap-1 bg-[#050505]/90 border border-white/10 text-orange-400 text-[10px] font-black uppercase tracking-tighter px-2.5 py-1 shadow-lg">
              <Sparkles className="w-3 h-3 text-orange-400 animate-pulse" />
              {matchPercentage}% Match
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <span className="flex items-center gap-1 bg-orange-600 text-white text-[10px] font-black uppercase tracking-tighter px-2.5 py-1">
            <Star className="w-3 h-3 fill-current text-white" />
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="relative flex-1 p-4 flex flex-col justify-between bg-zinc-950 border-t border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-1 mb-1.5">
            {genres.slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-none bg-white/5 text-white/50 border border-white/10"
              >
                {genre}
              </span>
            ))}
          </div>

          <h3 className="text-sm font-black uppercase italic tracking-tight text-white group-hover:text-orange-500 transition-colors duration-200">
            {title}
          </h3>

          <div className="flex items-center gap-2.5 text-[10px] text-zinc-400 font-bold uppercase mt-1 tracking-wider">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-500" />
              {releaseYear}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-500" />
              {duration}m
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider group-hover:text-zinc-200 transition-colors duration-300">
            View Details &rarr;
          </span>
          <button
            id={`movie-card-book-${id}`}
            onClick={(e) => {
              e.stopPropagation();
              onBookClick();
            }}
            className="flex items-center justify-center h-8 w-8 rounded-none bg-orange-600 hover:bg-orange-500 text-white hover:scale-105 transition duration-300 cursor-pointer"
            title="Book Seats"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
