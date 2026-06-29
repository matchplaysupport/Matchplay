import Link from "next/link";
import { Logo } from "./components/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 mesh noise">
      <Logo size={34} onDark={false} />
      <p className="mt-10 text-7xl font-extrabold grad-text" style={{ fontFamily: "var(--font-sora)" }}>404</p>
      <h1 className="mt-3 text-2xl font-bold" style={{ color: "var(--text)" }}>This hole&apos;s out of bounds</h1>
      <p className="mt-3 text-base max-w-sm" style={{ color: "var(--muted)" }}>
        The page you&apos;re looking for took a mulligan. Let&apos;s get you back on the fairway.
      </p>
      <Link href="/" className="btn btn-primary mt-8">Back to the clubhouse</Link>
    </main>
  );
}
