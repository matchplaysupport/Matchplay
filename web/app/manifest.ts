import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Match Play — Golf Tee Times & Scoring",
    short_name: "Match Play",
    description:
      "Book tee times, track match-play scoring and handicaps, and compete on leaderboards — with zero-commission booking for courses.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFCF9",
    theme_color: "#15803D",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    categories: ["sports", "lifestyle"],
  };
}
