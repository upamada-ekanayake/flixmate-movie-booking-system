import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface BookingRequest {
  userId: string;
  showTimeId: string;
  seatIds: string[]; // List of Seat IDs to book
}

/**
 * Handles movie seat booking wrapped inside an isolated database transactional locking loop.
 * Implements strict PostgreSQL Row-Level Locks (SELECT ... FOR UPDATE) inside
 * Prisma's transactional middleware ($transaction) to prevent race conditions during blockbusters.
 */
export async function createBooking(req: Request, res: Response): Promise<void> {
  const { userId, showTimeId, seatIds } = req.body as BookingRequest;

  // Basic validation
  if (!userId || !showTimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    res.status(400).json({
      error: 'Invalid request layout. Provide userId, showTimeId, and a list of seatIds.',
    });
    return;
  }

  try {
    // Execute booking queries inside a fully rollback-capable PostgreSQL atomic transaction
    const bookingResult = await prisma.$transaction(async (tx) => {
      // 1. Enforce Row-Level Locking on Seats to serialize concurrent write access.
      // This prevents parallel transactions from checking overlapping states.
      // In PostgreSQL, "FOR UPDATE" blocks other queries attempting to lock or edit these rows.
      await tx.$executeRaw`
        SELECT * FROM "Seat" 
        WHERE id = ANY(${seatIds})
        FOR UPDATE
      `;

      // 2. Verify Showtime exists and retrieve pricing
      const showTime = await tx.showTime.findUnique({
        where: { id: showTimeId },
      });

      if (!showTime) {
        throw new Error('Requested Showtime does not exist.');
      }

      // Convert timestamp boundaries to guard late booking attempts
      if (new Date(showTime.startTime).getTime() < Date.now()) {
        throw new Error('This booking cannot be completed. The movie showtime has already commenced.');
      }

      // 3. Inspect existing Seat Bookings for this precise ShowTimeId to prevent race collisions.
      const doubleBookingCheck = await tx.bookingSeat.findMany({
        where: {
          showTimeId,
          seatId: {
            in: seatIds,
          },
        },
      });

      if (doubleBookingCheck.length > 0) {
        const standardConflictedSeatIds = doubleBookingCheck.map((s) => s.seatId).join(', ');
        throw new Error(
          `Booking Collision detected. One or more seats you selected (IDs: ${standardConflictedSeatIds}) are already booked. Please choose an alternative seat layout.`
        );
      }

      // 4. Calculate final line item pricing with capacity-based surge pricing
      const seatCount = seatIds.length;
      
      // Calculate current booked seat count for this precise showtime
      const bookedCount = await tx.bookingSeat.count({
        where: { showTimeId }
      });

      // Calculate total seats available inside the physical theater associated with this showtime
      const totalSeats = await tx.seat.count({
        where: { theaterName: showTime.theaterName }
      });

      // Capacity calculation: Surge price activates if theater capacity exceeds 75%
      const capacityRatio = totalSeats > 0 ? (bookedCount / totalSeats) : 0;
      const isSurgeActive = capacityRatio > 0.75;
      const finalPricePerSeat = isSurgeActive ? showTime.price * 1.15 : showTime.price;
      const calculatedTotal = finalPricePerSeat * seatCount;

      // 5. Commit main parent Booking item
      const newBooking = await tx.booking.create({
        data: {
          userId,
          showTimeId,
          totalPrice: calculatedTotal,
          status: 'CONFIRMED', // Set confirmed upon successful transactional completion
        },
      });

      // 6. Bulk create the individual BookingSeat bridge instances
      const bookingSeatData = seatIds.map((seatId) => ({
        bookingId: newBooking.id,
        showTimeId,
        seatId,
      }));

      await tx.bookingSeat.createMany({
        data: bookingSeatData,
      });

      return {
        bookingId: newBooking.id,
        totalPrice: calculatedTotal,
        seatCount,
        status: newBooking.status,
        isSurgeActive,
        capacityRatio,
        pricePerSeat: finalPricePerSeat,
        originalPrice: showTime.price,
      };
    });

    // Successfully committed database lock and writes
    res.status(201).json({
      success: true,
      message: 'Booking completed successfully with row-level transaction safety.',
      booking: bookingResult,
    });
  } catch (error: any) {
    console.error('CONCURRENCY RIVAL TRANSACTION ROLLBACK:', error.message);
    
    // Distinguish expected transactional constraint rollbacks vs general internal crashes
    if (
      error.message.includes('Collision detected') || 
      error.message.includes('not exist') || 
      error.message.includes('commenced')
    ) {
      res.status(409).json({
        success: false,
        error: 'Transactional Collision or Constraint Prevented Booking',
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Database Transaction Failure',
        message: 'An unexpected concurrency lock error occurred. Please try again.',
        details: error.message,
      });
    }
  }
}
export default createBooking;
