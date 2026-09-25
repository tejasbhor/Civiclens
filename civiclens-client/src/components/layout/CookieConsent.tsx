import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const COOKIE_CONSENT_KEY = "civiclens_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ essential: true, analytics: true, timestamp: Date.now() }));
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ essential: true, analytics: false, timestamp: Date.now() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          role="region"
          aria-label="Cookie consent"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          className="fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/5 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm text-slate-900"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="font-display text-sm font-bold text-slate-950">Cookies & Privacy</p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            We use essential session tokens for sign-in and privacy-respecting telemetry to improve service.{" "}
            <Link to="/privacy" className="font-semibold text-emerald-700 hover:text-emerald-800 underline-offset-4 hover:underline">Privacy</Link>
            {" · "}
            <Link to="/cookies" className="font-semibold text-emerald-700 hover:text-emerald-800 underline-offset-4 hover:underline">Cookies</Link>
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 text-xs font-semibold h-9"
              onClick={handleEssentialOnly}
            >
              Essential only
            </Button>
            <Button
              size="sm"
              className="flex-1 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white text-xs font-semibold shadow-xs h-9"
              onClick={handleAccept}
            >
              Accept all
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
