import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Clubhouse — Golf Tee Times & Scoring",
    short_name: "The Clubhouse",
    description:
      "Book tee times, track match-play scoring and handicaps, and compete on leaderboards — with zero-commission booking for courses.",
    start_url: "/",
    display: "standalone",
    background_color: "#0C3A22",
    theme_color: "#0C3A22",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    categories: ["sports", "lifestyle"],
  };
}
