// Pure SVG icons — safe to render in server components.
type P = { className?: string; size?: number };
const base = (size = 24) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const IconCalendar = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
export const IconDollar = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
);
export const IconChart = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
);
export const IconSearch = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
);
export const IconPhone = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>
);
export const IconTrophy = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M6 9H4a2 2 0 0 1-2-2V5h4" /><path d="M18 9h2a2 2 0 0 0 2-2V5h-4" /><path d="M12 17v4" /><path d="M8 21h8" /><path d="M6 5v4a6 6 0 0 0 12 0V5H6z" /></svg>
);
export const IconCheck = ({ className, size }: P) => (
  <svg {...base(size)} className={className} strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
);
export const IconBell = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);
export const IconMapPin = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const IconUsers = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const IconShield = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
);
export const IconCard = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
export const IconFlag = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></svg>
);
export const IconZap = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
export const IconArrow = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
export const IconChevron = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><polyline points="6 9 12 15 18 9" /></svg>
);
export const IconMenu = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);
export const IconX = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
export const IconStar = ({ className, size }: P) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
export const IconSun = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
);
export const IconMoon = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
);
