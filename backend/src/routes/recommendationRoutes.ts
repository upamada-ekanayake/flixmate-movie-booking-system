/**
 * FlixMate — Recommendation API Routes
 *
 * Exposes the recommendation endpoint which runs the content-based
 * filtering algorithm defined in recommendationController.ts.
 *
 * Route: GET /api/recommendations/:userId
 *
 * URL Params:
 *   userId — UUID of the authenticated user
 *
 * Response (200 OK):
 *   {
 *     "source": "cache" | "recalculated_engine",
 *     "calculatedAt": string (ISO timestamp),
 *     "recommendations": [
 *       {
 *         "movie": {
 *           "id":            string,
 *           "title":         string,
 *           "synopsis":      string,
 *           "duration":      number,
 *           "posterUrl":     string,
 *           "trailerUrl":    string,
 *           "averageRating": number,
 *           "genres":        string[],
 *           "directors":     string[]
 *         },
 *         "score": number  // 0.0 – 1.0 affinity score
 *       }
 *     ]
 *   }
 */

import { Router } from 'express';
import { getMovieRecommendations } from '../controllers/recommendationController';

const router = Router();

// GET /api/recommendations/:userId — Fetch or compute AI movie recommendations
router.get('/recommendations/:userId', getMovieRecommendations);

export default router;
