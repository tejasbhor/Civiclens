import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import "@/styles/notice.css";
import { Arrow, Mark, ThemeIcon } from "./Icons";

const NAV: [string, string][] = [
  ["/#lifecycle", "How it works"],
  ["/#ai-triage", "AI triage"],
  ["/docs", "Docs"],
  ["/security", "Security"],
];
const DEMO = "/citizen/login";

const FOOT: { title: string; links: [string, string][] }[] = [
  { title: "Product", links: [["/#lifecycle", "How it works"], ["/#ai-triage", "AI triage"], [DEMO, "Open the demo"]] },
  { title: "Resources", links: [["/docs", "Docs"], ["/status", "Status"]] },
  { title: "Trust", links: [["/privacy", "Privacy"], ["/terms", "Terms"], ["/cookies", "Cookies"], ["/security", "Security"]] },
];

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button className="icon-btn" type="button" aria-pressed={dark} aria-label="Dark theme" onClick={() => setTheme(dark ? "light" : "dark")}>
      <ThemeIcon />
    </button>
  );
}

export function NoticeShell({ children }: { children: ReactNode }) {
  return (
    <div className="nz">
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="wrap bar">
          <Link className="brand" to="/" aria-label="CivicLens, home"><Mark />CivicLens</Link>
          <nav className="nav" aria-label="Primary">
            {NAV.map(([to, label]) => <Link key={label} to={to}>{label}</Link>)}
          </nav>
          <div className="tools">
            <ThemeButton />
            <Link className="btn sm" to={DEMO}>Open the live demo</Link>
            <details className="menu">
              <summary>Menu</summary>
              <ul>
                <li className="cta"><Link to={DEMO}>Open the live demo</Link></li>
                {NAV.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}
              </ul>
            </details>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="wrap">
          <p>CivicLens is an independent demonstration product built by Tejas Bhor. It is not a government service.</p>
          <div className="foot-grid">
            {FOOT.map((g) => (
              <nav key={g.title} aria-label={g.title}>
                <h2>{g.title}</h2>
                <ul>{g.links.map(([to, label]) => <li key={label}><Link to={to}>{label}</Link></li>)}</ul>
              </nav>
            ))}
          </div>
          <p style={{ marginTop: "1.5rem" }} aria-hidden="true"><Arrow size={0} /></p>
        </div>
      </footer>
    </div>
  );
}
