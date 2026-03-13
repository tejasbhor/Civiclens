import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Users, Shield, TrendingUp, CheckCircle2, Clock, MapPin, FileText,
  AlertCircle, Mail, Phone, ExternalLink, HelpCircle, Info,
  ArrowRight, ChevronRight, Zap, Eye, BarChart3, Send
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useState, useEffect, useRef } from "react";
import apiClient from "@/services/apiClient";
import { logger } from "@/lib/logger";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardPath } from "@/utils/authHelpers";
import { APP_CONFIG } from "@/config/appConfig";

interface Stats {
  total_reports: number;
  resolved_reports: number;
  active_officers: number;
  avg_resolution_days: number;
}

// Animated counter hook
function useCountUp(target: number, duration: number = 2000, active: boolean = true) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!active || target === 0) { setCount(0); return; }

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration, active]);

  return count;
}

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Redirect logged-in users to their appropriate dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const dashboardPath = getDashboardPath(user);
      if (dashboardPath !== '/') {
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await apiClient.get('/analytics/public/stats');
        logger.debug('Public stats received:', response.data);
        const statsData = response.data;
        setStats({
          total_reports: statsData.total_reports || 0,
          resolved_reports: statsData.resolved_reports || 0,
          active_officers: statsData.active_officers || 0,
          avg_resolution_days: statsData.avg_resolution_days || 0
        });
      } catch (error: any) {
        logger.error('Failed to fetch stats:', error);
        setStats(null);
      } finally {
        setStatsLoading(false);
      }
    };

    if (!user) {
      fetchStats();
    }
  }, [user]);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(Math.floor(num));

  // Animated stat values
  const animatedTotal = useCountUp(stats?.total_reports || 0, 2000, statsVisible);
  const animatedResolved = useCountUp(stats?.resolved_reports || 0, 2000, statsVisible);
  const animatedOfficers = useCountUp(stats?.active_officers || 0, 1500, statsVisible);

  return (
    <>
      <SEO
        title={`${APP_CONFIG.appName} - Civic Issue Reporting & Resolution Portal`}
        description={`${APP_CONFIG.appName} is the official civic issue reporting and resolution portal. Citizens report issues, officers resolve them — together building better communities.`}
        keywords="civic issues, municipal services, citizen reporting, officer portal, issue tracking, government portal, complaint management"
      />

      <div className="min-h-screen bg-background">
        {/* ─── Navbar ─────────────────────────────────────────── */}
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
                  <MapPin className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground tracking-tight">{APP_CONFIG.appName}</h1>
                  <p className="text-[11px] text-muted-foreground font-medium leading-none">Report &middot; Track &middot; Resolve</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => navigate('/citizen/login')}>
                  <Users className="w-4 h-4 mr-1.5" />
                  Citizen Portal
                </Button>
                <Button variant="ghost" size="sm" className="text-sm font-medium" onClick={() => navigate('/officer/login')}>
                  <Shield className="w-4 h-4 mr-1.5" />
                  Officer Portal
                </Button>
              </nav>

              {/* Mobile CTA */}
              <div className="flex md:hidden items-center gap-2">
                <Button size="sm" onClick={() => navigate('/citizen/login')}>Get Started</Button>
              </div>
            </div>
          </div>
        </header>

        {/* ─── Hero Section ───────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 relative">
            <div className="max-w-4xl mx-auto text-center">
              {/* Tagline chip */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6 border border-primary/20">
                <Zap className="w-3.5 h-3.5" />
                {APP_CONFIG.orgName} &middot; Official Portal
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.1]">
                Your Voice.{" "}
                <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                  Your City.
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-muted-foreground">
                  One Platform.
                </span>
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Citizens report civic issues instantly. Officers manage and resolve them efficiently.
                Together, we build better communities — transparently and accountably.
              </p>

              {/* Dual CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <Button
                  size="lg"
                  className="text-base px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  onClick={() => navigate('/citizen/login')}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Report an Issue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base px-8 py-6 border-2 hover:bg-secondary/5 hover:border-secondary transition-all"
                  onClick={() => navigate('/officer/login')}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Officer Sign In
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                No app download required &middot; Works on any device &middot; Secure &amp; Private
              </p>
            </div>
          </div>
        </section>

        {/* ─── How It Works ───────────────────────────────────── */}
        <section className="bg-muted/40 border-y">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">How It Works</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A simple, transparent workflow connecting citizens and officers for faster resolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                {
                  icon: <Send className="w-6 h-6" />,
                  step: "01",
                  title: "Report Issue",
                  desc: "Citizens submit a report with photos, location, and description.",
                  color: "text-blue-600 bg-blue-100",
                },
                {
                  icon: <Zap className="w-6 h-6" />,
                  step: "02",
                  title: "AI Classification",
                  desc: "Our AI system auto-classifies the issue and routes it to the right department.",
                  color: "text-purple-600 bg-purple-100",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  step: "03",
                  title: "Officer Action",
                  desc: "Assigned officers take action, update progress, and upload resolution proof.",
                  color: "text-emerald-600 bg-emerald-100",
                },
                {
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  step: "04",
                  title: "Resolved",
                  desc: "Citizens get notified, verify the resolution, and track everything in real-time.",
                  color: "text-amber-600 bg-amber-100",
                },
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Connector line (desktop only) */}
                  {idx < 3 && (
                    <div className="hidden md:block absolute top-10 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[2px] bg-gradient-to-r from-border to-border/30 z-0" />
                  )}
                  <Card className="relative z-10 p-6 text-center hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/10 bg-card h-full">
                    <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                      {item.icon}
                    </div>
                    <div className="text-xs font-bold text-muted-foreground mb-2 tracking-widest uppercase">
                      Step {item.step}
                    </div>
                    <h4 className="text-lg font-bold text-foreground mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Portal Access Cards ────────────────────────────── */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Choose Your Portal</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Select the portal that matches your role to get started.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Citizen Card */}
            <Card
              className="relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/30 group"
              onClick={() => navigate('/citizen/login')}
              role="button"
              tabIndex={0}
              aria-label="Access Citizen Portal"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/citizen/login'); }}
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent" />

              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Citizen Portal</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    Report civic issues like potholes, broken streetlights, or waste problems.
                    Track the status of your reports and receive real-time updates on resolution progress.
                  </p>
                  <div className="space-y-2 mb-5">
                    {["Submit reports with photos & GPS", "Track resolution in real-time", "View complete report history"].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full group-hover:shadow-md transition-all" size="lg">
                    Access Citizen Portal
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Officer Card */}
            <Card
              className="relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-secondary/30 group"
              onClick={() => navigate('/officer/login')}
              role="button"
              tabIndex={0}
              aria-label="Access Officer Portal"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/officer/login'); }}
            >
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-secondary to-accent" />

              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg shadow-secondary/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">Officer Portal</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    Manage assigned tasks, update issue status, upload resolution documentation,
                    and resolve civic issues through a streamlined workflow.
                  </p>
                  <div className="space-y-2 mb-5">
                    {["Manage & prioritize assigned tasks", "Update progress with documentation", "Complete resolution workflow"].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="secondary" className="w-full group-hover:shadow-md transition-all" size="lg">
                    Access Officer Portal
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ─── Platform Statistics ─────────────────────────────── */}
        <section ref={statsRef} className="bg-gradient-to-br from-foreground to-foreground/90 text-primary-foreground">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Platform Impact</h3>
              <p className="text-primary-foreground/70 max-w-xl mx-auto">
                Real-time metrics showcasing the difference we're making together.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: <FileText className="w-6 h-6" />,
                  value: statsLoading ? null : stats ? formatNumber(animatedTotal) : null,
                  label: "Total Reports",
                  accent: "from-blue-400 to-blue-600",
                },
                {
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  value: statsLoading ? null : stats ? formatNumber(animatedResolved) : null,
                  label: "Issues Resolved",
                  accent: "from-emerald-400 to-emerald-600",
                },
                {
                  icon: <Shield className="w-6 h-6" />,
                  value: statsLoading ? null : stats ? formatNumber(animatedOfficers) : null,
                  label: "Active Officers",
                  accent: "from-purple-400 to-purple-600",
                },
                {
                  icon: <Clock className="w-6 h-6" />,
                  value: statsLoading ? null : stats ? `${stats.avg_resolution_days.toFixed(1)}` : null,
                  suffix: "days",
                  label: "Avg. Resolution",
                  accent: "from-amber-400 to-amber-600",
                },
              ].map((stat, idx) => (
                <div key={idx} className="text-center group">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.accent} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold mb-1 tabular-nums">
                    {statsLoading ? (
                      <span className="inline-block animate-pulse bg-primary-foreground/20 rounded h-8 w-16" />
                    ) : stat.value !== null ? (
                      <>
                        {stat.value}
                        {(stat as any).suffix && <span className="text-base font-semibold text-primary-foreground/60 ml-1">{(stat as any).suffix}</span>}
                      </>
                    ) : (
                      <span className="text-primary-foreground/40 text-xl">—</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-primary-foreground/60">{stat.label}</div>
                </div>
              ))}
            </div>

            {!stats && !statsLoading && (
              <div className="text-center mt-6">
                <p className="text-sm text-primary-foreground/50">Statistics are currently being updated.</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── Key Features ───────────────────────────────────── */}
        <section className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Why {APP_CONFIG.appName}?</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for transparency, efficiency, and real impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Eye className="w-5 h-5" />,
                title: "Full Transparency",
                desc: "Every report is tracked from submission to resolution. Citizens can see exactly what's happening.",
                color: "text-blue-600 bg-blue-100",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "AI-Powered Routing",
                desc: "Intelligent classification and routing ensures issues reach the right department instantly.",
                color: "text-purple-600 bg-purple-100",
              },
              {
                icon: <MapPin className="w-5 h-5" />,
                title: "GPS-Tagged Reports",
                desc: "Precise geotagging with interactive maps means no issue goes unnoticed or unfound.",
                color: "text-red-600 bg-red-100",
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: "Real-Time Analytics",
                desc: "Live dashboards for administrators and officers to monitor resolution rates and performance.",
                color: "text-emerald-600 bg-emerald-100",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Secure & Accountable",
                desc: "Complete audit trails, role-based access, and encrypted communications ensure data security.",
                color: "text-orange-600 bg-orange-100",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Measurable Impact",
                desc: "Track resolution times, officer performance, and community satisfaction with real data.",
                color: "text-teal-600 bg-teal-100",
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-all border hover:border-primary/10 group">
                <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h4 className="text-base font-bold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── Footer ─────────────────────────────────────────── */}
        <footer className="border-t bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{APP_CONFIG.appName}</h3>
                    <p className="text-xs text-muted-foreground">Report &middot; Track &middot; Resolve</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Empowering citizens and government officers to work together for better civic infrastructure and services.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Portals</h4>
                <ul className="space-y-2.5">
                  {[
                    { label: "Citizen Portal", path: "/citizen/login", icon: <Users className="w-3.5 h-3.5" /> },
                    { label: "Officer Portal", path: "/officer/login", icon: <Shield className="w-3.5 h-3.5" /> },
                  ].map((link, i) => (
                    <li key={i}>
                      <a
                        href="#"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                        onClick={(e) => { e.preventDefault(); navigate(link.path); }}
                      >
                        {link.icon}
                        {link.label}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Help & Support
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" />
                      About This Portal
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Legal</h4>
                <ul className="space-y-2.5">
                  {["Privacy Policy", "Terms of Service", "Accessibility Statement", "Data Protection"].map((item, i) => (
                    <li key={i}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">Contact</h4>
                <ul className="space-y-3">
                  <li>
                    <a
                      href={`mailto:${APP_CONFIG.supportEmail}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="break-all">{APP_CONFIG.supportEmail}</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+911234567890"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4 shrink-0" />
                      +91 1234 567 890
                    </a>
                  </li>
                  <li className="pt-1">
                    <p className="text-xs text-muted-foreground">
                      Office Hours: Monday – Friday<br />
                      9:00 AM – 6:00 PM IST
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground text-center md:text-left">
                  <p>&copy; {new Date().getFullYear()} {APP_CONFIG.appName}. All rights reserved.</p>
                  <p className="text-xs mt-1">
                    An initiative by {APP_CONFIG.orgName} for civic issue management and resolution.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>v1.0.0</span>
                  <span className="hidden md:inline">&middot;</span>
                  <span className="hidden md:inline">
                    Updated: {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Landing;
