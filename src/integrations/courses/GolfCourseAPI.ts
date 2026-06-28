import { env } from "@/lib/env";
import type { Course, Hole, TeeSet } from "@/types/domain";

const BASE_URL = "https://api.golfcourseapi.com/v1";

// ─── Real API shapes (verified against live API) ──────────────────────────

interface APITeeHole {
  par: number;
  yardage: number;
  handicap: number;
}

interface APITee {
  tee_name: string;
  course_rating: number;
  slope_rating: number;
  total_yards: number;
  total_meters?: number;
  number_of_holes?: number;
  par_total?: number;
  front_course_rating?: number;
  back_course_rating?: number;
  bogey_rating?: number;
  holes?: APITeeHole[];
}

interface APICourseLocation {
  address?: string;
  city: string;
  state: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// Both search results and course detail return the same shape
interface APICourseData {
  id: number;
  club_name: string;
  course_name: string;
  location: APICourseLocation;
  tees?: {
    male?: APITee[];
    female?: APITee[];
  };
}

interface APISearchResponse {
  courses: APICourseData[];
}

interface APICourseDetailResponse {
  course: APICourseData;
}

// ─── Tee color → hex ──────────────────────────────────────────────────────

const TEE_COLORS: Record<string, string> = {
  black: "#1A1A1A",
  blue: "#1E4BAD",
  white: "#E8E8E8",
  red: "#C0302A",
  gold: "#D4A017",
  yellow: "#D4A017",
  green: "#2A7040",
  silver: "#A0A8A0",
  orange: "#E87722",
  junior: "#F5A623",
  championship: "#1A1A1A",
};

function teeColor(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, "");
  for (const [k, v] of Object.entries(TEE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#888888";
}

// ─── Mapper ───────────────────────────────────────────────────────────────

export function mapCourse(raw: APICourseData): Course {
  const courseIdStr = `api-${raw.id}`;

  // Prefer male tees; fall back to female if no male tees present
  const maleTees = raw.tees?.male ?? [];
  const femaleTees = raw.tees?.female ?? [];
  const primaryTees = maleTees.length > 0 ? maleTees : femaleTees;

  // Deduplicate by tee_name across male + female
  const seenTeeNames = new Set<string>();
  const allTees = [...maleTees, ...femaleTees].filter((t) => {
    const key = t.tee_name.toLowerCase();
    if (seenTeeNames.has(key)) return false;
    seenTeeNames.add(key);
    return true;
  });

  // Find the canonical tee for par/handicap (most yards = championship)
  const canonicalTee =
    primaryTees.find((t) => t.holes && t.holes.length > 0) ??
    allTees.find((t) => t.holes && t.holes.length > 0);

  const holeCount = canonicalTee?.holes?.length ?? 18;

  const teeSets: TeeSet[] = allTees.map((t) => {
    const holePar = t.holes?.reduce((s, h) => s + h.par, 0) ?? t.par_total ?? 72;
    return {
      id: `${courseIdStr}-${t.tee_name.toLowerCase().replace(/\s+/g, "-")}`,
      name: t.tee_name,
      color: teeColor(t.tee_name),
      rating: t.course_rating,
      slope: t.slope_rating,
      par: holePar,
      yardage: t.total_yards,
    };
  });

  // Build holes — yardsByTeeSet comes from each tee's holes[] at the same index
  const holes: Hole[] = Array.from({ length: holeCount }, (_, i) => {
    const canonicalHole = canonicalTee?.holes?.[i];
    const yardsByTeeSet: Record<string, number> = {};

    allTees.forEach((t, teeIdx) => {
      const teeSetId = teeSets[teeIdx]?.id;
      if (!teeSetId) return;
      const apiHole = t.holes?.[i];
      yardsByTeeSet[teeSetId] = apiHole?.yardage ?? 0;
    });

    return {
      number: i + 1,
      par: canonicalHole?.par ?? 4,
      handicap: canonicalHole?.handicap ?? i + 1,
      yardsByTeeSet,
    };
  });

  return {
    id: courseIdStr,
    externalId: raw.id,
    name: raw.course_name || raw.club_name,
    facilityName: raw.club_name,
    city: raw.location.city ?? "",
    state: raw.location.state ?? "",
    zipCode: "",
    coordinates: {
      latitude: raw.location.latitude ?? 36.1627,
      longitude: raw.location.longitude ?? -86.7816,
    },
    teeSets,
    holes,
    amenities: [],
  };
}

// ─── Client ───────────────────────────────────────────────────────────────

function apiHeaders(): HeadersInit {
  return {
    Authorization: `Key ${env.EXPO_PUBLIC_GOLF_COURSE_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function searchCourses(query: string): Promise<APICourseData[]> {
  if (!env.EXPO_PUBLIC_GOLF_COURSE_API_KEY) return [];
  const url = `${BASE_URL}/search?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: apiHeaders() });
  if (!res.ok) throw new Error(`GolfCourseAPI search failed: ${res.status}`);
  const data: APISearchResponse = await res.json();
  return data.courses ?? [];
}

export async function fetchCourseDetail(id: number): Promise<Course> {
  const url = `${BASE_URL}/courses/${id}`;
  const res = await fetch(url, { headers: apiHeaders() });
  if (!res.ok) throw new Error(`GolfCourseAPI course detail failed: ${res.status}`);
  const data: APICourseDetailResponse = await res.json();
  return mapCourse(data.course);
}

export type { APICourseData };
