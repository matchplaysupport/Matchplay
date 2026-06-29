import Image from "next/image";

// The Clubhouse mark — a serif "C" cradling a flag on the green. Ships in two
// finishes: a cream-background version for light surfaces and a dark-background
// version for dark surfaces (hero, footers on dark). `light` = sitting on a
// dark surface, so it picks the dark-background mark.
export function LogoMark({ size = 32, light = false }: { size?: number; light?: boolean }) {
  const src = light ? "/logo-dark.png" : "/logo-light.png";
  return (
    <Image
      src={src}
      alt="The Clubhouse"
      width={size}
      height={size}
      priority
      style={{ borderRadius: Math.round(size * 0.26), objectFit: "cover", display: "block" }}
    />
  );
}

export function Logo({ size = 32, light = false }: { size?: number; light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} light={light} />
      <span
        className="font-bold tracking-tight"
        style={{
          fontFamily: "var(--font-sora)",
          fontSize: size * 0.6,
          color: light ? "#fff" : "var(--text)",
        }}
      >
        The Clubhouse
      </span>
    </span>
  );
}
