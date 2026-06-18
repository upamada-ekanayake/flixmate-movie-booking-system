import { Request, Response } from 'express';
// In production, this imports the PrismaClient client instantiated elsewhere:
// import { prisma } from '../config/database';

// For the sake of standard TypeScript validation without rigid build locks,
// we assume a globally instantiated client or define a schema contract:
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ScoreMap {
  [key: string]: {
    totalWeight: number;
    count: number;
    affinity: number;
  };
}

/**
 * calculates a "Genre & Director Weight Map" based on a user's WatchHistory
 * (completion rate metrics) and explicit ratings, scoring unwatched movies
 * to recommend the Top 10 picks.
 */
export async function getMovieRecommendations(req: Request, res: Response): Promise<void> {
  const { userId } = req.params;

  if (!userId) {
    res.status(400).json({ error: 'User ID is required to fetch recommendations.' });
    return;
  }

  try {
    const now = new Date();

    // 1. Caching Layer Check (AIRecommendationCache)
    const existingCache = await prisma.aIRecommendationCache.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: now,
        },
      },
      orderBy: {
        calculatedAt: 'desc',
      },
    });

    if (existingCache) {
      // Returned cached content directly
      res.json({
        source: 'cache',
        recommendations: typeof existingCache.recommendations === 'string'
          ? JSON.parse(existingCache.recommendations)
          : existingCache.recommendations,
        calculatedAt: existingCache.calculatedAt,
      });
      return;
    }

    // 2. Load User's Watch History (including movies, genres, and directors)
    const watchHistoryPrisma = await prisma.watchHistory.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            genres: true,
            directors: true,
          },
        },
      },
    });

    // 3. Load explicit AI preference profile to include custom visual weights
    const userPrefs = await prisma.userAIPreference.findUnique({
      where: { userId },
    });

    // Extract watched movie ids to exclude them from recommended recommendations
    const watchedMovieIds = new Set(watchHistoryPrisma.map((history) => history.movieId));

    // 4. Calculate Genre & Director Weight Map based on behavioral metrics
    const genreScoreMap: ScoreMap = {};
    const directorScoreMap: ScoreMap = {};

    watchHistoryPrisma.forEach((history) => {
      const completionRate = history.completionRate; // 0.0 to 1.0 (implicit)
      const explicitRating = history.explicitRating;  // 1.0 to 5.0 (explicit)

      // Calculate weight modifier:
      // Combines implicit completion rate (60%) with scaled explicit ratings (40%)
      let weightModifier = completionRate * 0.6;
      if (explicitRating) {
        weightModifier += (explicitRating / 5.0) * 0.4;
      } else {
        // Fallback: scale normal completion rate
        weightModifier += completionRate * 0.4;
      }

      // Populate Genre Weights
      history.movie.genres.forEach((genre) => {
        if (!genreScoreMap[genre.name]) {
          genreScoreMap[genre.name] = { totalWeight: 0, count: 0, affinity: 0 };
        }
        genreScoreMap[genre.name].totalWeight += weightModifier;
        genreScoreMap[genre.name].count += 1;
      });

      // Populate Director Weights
      history.movie.directors.forEach((director) => {
        if (!directorScoreMap[director.name]) {
          directorScoreMap[director.name] = { totalWeight: 0, count: 0, affinity: 0 };
        }
        directorScoreMap[director.name].totalWeight += weightModifier;
        directorScoreMap[director.name].count += 1;
      });
    });

    // Calculate normalized average affinity for each Genre
    Object.keys(genreScoreMap).forEach((genre) => {
      genreScoreMap[genre].affinity =
        genreScoreMap[genre].totalWeight / genreScoreMap[genre].count;
    });

    // Calculate normalized average affinity for each Director
    Object.keys(directorScoreMap).forEach((director) => {
      directorScoreMap[director].affinity =
        directorScoreMap[director].totalWeight / directorScoreMap[director].count;
    });

    // 5. Query candidate pool: All movies the user has not watched yet
    const candidateMovies = await prisma.movie.findMany({
      where: {
        id: {
          notIn: Array.from(watchedMovieIds),
        },
      },
      include: {
        genres: true,
        directors: true,
      },
    });

    // 6. Perform Content-Based Scoring against affinity profiles
    const recommendations = candidateMovies.map((movie) => {
      let genreScore = 0;
      let matchedGenresCount = 0;

      movie.genres.forEach((g) => {
        if (genreScoreMap[g.name]) {
          genreScore += genreScoreMap[g.name].affinity;
          matchedGenresCount++;
        }
      });

      // Average genre affinity
      const finalGenreAffinity = matchedGenresCount > 0 ? genreScore / matchedGenresCount : 0.1;

      let directorScore = 0;
      let matchedDirectorsCount = 0;

      movie.directors.forEach((d) => {
        if (directorScoreMap[d.name]) {
          directorScore += directorScoreMap[d.name].affinity;
          matchedDirectorsCount++;
        }
      });

      const finalDirectorAffinity =
        matchedDirectorsCount > 0 ? directorScore / matchedDirectorsCount : 0.1;

      // Base combination: 60% Genre weight + 40% Director weight
      let recommendationScore = finalGenreAffinity * 0.6 + finalDirectorAffinity * 0.4;

      // Apply Explicit preferences boost if movie genre is explicitly in preferredGenres
      if (userPrefs && userPrefs.preferredGenres) {
        const matchesPrefGenre = movie.genres.some((g) =>
          userPrefs.preferredGenres.includes(g.name)
        );
        if (matchesPrefGenre) {
          recommendationScore *= 1.25; // 25% affinity boost
        }
      }

      // Cap score in range 0.0 - 1.0 for visualization elegance
      const normalizedScore = Math.min(1.0, recommendationScore);

      return {
        movie: {
          id: movie.id,
          title: movie.title,
          synopsis: movie.synopsis,
          duration: movie.duration,
          posterUrl: movie.posterUrl,
          trailerUrl: movie.trailerUrl,
          averageRating: movie.averageRating,
          genres: movie.genres.map((g) => g.name),
          directors: movie.directors.map((d) => d.name),
        },
        score: parseFloat(normalizedScore.toFixed(4)),
      };
    });

    // Sort descending by recommendationScore and capture Top 10
    const topRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // 7. Write to Caching Layer (Expires in 24 hours)
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 24);

    await prisma.aIRecommendationCache.create({
      data: {
        userId,
        recommendations: JSON.stringify(topRecommendations),
        calculatedAt: now,
        expiresAt: expirationTime,
      },
    });

    res.json({
      source: 'recalculated_engine',
      recommendations: topRecommendations,
      calculatedAt: now,
    });
  } catch (error: any) {
    console.error('Error calculating movie recommendations:', error);
    res.status(500).json({
      error: 'An internal server error occurred while retrieving recommendations.',
      details: error.message,
    });
  }
}
