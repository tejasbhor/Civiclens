import { useState, useEffect, useCallback, useMemo } from "react";
import { ListSkeleton } from "@/components/feedback/Skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Search, FileText, Plus, RefreshCw, Users, Target, MapPin, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { reportsService, Report } from "@/services/reportsService";
import { showToast } from "@/lib/utils/toast";
import { CitizenHeader } from "@/components/layout/CitizenHeader";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { logger } from "@/lib/logger";

const Reports = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isOffline } = useAuth();
  const { isBackendReachable } = useConnectionStatus();

  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/citizen/login');
    }
  }, [authLoading, user, navigate]);

  // Load reports
  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  // Filter reports when search or tab changes
  useEffect(() => {
    filterReports();
  }, [reports, searchQuery, activeTab]);

  // Helper to extract error message
  const extractErrorMessage = useCallback((err: any): string => {
    if (Array.isArray(err.response?.data?.detail)) {
      const firstError = err.response.data.detail[0];
      if (typeof firstError === 'object' && firstError.msg) {
        return firstError.msg || 'Validation error occurred';
      }
      return err.response.data.detail[0]?.msg || 'Validation error occurred';
    }

    if (err.response?.data?.detail && typeof err.response.data.detail === 'object') {
      if (err.response.data.detail.msg) return err.response.data.detail.msg;
      if (err.response.data.detail.message) return err.response.data.detail.message;
      return 'An error occurred while loading reports. Please try again.';
    }

    if (typeof err.response?.data?.detail === 'string') {
      return err.response.data.detail;
    }

    if (!err.response && (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || err.message === 'Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }

    return err.message || 'Unable to load reports. Please try again.';
  }, []);

  const loadReports = useCallback(async (showSuccessToast = false) => {
    try {
      setError(null);
      setLoading(true);
      const data = await reportsService.getMyReports({ limit: 100 });
      setReports(data.reports);
      if (showSuccessToast) {
        showToast.success("Reports Updated", {
          description: "Your reports have been refreshed successfully."
        });
      }
    } catch (error: any) {
      logger.error('Failed to load reports:', error);
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage);
      showToast.error("Error", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [extractErrorMessage]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports(true);
  }, [loadReports]);

  const filterReports = useCallback(() => {
    let filtered = [...reports];

    // Filter by tab
    if (activeTab === "active") {
      filtered = filtered.filter(r =>
        ['received', 'pending_classification', 'classified', 'assigned_to_department',
          'assigned_to_officer', 'acknowledged', 'in_progress'].includes(r.status.toLowerCase())
      );
    } else if (activeTab === "resolved") {
      filtered = filtered.filter(r => r.status.toLowerCase() === 'resolved');
    } else if (activeTab === "closed") {
      filtered = filtered.filter(r => r.status.toLowerCase() === 'closed');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.report_number.toLowerCase().includes(query) ||
        (r.category && r.category.toLowerCase().includes(query)) ||
        (r.department?.name && r.department.name.toLowerCase().includes(query)) ||
        (r.task?.officer?.full_name && r.task.officer.full_name.toLowerCase().includes(query))
      );
    }

    setFilteredReports(filtered);
  }, [reports, searchQuery, activeTab]);

  const getStatusColor = useCallback((status: string): string => {
    const s = status.toLowerCase();
    if (s === 'resolved') return 'bg-success';
    if (s === 'closed') return 'bg-muted-foreground';
    if (s === 'rejected') return 'bg-danger';
    if (['in_progress', 'acknowledged'].includes(s)) return 'bg-info';
    return 'bg-warning';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const s = status.toLowerCase();
    if (s === 'resolved') return CheckCircle2;
    if (s === 'closed' || s === 'rejected') return XCircle;
    if (['in_progress', 'acknowledged'].includes(s)) return Clock;
    return AlertCircle;
  }, []);

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

  const toLabel = useCallback((str: string): string => {
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, []);

  const getTabCounts = useMemo(() => {
    const active = reports.filter(r =>
      ['received', 'pending_classification', 'classified', 'assigned_to_department',
        'assigned_to_officer', 'acknowledged', 'in_progress'].includes(r.status.toLowerCase())
    ).length;
    const resolved = reports.filter(r => r.status.toLowerCase() === 'resolved').length;
    const closed = reports.filter(r => r.status.toLowerCase() === 'closed').length;
    return { all: reports.length, active, resolved, closed };
  }, [reports]);

  const counts = getTabCounts;

  const ReportCard = ({ report }: { report: Report }) => {
    const StatusIcon = getStatusIcon(report.status);
    const statusColor = getStatusColor(report.status);

    return (
      <div
        className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => navigate(`/citizen/track/${report.id}`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/citizen/track/${report.id}`);
          }
        }}
        aria-label={`View report ${report.report_number}`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl ${statusColor} flex items-center justify-center flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
              aria-hidden="true"
            >
              <StatusIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  #{report.report_number}
                </span>
                {report.severity && (
                  <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/70">
                    {report.severity}
                  </span>
                )}
              </div>
              <h4 className="font-display text-lg font-bold text-slate-950 mb-1.5 line-clamp-2 group-hover:text-emerald-950 transition-colors">
                {report.title}
              </h4>
              {report.category && (
                <p className="text-xs font-medium text-slate-500 mb-3">{toLabel(report.category)}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                {report.task?.officer && (
                  <div className="flex items-center gap-1.5 text-slate-600 font-sans">
                    <Users className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{report.task.officer.full_name || 'Officer Assigned'}</span>
                  </div>
                )}
                {report.department && (
                  <div className="flex items-center gap-1.5 text-slate-600 font-sans">
                    <Target className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{report.department.name}</span>
                  </div>
                )}
                {report.landmark && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate max-w-[200px]">{report.landmark}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span>Updated {formatDate(report.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
          <span
            className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor} text-white shadow-xs shrink-0`}
            aria-label={`Status: ${toLabel(report.status)}`}
          >
            {toLabel(report.status)}
          </span>
        </div>
        <div className="flex gap-2 pt-4 border-t border-slate-100">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 rounded-full border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 h-9 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/citizen/track/${report.id}`);
            }}
            aria-label={`${report.status.toLowerCase() === "resolved" ? 'View details' : 'Track'} report ${report.report_number}`}
          >
            {report.status.toLowerCase() === "resolved" ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                View Verification Proof
              </>
            ) : (
              <>
                Track Live Progress <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

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

        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">
          {/* Header Section */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/citizen/dashboard')}
              className="mb-4 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 -ml-2 gap-1.5"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  All Submitted Reports
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Inspect real-time resolution pipelines, department assignments, and audit trails.
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh reports"
                className="rounded-full border-slate-200 bg-white/90 shadow-xs hover:bg-slate-100 text-slate-700 shrink-0 self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Offline indicator */}
            {isOffline && (
              <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs font-medium text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>You are currently offline. Viewing cached reports locally.</span>
              </div>
            )}
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by title, description, report number, department, or officer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-full border-slate-200/90 bg-white shadow-xs focus-visible:ring-emerald-500 text-sm"
                aria-label="Search reports"
              />
            </div>
            <Button
              onClick={() => navigate('/citizen/submit-report')}
              aria-label="Submit a new report"
              className="bg-[#0a2e2a] hover:bg-[#072421] text-white rounded-full font-semibold px-6 h-11 shadow-xs active:scale-[0.98] shrink-0 gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Report
            </Button>
          </div>

          {loading ? (
            <div role="status" aria-label="Loading your reports">
              <ListSkeleton rows={5} />
            </div>
          ) : error && !loading ? (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 text-center shadow-xs">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-slate-950 mb-2">Unable to Load Reports</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{error}</p>
              <Button
                onClick={() => loadReports(true)}
                disabled={refreshing}
                className="bg-[#0a2e2a] hover:bg-[#072421] text-white rounded-full font-semibold px-6 h-10 shadow-xs"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  'Try Again'
                )}
              </Button>
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-14 text-center shadow-xs">
              <FileText className="w-14 h-14 mx-auto mb-4 text-slate-300" />
              <h3 className="font-display text-xl font-bold text-slate-950 mb-2">No Reports Yet</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                You haven't submitted any civic reports yet. Help improve your neighbourhood by reporting an issue today.
              </p>
              <Button
                onClick={() => navigate('/citizen/submit-report')}
                aria-label="Submit your first report"
                className="bg-[#0a2e2a] hover:bg-[#072421] text-white rounded-full font-semibold px-6 h-10 shadow-xs active:scale-[0.98] gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Submit Your First Report
              </Button>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 flex h-auto w-full justify-start gap-1.5 overflow-x-auto bg-slate-100/80 p-1.5 rounded-full border border-slate-200/70">
                <TabsTrigger value="all" className="rounded-full text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="active" className="rounded-full text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs">Active ({counts.active})</TabsTrigger>
                <TabsTrigger value="resolved" className="rounded-full text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs">Resolved ({counts.resolved})</TabsTrigger>
                <TabsTrigger value="closed" className="rounded-full text-xs font-semibold px-4 py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-xs">Closed ({counts.closed})</TabsTrigger>
              </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredReports.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No reports match your search' : 'No reports found'}
                  </p>
                </Card>
              ) : (
                <div role="list" aria-label="All reports" className="t-stagger">
                  {filteredReports.map((report, i) => (
                    <div key={report.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}><ReportCard report={report} /></div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {filteredReports.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No active reports match your search' : 'No active reports'}
                  </p>
                </Card>
              ) : (
                <div role="list" aria-label="Active reports" className="t-stagger">
                  {filteredReports.map((report, i) => (
                    <div key={report.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}><ReportCard report={report} /></div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              {filteredReports.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No resolved reports match your search' : 'No resolved reports'}
                  </p>
                </Card>
              ) : (
                <div role="list" aria-label="Resolved reports" className="t-stagger">
                  {filteredReports.map((report, i) => (
                    <div key={report.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}><ReportCard report={report} /></div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="closed" className="space-y-4">
              {filteredReports.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No closed reports match your search' : 'No closed reports'}
                  </p>
                </Card>
              ) : (
                <div role="list" aria-label="Closed reports" className="t-stagger">
                  {filteredReports.map((report, i) => (
                    <div key={report.id} style={{ "--i": Math.min(i, 8) } as React.CSSProperties}><ReportCard report={report} /></div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
    </div>
  );
};

export default Reports;