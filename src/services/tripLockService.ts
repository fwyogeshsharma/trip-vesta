// Trip Lock Service - Handles race conditions during payment processing

export interface TripLock {
  tripId: number;
  userId: string;
  lockedAt: number;
  expiresAt: number;
  sessionId: string;
}

export interface PaymentReservation {
  tripId: number;
  userId: string;
  amount: number;
  reservedAt: number;
  expiresAt: number;
  sessionId: string;
  status: 'reserved' | 'processing' | 'completed' | 'expired' | 'cancelled';
}

class TripLockService {
  private static locks: Map<number, TripLock> = new Map();
  private static reservations: Map<string, PaymentReservation> = new Map();
  private static readonly LOCK_DURATION = 10 * 60 * 1000; // 10 minutes
  private static readonly RESERVATION_DURATION = 15 * 60 * 1000; // 15 minutes

  // Generate unique session ID
  private static generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if trip is available for investment
  static isTripAvailable(tripId: number, userId: string): boolean {
    const lock = this.locks.get(tripId);

    if (!lock) {
      return true; // No lock exists
    }

    // Check if lock has expired
    if (Date.now() > lock.expiresAt) {
      this.locks.delete(tripId);
      return true;
    }

    // Trip is available if current user holds the lock
    return lock.userId === userId;
  }

  // Lock trip for payment processing
  static lockTrip(tripId: number, userId: string): { success: boolean; sessionId?: string; message: string } {
    const existingLock = this.locks.get(tripId);

    // Check if there's a valid existing lock
    if (existingLock && Date.now() < existingLock.expiresAt) {
      if (existingLock.userId === userId) {
        // User already has the lock, extend it
        existingLock.expiresAt = Date.now() + this.LOCK_DURATION;
        return {
          success: true,
          sessionId: existingLock.sessionId,
          message: 'Lock extended successfully'
        };
      } else {
        // Another user has the lock
        return {
          success: false,
          message: 'Trip is currently being processed by another investor'
        };
      }
    }

    // Create new lock
    const sessionId = this.generateSessionId();
    const lock: TripLock = {
      tripId,
      userId,
      lockedAt: Date.now(),
      expiresAt: Date.now() + this.LOCK_DURATION,
      sessionId
    };

    this.locks.set(tripId, lock);

    return {
      success: true,
      sessionId,
      message: 'Trip locked successfully'
    };
  }

  // Release trip lock
  static releaseLock(tripId: number, userId: string, sessionId: string): boolean {
    const lock = this.locks.get(tripId);

    if (lock && lock.userId === userId && lock.sessionId === sessionId) {
      this.locks.delete(tripId);
      return true;
    }

    return false;
  }

  // Create payment reservation
  static createReservation(
    tripId: number,
    userId: string,
    amount: number
  ): { success: boolean; reservationId?: string; message: string } {
    // Check if trip is locked by user
    if (!this.isTripAvailable(tripId, userId)) {
      return {
        success: false,
        message: 'Trip is not available for reservation'
      };
    }

    const reservationId = this.generateSessionId();
    const reservation: PaymentReservation = {
      tripId,
      userId,
      amount,
      reservedAt: Date.now(),
      expiresAt: Date.now() + this.RESERVATION_DURATION,
      sessionId: reservationId,
      status: 'reserved'
    };

    this.reservations.set(reservationId, reservation);

    // Also lock the trip
    this.lockTrip(tripId, userId);

    return {
      success: true,
      reservationId,
      message: 'Payment reservation created successfully'
    };
  }

  // Update reservation status
  static updateReservationStatus(
    reservationId: string,
    status: PaymentReservation['status']
  ): boolean {
    const reservation = this.reservations.get(reservationId);

    if (reservation && Date.now() < reservation.expiresAt) {
      reservation.status = status;
      return true;
    }

    return false;
  }

  // Complete reservation (successful payment)
  static completeReservation(reservationId: string, userId: string): boolean {
    const reservation = this.reservations.get(reservationId);

    if (reservation && reservation.userId === userId) {
      reservation.status = 'completed';

      // Release the lock since payment is complete
      this.releaseLock(reservation.tripId, userId, reservation.sessionId);

      return true;
    }

    return false;
  }

  // Cancel reservation
  static cancelReservation(reservationId: string, userId: string): boolean {
    const reservation = this.reservations.get(reservationId);

    if (reservation && reservation.userId === userId) {
      reservation.status = 'cancelled';

      // Release the lock
      this.releaseLock(reservation.tripId, userId, reservation.sessionId);

      // Remove reservation
      this.reservations.delete(reservationId);

      return true;
    }

    return false;
  }

  // Get reservation details
  static getReservation(reservationId: string): PaymentReservation | null {
    return this.reservations.get(reservationId) || null;
  }

  // Clean up expired locks and reservations
  static cleanup(): void {
    const now = Date.now();

    // Clean up expired locks
    for (const [tripId, lock] of this.locks.entries()) {
      if (now > lock.expiresAt) {
        this.locks.delete(tripId);
      }
    }

    // Clean up expired reservations
    for (const [reservationId, reservation] of this.reservations.entries()) {
      if (now > reservation.expiresAt && reservation.status !== 'completed') {
        reservation.status = 'expired';
        this.reservations.delete(reservationId);

        // Also release any associated lock
        this.releaseLock(reservation.tripId, reservation.userId, reservation.sessionId);
      }
    }
  }

  // Get all locked trips (for UI updates)
  static getLockedTrips(): number[] {
    const now = Date.now();
    const lockedTripIds: number[] = [];

    for (const [tripId, lock] of this.locks.entries()) {
      if (now < lock.expiresAt) {
        lockedTripIds.push(tripId);
      }
    }

    return lockedTripIds;
  }

  // Get lock info for a trip
  static getLockInfo(tripId: number): TripLock | null {
    const lock = this.locks.get(tripId);

    if (lock && Date.now() < lock.expiresAt) {
      return lock;
    }

    return null;
  }

  // Initialize cleanup interval
  static startCleanupInterval(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Clean up every minute
  }
}

// Auto-start cleanup when service is imported
TripLockService.startCleanupInterval();

export { TripLockService };