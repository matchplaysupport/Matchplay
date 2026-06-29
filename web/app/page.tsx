import { redirect } from "next/navigation";

// The two-card chooser was removed. The homepage now leads straight into the
// golfer (consumer) landing — the volume audience and strongest page. Courses
// are one click away via the "For Courses" nav link and the footer.
// (A page's default can't be re-used across routes in Next 16's client
// manifest, so `/` redirects to the canonical `/golfer` landing.)
export default function Home() {
  redirect("/golfer");
}
