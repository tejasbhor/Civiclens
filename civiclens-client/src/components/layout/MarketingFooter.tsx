import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Twitter, Linkedin, Youtube } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const BRAND = "CivicLens";

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["/#how-it-works", "How it works"],
      ["/#stakeholders", "Solutions"],
      ["/#proof-verification", "Stories"],
      ["/#ai-engine", "Integrations"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/about", "About"],
      ["/careers", "Careers"],
      ["/blog", "Blog"],
      ["/contact", "Contact"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["/docs", "Help center"],
      ["/guides", "Guides"],
      ["/api", "API docs"],
      ["/status", "Status"],
    ],
  },
];

export function MarketingFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200/80 text-slate-600">
      <div className="container !px-5 max-w-7xl mx-auto py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.6fr] gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo name={BRAND} />
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Real problems. A cleaner, feasible tomorrow.
            </p>
          </div>

          {/* Nav Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-xs">
                {col.links.map(([to, label]) => {
                  const isHash = to.startsWith("/#") || to.startsWith("http");
                  return (
                    <li key={label}>
                      {isHash ? (
                        <a
                          href={to}
                          className="hover:text-slate-900 transition-colors"
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          to={to}
                          className="hover:text-slate-900 transition-colors"
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Newsletter Box */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Get civic tech updates
            </h3>
            {subscribed ? (
              <p className="text-xs font-medium text-emerald-600">
                ✓ Thank you for subscribing!
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shrink-0 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
            <p className="text-[11px] text-slate-400">
              No spam. Just progress.
            </p>
          </div>
        </div>

        {/* Bottom Legal & Social Links Bar */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} CivicLens. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-600 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-slate-600 transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="hover:text-slate-600 transition-colors">
              Cookies
            </Link>
            <Link to="/security" className="hover:text-slate-600 transition-colors">
              Security
            </Link>
            <Link to="/accessibility" className="hover:text-slate-600 transition-colors">
              Accessibility
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="CivicLens on X"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="CivicLens on LinkedIn"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              aria-label="CivicLens on YouTube"
              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
