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
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
          className="fixed inset-x-3 bottom-3 z-50 rounded-panel border bg-card p-4 shadow-floating sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
        >
          <p className="text-h4">Cookies and privacy</p>
          <p className="mt-1 text-caption text-muted-foreground">
            We use essential session tokens for sign-in and privacy-respecting telemetry to improve service.{" "}
            <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">Privacy</Link>
            {" · "}
            <Link to="/cookies" className="font-medium text-primary underline-offset-4 hover:underline">Cookies</Link>
          </p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={handleEssentialOnly}>Essential only</Button>
            <Button size="sm" className="flex-1" onClick={handleAccept}>Accept all</Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
