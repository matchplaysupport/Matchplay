import { useQuery } from "@tanstack/react-query";
import { searchCourses, mapCourse } from "@/integrations/courses/GolfCourseAPI";
import { demoCourses } from "@/features/courses/demoData";
import { env } from "@/lib/env";
import type { Course } from "@/types/domain";

export interface CourseSearchResult {
  course: Course;
  /** True when populated from local demo data, not the API */
  isDemo: boolean;
}

export function useCourseSearch(query: string) {
  const hasApiKey = Boolean(env.EXPO_PUBLIC_GOLF_COURSE_API_KEY);

  const apiQuery = useQuery({
    queryKey: ["course-search", query],
    queryFn: async () => {
      const raw = await searchCourses(query);
      return raw.map((r): CourseSearchResult => ({ course: mapCourse(r), isDemo: false }));
    },
    enabled: hasApiKey && query.trim().length >= 2,
    staleTime: 5 * 60_000,
  });

  // When no API key, filter demo courses locally
  if (!hasApiKey) {
    const q = query.toLowerCase();
    const filtered = q.length >= 2
      ? demoCourses.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            c.facilityName.toLowerCase().includes(q),
        )
      : demoCourses;
    return {
      results: filtered.map((c): CourseSearchResult => ({ course: c, isDemo: true })),
      isLoading: false,
      isError: false,
      isDemoFallback: true,
    };
  }

  return {
    results: apiQuery.data ?? [],
    isLoading: apiQuery.isLoading,
    isError: apiQuery.isError,
    isDemoFallback: false,
  };
}
