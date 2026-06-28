// Match Play wordmark — a golf-flag roundel + type. Works on light or dark.
export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="url(#mp-g)" />
      {/* green hole */}
      <ellipse cx="20" cy="29" rx="11" ry="3.4" fill="#0C3A22" opacity="0.45" />
      {/* flag pole */}
      <path d="M19 11.5V28" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" />
      {/* flag */}
      <path d="M19 11.6L30 14.4L19 17.6V11.6Z" fill="#EFC04A" />
      <circle cx="19" cy="11.2" r="1.7" fill="#fff" />
      <defs>
        <linearGradient id="mp-g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22A85B" />
          <stop offset="1" stopColor="#15803D" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ size = 32, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className="font-bold tracking-tight"
        style={{
          fontFamily: "var(--font-sora)",
          fontSize: size * 0.6,
          color: light ? "#fff" : "var(--text)",
        }}
      >
        Match Play
      </span>
    </span>
  );
}
