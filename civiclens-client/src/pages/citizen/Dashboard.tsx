import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Plus, FileText, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { reportsService, Report } from "@/services/reportsService";
import { userService } from "@/services/userService";
import { showToast } from "@/lib/utils/toast";
import { CitizenHeader } from "@/components/layout/CitizenHeader";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { logger } from "@/lib/logger";
import { PageShell, PageHeader, Section } from "@/components/layout/PageShell";
import { StatusBadge, SeverityBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { CountUp } from "@/components/landing/CountUp";
import { PageSkeleton } from "@/components/feedback/Skeletons";

interface DashboardStats {
  total: number;
  active: number;
  resolved: number;
  closed: number;
}

const ACTIVE_STATUSES = [
  'received',
  'pending_classification',
  'classified',
  'assigned_to_department',
  'assigned_to_officer',
  'acknowledged',
  'in_progress'
];

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isOffline } = useAuth();
  const { isBackendReachable } = useConnectionStatus();

  const [reports, setReports] = useState<Report[]>([]);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    active: 0,
    resolved: 0,
    closed: 0
  });
  const [userStats, setUserStats] = useState<{
    total_reports?: number;
    resolved_reports?: number;
    in_progress_reports?: number;
    active_reports?: number;
    avg_resolution_time_days?: number;
    reputation_score?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  }, []);

  // Calculate stats from all reports
  const calculateStats = useCallback((reportsList: Report[]): DashboardStats => {
    const total = reportsList.length;
    const active = reportsList.filter(r =>
      ACTIVE_STATUSES.includes(r.status.toLowerCase())
    ).length;
    const resolved = reportsList.filter(r => r.status.toLowerCase() === 'resolved').length;
    const closed = reportsList.filter(r => r.status.toLowerCase() === 'closed').length;

    return { total, active, resolved, closed };
  }, []);

  // Helper to extract error message from various error formats
  const extractErrorMessage = useCallback((err: any): string => {
    // Handle Pydantic validation errors (array of errors)
    if (Array.isArray(err.response?.data?.detail)) {
      const firstError = err.response.data.detail[0];
      if (typeof firstError === 'object' && firstError.msg) {
        return firstError.msg || 'Validation error occurred';
      }
      return err.response.data.detail[0]?.msg || 'Validation error occurred';
    }

    // Handle single validation error object
    if (err.response?.data?.detail && typeof err.response.data.detail === 'object') {
      if (err.response.data.detail.msg) {
        return err.response.data.detail.msg;
      }
      if (err.response.data.detail.message) {
        return err.response.data.detail.message;
      }
      // If it's an object, stringify it for debugging but show a user-friendly message
      return 'An error occurred while loading data. Please try again.';
    }

    // Handle string error messages
    if (typeof err.response?.data?.detail === 'string') {
      return err.response.data.detail;
    }

    // Handle network errors
    if (!err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    // Handle error message
    if (typeof err.message === 'string') {
      return err.message;
    }

    // Fallback
    return 'Unable to load dashboard data. Please try again.';
  }, []);

  // Load dashboard data with pagination support
  const loadDashboardData = useCallback(async (showSuccessToast = false) => {
    try {
      setError(null);

      // Fetch reports and user stats in parallel
      const [allReportsData, userStatsData] = await Promise.allSettled([
        reportsService.getMyReports({ limit: 100 }),
        userService.getMyStats().catch(() => null) // Don't fail if stats fail
      ]);

      // Handle reports
      if (allReportsData.status === 'fulfilled') {
        const fetchedReports = allReportsData.value.reports || [];
        setAllReports(fetchedReports);

        // Calculate stats from fetched reports
        const calculatedStats = calculateStats(fetchedReports);
        setStats(calculatedStats);

        // Show only recent 5 reports for dashboard
        setReports(fetchedReports.slice(0, 5));
      } else {
        throw allReportsData.reason;
      }

      // Handle user stats (optional - don't fail if unavailable)
      if (userStatsData.status === 'fulfilled' && userStatsData.value) {
        setUserStats(userStatsData.value);
      }

      if (showSuccessToast) {
        showToast.success("Dashboard Updated", {
          description: "Your dashboard has been refreshed successfully."
        });
      }
    } catch (err: any) {
      logger.error('Failed to load dashboard data:', err);

      const errorMessage = extractErrorMessage(err);
      setError(errorMessage);

      if (showSuccessToast || !loading) {
        showToast.error("Unable to Load Dashboard", {
          description: errorMessage
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [calculateStats, loading, extractErrorMessage]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Initial load
  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    }
  }, [authLoading, user, loadDashboardData]);

  // Memoized recent reports
  const recentReports = useMemo(() => reports.slice(0, 5), [reports]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/citizen/login');
    }
  }, [authLoading, user, navigate]);

  // Loading state
  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-dvh bg-background">
        <CitizenHeader />
        <PageShell><PageSkeleton /></PageShell>
      </div>
    );
  }

  // Error state with retry
  if (error && !loading) {
    return (
      <div className="min-h-dvh bg-background">
        <CitizenHeader />
        <PageShell>
          <ErrorState
            title="Unable to load your dashboard"
            message={typeof error === 'string' ? error : 'An unexpected error occurred. Please try again.'}
            onRetry={() => loadDashboardData(true)}
            retrying={refreshing}
          />
        </PageShell>
      </div>
    );
  }

  const total = userStats?.total_reports || stats.total || 0;
  const active = userStats?.active_reports || userStats?.in_progress_reports || stats.active || 0;
  const resolved = userStats?.resolved_reports || stats.resolved || 0;
  const avgTime = userStats?.avg_resolution_time_days
    ? `${userStats.avg_resolution_time_days.toFixed(1)} days`
    : stats.resolved > 0 ? 'N/A' : '—';
  const reputation = userStats?.reputation_score ?? user?.reputation_score ?? 0;

  const summary = [
    { label: 'Submitted', value: total },
    { label: 'In progress', value: active },
    { label: 'Resolved', value: resolved },
    { label: 'Avg. time to resolve', value: avgTime },
  ];

  return (
    <div className="min-h-dvh bg-[#fbfcfd] relative text-slate-900">
      {/* Background radial dot grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.35] z-0"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        <CitizenHeader />

        <PageShell>
          <PageHeader
            title={`Welcome back, ${user?.full_name || 'Citizen'}`}
            description="Real-time municipal telemetry and status of your reported civic issues."
            actions={
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  loading={refreshing}
                  aria-label="Refresh dashboard"
                  className="rounded-full border-slate-200 bg-white/90 shadow-xs hover:bg-slate-100 text-slate-700"
                >
                  {!refreshing && <RefreshCw className="w-4 h-4" aria-hidden />}
                </Button>
                <Button
                  onClick={() => navigate('/citizen/submit-report')}
                  aria-label="Submit a new civic issue report"
                  className="bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold rounded-full px-5 h-10 shadow-xs transition-all active:scale-[0.98] gap-1.5"
                >
                  <Plus className="w-4 h-4" aria-hidden /> New report
                </Button>
              </div>
            }
          />

          {isOffline && (
            <div role="status" className="mb-6 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 font-medium">
              <AlertCircle aria-hidden className="size-4 shrink-0 text-amber-700" />
              You are offline. Cached local reports are displayed; submissions will sync upon reconnection.
            </div>
          )}

          {/* Stats Bar */}
          <div className="mb-10 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-2 sm:p-3 shadow-xs">
            <dl className="grid grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 sm:divide-y-0">
              {summary.map((s) => (
                <div key={s.label} className="p-4 sm:p-5">
                  <dd className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight tabular-nums">
                    {typeof s.value === "number" ? <CountUp to={s.value} /> : s.value}
                  </dd>
                  <dt className="mt-1 font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <Section
              title="Recent Issue Reports"
              description="Chronological log of submissions dispatched to municipal departments."
              className="mb-0"
              actions={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/citizen/reports')}
                  aria-label="View all reports"
                  className="rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" aria-hidden />
                </Button>
              }
            >
              {recentReports.length === 0 ? (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xs">
                  <EmptyState
                    icon={FileText}
                    title="No reports filed yet"
                    description="When you report a pothole, broken streetlight, or garbage dump, you can monitor its verified audit trail here."
                    action={
                      <Button
                        onClick={() => navigate('/citizen/submit-report')}
                        className="bg-[#0a2e2a] hover:bg-[#072421] text-white rounded-full font-semibold px-5 h-10 shadow-xs active:scale-[0.98] gap-1.5"
                      >
                        <Plus className="w-4 h-4" aria-hidden /> Submit first report
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
                  <ul className="divide-y divide-slate-100" aria-label="Recent reports">
                    {recentReports.map((report) => (
                      <li key={report.id}>
                        <Link
                          to={`/citizen/track/${report.id}`}
                          aria-label={`${report.title}, ${report.report_number}. Open report`}
                          className="group flex flex-col gap-2 p-5 sm:p-6 transition-all hover:bg-slate-50/80 focus-visible:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                        >
                          <div className="min-w-0">
                            <p className="font-display text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-950 transition-colors">
                              {report.title}
                            </p>
                            <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 font-mono">
                              <span className="font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                                #{report.report_number}
                              </span>
                              {report.department && (
                                <span className="text-slate-600 font-sans font-medium">
                                  {report.department.name}
                                </span>
                              )}
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-400">Updated {formatDate(report.updated_at)}</span>
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
                            <SeverityBadge severity={report.severity} />
                            <StatusBadge status={report.status} />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>

            {/* Sidebar info */}
            <aside className="space-y-6" aria-label="Profile">
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700">Civic Score</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="font-display text-4xl sm:text-5xl font-black text-slate-950 tracking-tight tabular-nums" aria-label={`Reputation score: ${reputation}`}>
                  {reputation}
                </p>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  Earned points from verified reports and civic contributions that helped your ward.
                </p>

                {user?.profile_completion !== 'complete' && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-700">Profile incomplete</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2.5 w-full rounded-full border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-800"
                      onClick={() => navigate('/citizen/profile')}
                    >
                      Complete Profile
                    </Button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </PageShell>
      </div>
    </div>
  );
};

export default CitizenDashboard;
