const P = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;
type S = { size?: number };
export const Arrow = ({ size = 22 }: S) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5.5l6.5 6.5-6.5 6.5" strokeWidth="2.6" {...P} /></svg>
);
export const Check = ({ size = 22 }: S) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5l5 5 10-11" strokeWidth="2.8" {...P} /></svg>
);
export const Cross = ({ size = 22 }: S) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" strokeWidth="2.8" {...P} /></svg>
);
export const ThemeIcon = ({ size = 22 }: S) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" strokeWidth="2.4" {...P} /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" /></svg>
);
export const Mark = ({ size = 34 }: S) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="8" fill="#0B0B0B" style={{ stroke: "var(--ink)", strokeWidth: 2 }} />
    <circle cx="16" cy="16" r="8.5" fill="none" stroke="#FFC800" strokeWidth="3.5" />
    <circle cx="16" cy="16" r="2.6" fill="#FFC800" />
  </svg>
);
