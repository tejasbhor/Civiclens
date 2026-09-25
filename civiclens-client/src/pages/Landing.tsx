import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CivicHero } from "@/components/landing/CivicHero";
import { MetricsStrip } from "@/components/landing/MetricsStrip";
import { StepJourney } from "@/components/landing/StepJourney";
import { AiExplodedLayers } from "@/components/landing/AiExplodedLayers";
import { StakeholderGrid } from "@/components/landing/StakeholderGrid";
import { BeforeAfterSlider } from "@/components/landing/BeforeAfterSlider";
import { FAQ } from "@/components/landing/FAQ";
import { HeroCityCta } from "@/components/landing/HeroCityCta";
import { MarketingFooter } from "@/components/layout/MarketingFooter";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { LandingPreloader } from "@/components/landing/LandingPreloader";
import { SEO } from "@/components/SEO";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/utils/authHelpers";

const BRAND = "CivicLens";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useSmoothScroll();

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const dashboardPath = getDashboardPath(user);
      if (dashboardPath !== "/") navigate(dashboardPath, { replace: true });
    }
  }, [user, authLoading, navigate]);

  return (
    <>
      <SEO
        title={`${BRAND} - One shared record for every civic issue`}
        description={`${BRAND} is an independent demonstration project: residents report issues, AI suggests a category and department from the report text, staff decide, and officers close with before and after photos.`}
        keywords="civic issues, citizen reporting, issue tracking, municipal software, complaint management, demonstration project"
      />

      <LandingPreloader />

      <div className="min-h-dvh bg-white text-slate-900 selection:bg-amber-500/20">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <MarketingNav />

        <main id="main">
          <CivicHero />
          <MetricsStrip />
          <StepJourney />
          <AiExplodedLayers />
          <StakeholderGrid />

          <BeforeAfterSlider />

          <FAQ />
          <HeroCityCta />
        </main>

        <MarketingFooter />
      </div>
    </>
  );
}
