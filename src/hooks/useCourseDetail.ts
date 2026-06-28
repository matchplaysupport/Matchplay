import { useQuery } from "@tanstack/react-query";
import { fetchCourseDetail } from "@/integrations/courses/GolfCourseAPI";
import { demoCourses } from "@/features/courses/demoData";
import { env } from "@/lib/env";
import type { Course } from "@/types/domain";

export function useCourseDetail(externalId: number | null, demoCourseId?: string) {
  const hasApiKey = Boolean(env.EXPO_PUBLIC_GOLF_COURSE_API_KEY);

  const apiQuery = useQuery({
    queryKey: ["course-detail", externalId],
    queryFn: () => fetchCourseDetail(externalId!),
    enabled: hasApiKey && externalId !== null && externalId > 0,
    staleTime: 30 * 60_000,
  });

  if (!hasApiKey && demoCourseId) {
    const demo = demoCourses.find((c) => c.id === demoCourseId) ?? null;
    return { course: demo as Course | null, isLoading: false, isError: false };
  }

  return {
    course: apiQuery.data ?? null,
    isLoading: apiQuery.isLoading,
    isError: apiQuery.isError,
  };
}
