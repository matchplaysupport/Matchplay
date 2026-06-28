import type { Booking, TeeTime } from "@/types/domain";

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

export interface TeeTimeProvider {
  search(filters: TeeTimeSearchFilters): Promise<TeeTime[]>;
  reserve(input: CreateBookingInput): Promise<Booking>;
  listUpcomingBookings(): Promise<Booking[]>;
}
