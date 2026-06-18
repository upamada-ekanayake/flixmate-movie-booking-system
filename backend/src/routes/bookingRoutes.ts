/**
 * FlixMate — Booking API Routes
 *
 * Exposes the booking endpoint which wraps the Prisma transactional
 * row-level locking logic defined in bookingController.ts.
 *
 * Route: POST /api/bookings
 *
 * Request Body:
 *   {
 *     "userId":     string,   // UUID of the authenticated user
 *     "showTimeId": string,   // UUID of the target showtime
 *     "seatIds":    string[]  // Array of seat UUIDs to reserve
 *   }
 *
 * Response (201 Created):
 *   {
 *     "success": true,
 *     "message": string,
 *     "booking": {
 *       "bookingId":    string,
 *       "totalPrice":   number,
 *       "seatCount":    number,
 *       "status":       "CONFIRMED",
 *       "isSurgeActive": boolean,
 *       "capacityRatio": number,
 *       "pricePerSeat":  number,
 *       "originalPrice": number
 *     }
 *   }
 *
 * Response (409 Conflict):
 *   { "success": false, "error": string, "message": string }
 */

import { Router } from 'express';
import { createBooking } from '../controllers/bookingController';

const router = Router();

// POST /api/bookings — Atomically reserve seats for a showtime
router.post('/bookings', createBooking);

export default router;
