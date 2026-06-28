import type { Booking, Course, TeeTime } from "@/types/domain";

export interface TeeTimeSearchFilters {
  query?: string;
  date?: string;
  minPlayers?: number;
  radiusMiles?: number;
  maxPriceCents?: number;
  holes?: 9 | 18;
  sortBy?: "recommended" | "earliest" | "lowest_price" | "closest" | "highest_rated";
}

export interface CreateBookingInput {
  teeTimeId: string;
  players: number;
  communitySpots: number;
}

/** A single tee time plus its full course, for the detail screen. */
export interface TeeTimeDetail {
  teeTime: TeeTime;
  course: Course | null;
}

export interface TeeTimeProvider {
  search(filters: TeeTimeSearchFilters): Promise<TeeTime[]>;
  /** Fetch one tee time (with its course) by id. Returns null if not found. */
  getTeeTime(id: string): Promise<TeeTimeDetail | null>;
  reserve(input: CreateBookingInput): Promise<Booking>;
  listUpcomingBookings(): Promise<Booking[]>;
}
