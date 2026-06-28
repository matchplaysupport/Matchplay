import { demoCourses, demoTeeTimes } from "@/features/courses/demoData";
import type { Booking, Course, CourseSummary, TeeTime } from "@/types/domain";
import type {
  CreateBookingInput,
  TeeTimeDetail,
  TeeTimeProvider,
  TeeTimeSearchFilters,
} from "./TeeTimeProvider";

const summarize = (course: Course): CourseSummary => ({
  id: course.id,
  name: course.name,
  facilityName: course.facilityName,
  city: course.city,
  state: course.state,
  zipCode: course.zipCode,
});

/** Attach the course summary so screens never need to look up demo data themselves. */
const withCourse = (teeTime: TeeTime): TeeTime => {
  const course = demoCourses.find((item) => item.id === teeTime.courseId);
  return course ? { ...teeTime, course: summarize(course) } : teeTime;
};

export class SimulatedTeeTimeProvider implements TeeTimeProvider {
  private bookings: Booking[] = [];

  async search(filters: TeeTimeSearchFilters) {
    const query = filters.query?.trim().toLowerCase();
    let results = demoTeeTimes.filter((teeTime) => {
      const course = demoCourses.find((item) => item.id === teeTime.courseId);
      const matchesQuery =
        !query ||
        course?.name.toLowerCase().includes(query) ||
        course?.city.toLowerCase().includes(query) ||
        course?.state.toLowerCase().includes(query) ||
        course?.zipCode.includes(query);
      const matchesPlayers = !filters.minPlayers || teeTime.availableSpots >= filters.minPlayers;
      const matchesPrice = !filters.maxPriceCents || teeTime.priceCents <= filters.maxPriceCents;
      const matchesHoles = !filters.holes || teeTime.holes === filters.holes;
      return Boolean(matchesQuery && matchesPlayers && matchesPrice && matchesHoles);
    });

    if (filters.sortBy === "earliest") {
      results = [...results].sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    }
    if (filters.sortBy === "lowest_price") {
      results = [...results].sort((a, b) => a.priceCents - b.priceCents);
    }
    return Promise.resolve(results.map(withCourse));
  }

  async getTeeTime(id: string): Promise<TeeTimeDetail | null> {
    const teeTime = demoTeeTimes.find((item) => item.id === id);
    if (!teeTime) return Promise.resolve(null);
    const course = demoCourses.find((item) => item.id === teeTime.courseId) ?? null;
    return Promise.resolve({ teeTime: withCourse(teeTime), course });
  }

  async reserve(input: CreateBookingInput) {
    const teeTime = demoTeeTimes.find((item) => item.id === input.teeTimeId);
    if (!teeTime) {
      throw new Error("Tee time no longer exists.");
    }
    if (input.players < 1 || input.players > teeTime.availableSpots) {
      throw new Error("Requested player count is not available.");
    }
    if (input.communitySpots < 0 || input.communitySpots > input.players) {
      throw new Error("Community spots must fit within the booked player count.");
    }

    const booking: Booking = {
      id: `booking-${Date.now()}`,
      teeTimeId: teeTime.id,
      courseId: teeTime.courseId,
      confirmationCode: `MP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      players: input.players,
      communitySpots: input.communitySpots,
      createdAt: new Date().toISOString(),
      status: "requested",
      source: "concierge",
      fulfillmentLabel: "Concierge request received",
    };
    this.bookings = [booking, ...this.bookings];
    return Promise.resolve(booking);
  }

  async listUpcomingBookings() {
    return Promise.resolve(this.bookings);
  }
}
