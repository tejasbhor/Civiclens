import { useState, useEffect, useCallback, useMemo } from "react";
import { ListSkeleton, PageSkeleton } from "@/components/feedback/Skeletons";
import { CountUp } from "@/components/landing/CountUp";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle2, Clock, AlertCircle, TrendingUp, MapPin, ArrowRight, Loader2, 
  RefreshCw, Activity, Award, Target, FileText, Users, BarChart3, Zap,
  Shield, Calendar, Timer, AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { officerService, OfficerStats } from "@/services/officerService";
import { useToast } from "@/hooks/use-toast";
import { OfficerHeader } from "@/components/layout/OfficerHeader";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { logger } from "@/lib/logger";
import { Report } from "@/services/reportsService";
import { SpotlightCard } from "@/components/landing/SpotlightCard";

interface DashboardStats {
  totalTasks: number;
  activeTasks: number;
  completedToday: number;
  criticalTasks: number;
  resolvedThisMonth: number;
  avgResolutionTime: number;
}

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isOffline } = useAuth();
  const { isBackendReachable } = useConnectionStatus();
  const { toast } = useToast();

  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [tasks, setTasks] = useState<Report[]>([]);
  const [allTasks, setAllTasks] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const getStatusColor = useCallback((status: string): string => {
    const s = status.toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'bg-success';
    if (s === 'rejected') return 'bg-danger';
    if (['in_progress', 'acknowledged'].includes(s)) return 'bg-info';
    if (s === 'assigned_to_officer') return 'bg-warning';
    if (s === 'on_hold') return 'bg-muted-foreground';
    return 'bg-muted-foreground';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const s = status.toLowerCase();
    if (s === 'resolved' || s === 'closed') return CheckCircle2;
    if (s === 'rejected') return AlertCircle;
    if (s === 'on_hold') return Clock;
    return Activity;
  }, []);

  const getSeverityColor = useCallback((severity: string): string => {
    const s = severity?.toLowerCase();
    if (s === 'critical') return 'text-danger bg-danger/10 border-danger/30';
    if (s === 'high') return 'text-warning bg-warning/10 border-warning/30';
    if (s === 'medium') return 'text-warning bg-warning/10 border-warning/30';
    return 'text-info bg-info/10 border-info/30';
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
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
    return str?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
  }, []);

  // Map backend capacity_level to frontend values
  const getCapacityLevelDisplay = useCallback((level: string | undefined): string => {
    if (!level) return 'unknown';
    const l = level.toLowerCase();
    // Backend returns: "low", "medium", "high"
    // Frontend expects: "available", "moderate", "high", "overloaded"
    if (l === 'low') return 'available';
    if (l === 'medium') return 'moderate';
    if (l === 'high') return 'high';
    return l; // Return as-is if already mapped or unknown
  }, []);

  const capacityLevel = getCapacityLevelDisplay(stats?.capacity_level);

  // Calculate dashboard stats - use API stats as primary source, calculate from tasks as fallback
  const dashboardStats = useMemo((): DashboardStats => {
    // Use API stats if available (more accurate and officer-specific)
    const activeTasksFromAPI = stats?.active_reports || 0;
    const resolvedFromAPI = stats?.resolved_reports || 0; // This is ALL resolved, not just this month
    const avgResolutionFromAPI = stats?.avg_resolution_time_days || 0;
    
    // Calculate from tasks for real-time counts (officer-specific since allTasks is filtered)
    // Match backend active statuses: ASSIGNED_TO_OFFICER, ACKNOWLEDGED, IN_PROGRESS, PENDING_VERIFICATION
    const activeStatuses = [
      'assigned_to_officer', 
      'acknowledged', 
      'in_progress', 
      'on_hold',
      'pending_verification' // Include this as backend considers it active
    ];
    const activeTasksFromData = allTasks.filter(t => 
      t.task && activeStatuses.includes(t.status?.toLowerCase() || '')
    ).length;
    
    // Calculate completed today from officer's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = allTasks.filter(t => {
      // Check if task is resolved/closed
      const isResolved = t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed';
      if (!isResolved) return false;
      
      // Use task resolved_at if available, otherwise use report updated_at
      const resolvedDate = t.task?.resolved_at 
        ? new Date(t.task.resolved_at)
        : t.updated_at 
        ? new Date(t.updated_at)
        : null;
      
      return resolvedDate && resolvedDate >= today;
    }).length;

    // Calculate critical tasks from officer's active tasks
    const criticalTasks = allTasks.filter(t => 
      t.severity?.toLowerCase() === 'critical' && 
      activeStatuses.includes(t.status?.toLowerCase() || '')
    ).length;

    // Calculate resolved this month from officer's tasks
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);
    const resolvedThisMonth = allTasks.filter(t => {
      const isResolved = t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed';
      if (!isResolved) return false;
      
      const resolvedDate = t.task?.resolved_at 
        ? new Date(t.task.resolved_at)
        : t.updated_at 
        ? new Date(t.updated_at)
        : null;
      
      return resolvedDate && resolvedDate >= thisMonthStart;
    }).length;

    return {
      totalTasks: allTasks.length, // Total tasks assigned to this officer
      // Use API stats if available, otherwise use calculated (both are officer-specific)
      activeTasks: activeTasksFromAPI > 0 ? activeTasksFromAPI : activeTasksFromData,
      completedToday, // Officer-specific: tasks completed today by this officer
      criticalTasks, // Officer-specific: critical tasks assigned to this officer
      resolvedThisMonth: resolvedThisMonth || resolvedFromAPI, // Officer-specific: resolved this month
      avgResolutionTime: avgResolutionFromAPI, // Officer-specific: from API
    };
  }, [allTasks, stats]);

  // Extract error message helper
  const extractErrorMessage = useCallback((error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.detail) {
      const detail = error.response.data.detail;
      if (Array.isArray(detail)) {
        return detail.map((d: any) => d.msg || d.message || JSON.stringify(d)).join(', ');
      }
      if (typeof detail === 'object') {
        return detail.msg || detail.message || JSON.stringify(detail);
      }
      return detail;
    }
    if (error?.message) return error.message;
    if (error?.isNetworkError || error?.code === 'ERR_NETWORK') {
      return 'Network error. Please check your connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  }, []);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);

      logger.debug(`Loading dashboard data for officer ${user.id}`);

      // Fetch officer stats and tasks in parallel
      const [statsData, tasksData] = await Promise.allSettled([
        officerService.getOfficerStats(user.id),
        officerService.getMyTasks({ limit: 100 })
      ]);

      // Handle stats
      if (statsData.status === 'fulfilled') {
        logger.debug('Officer stats loaded:', statsData.value);
        setStats(statsData.value);
      } else {
        logger.error('Failed to load officer stats:', statsData.reason);
        const errorMsg = extractErrorMessage(statsData.reason);
        setError(errorMsg);
        toast({
          title: "Failed to Load Statistics",
          description: errorMsg,
          variant: "destructive"
        });
      }

      // Handle tasks/reports
      if (tasksData.status === 'fulfilled') {
        const allTasks = Array.isArray(tasksData.value) ? tasksData.value : [];
        
        logger.debug(`Loaded ${allTasks.length} tasks for officer ${user.id}`);
        
        // Filter for reports assigned to current officer
        const myTasks = allTasks.filter((report: Report) => {
          const hasTask = report.task && report.task.assigned_to;
          const isAssignedToMe = report.task?.assigned_to === user.id;
          return hasTask && isAssignedToMe;
        });
        
        logger.debug(`Filtered to ${myTasks.length} tasks assigned to officer ${user.id}`);
        
        setAllTasks(myTasks);
        // Show most recent 5 tasks, sorted by created_at descending
        const sortedTasks = [...myTasks].sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        setTasks(sortedTasks.slice(0, 5));
      } else {
        logger.error('Failed to load tasks:', tasksData.reason);
        const errorMsg = extractErrorMessage(tasksData.reason);
        if (!error) {
          setError(errorMsg);
        }
        toast({
          title: "Failed to Load Tasks",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (err: any) {
      logger.error('Dashboard load error:', err);
      const errorMsg = extractErrorMessage(err);
      setError(errorMsg);
      toast({
        title: "Unable to Load Dashboard",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, extractErrorMessage, toast, error]);

  // Initial load
  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    }
  }, [user, authLoading, loadDashboardData]);

  // Redirect if not authenticated or not an officer
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/officer/login', { replace: true });
    } else if (!authLoading && user && user.role === 'citizen') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the officer portal.",
        variant: "destructive"
      });
      navigate('/', { replace: true });
    }
  }, [authLoading, user, navigate, toast]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Dashboard data updated successfully."
    });
  }, [loadDashboardData, toast]);

  // Loading state
  if (authLoading || (loading && !stats && !error)) {
    return (
      <div className="min-h-dvh bg-background">
        <OfficerHeader />
        <PageShell><PageSkeleton /></PageShell>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="min-h-dvh bg-background">
        <OfficerHeader onRefresh={handleRefresh} refreshing={refreshing} />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
          <Button onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/officer/tasks')}>
                View Tasks
          </Button>
            </div>
        </Card>
        </div>
      </div>
    );
  }

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
        <OfficerHeader onRefresh={handleRefresh} refreshing={refreshing} />

        {/* Connection Status Banner */}
        {isOffline || !isBackendReachable ? (
          <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2.5">
            <div className="container mx-auto flex items-center gap-2 text-xs font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>You're currently offline. Viewing cached operational tasks.</span>
            </div>
          </div>
        ) : null}

        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
          {/* Welcome Section */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shadow-xs shrink-0">
                <Shield className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                    FIELD DISPATCH
                  </span>
                  {stats?.employee_id && (
                    <span className="font-mono text-xs text-slate-400">
                      ID: #{stats.employee_id}
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  Welcome back, {stats?.full_name || user?.full_name || 'Officer'}
                </h2>
                {stats?.department_name && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {stats.department_name}
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={() => navigate('/officer/tasks')}
              className="bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold rounded-full px-6 h-11 shadow-xs transition-all active:scale-[0.98] gap-1.5 self-start md:self-auto"
            >
              <Target className="w-4 h-4 mr-1" />
              View Assigned Queue
            </Button>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="bg-amber-50 text-amber-800 border border-amber-200/60 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-slate-950 mb-1 tabular-nums tracking-tight">
                <CountUp to={Number(stats?.active_reports ?? dashboardStats.activeTasks) || 0} />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Active Tasks</div>
              <div className="mt-3 text-xs font-mono text-slate-500">
                {stats?.in_progress_reports || 0} in progress • {dashboardStats.totalTasks} total
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Today
                </span>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-slate-950 mb-1 tabular-nums tracking-tight">
                <CountUp to={Number(dashboardStats.completedToday) || 0} />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Completed Today</div>
              <div className="mt-3 text-xs font-mono text-slate-500">
                {dashboardStats.resolvedThisMonth} resolved this month
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="bg-rose-50 text-rose-800 border border-rose-200/60 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Urgent
                </span>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-rose-600 mb-1 tabular-nums tracking-tight">
                <CountUp to={Number(dashboardStats.criticalTasks) || 0} />
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Critical Issues</div>
              <div className="mt-3 text-xs font-mono text-slate-500">
                Requires priority field response
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 shadow-xs">
                  <Timer className="w-5 h-5" />
                </div>
                <span className="bg-teal-50 text-teal-800 border border-teal-200/60 font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Avg SLA
                </span>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-slate-950 mb-1 tabular-nums tracking-tight">
                {stats?.avg_resolution_time_days && stats.avg_resolution_time_days > 0
                  ? `${stats.avg_resolution_time_days.toFixed(1)}d`
                  : '—'}
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Resolution Pace</div>
              <div className="mt-3 text-xs font-mono text-slate-500">
                {stats?.avg_resolution_time_days && stats.avg_resolution_time_days > 0 
                  ? 'Days per incident closure' 
                  : 'Awaiting closed cases'}
              </div>
            </div>
          </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Tasks */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-display text-xl font-bold tracking-tight text-slate-950">Active Field Queue</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Your assigned civic reports requiring acknowledgment, work progress, or resolution evidence.
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50 hover:text-emerald-900 gap-1"
                  onClick={() => navigate('/officer/tasks')}
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

              {loading && tasks.length === 0 ? (
                <div role="status" aria-label="Loading tasks">
                  <ListSkeleton rows={3} />
                </div>
              ) : tasks.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-14 h-14 mx-auto mb-3 text-slate-300" />
                  <h4 className="font-display text-lg font-bold text-slate-950 mb-1">No Active Tasks</h4>
                  <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                    You do not have any pending tasks right now. Newly assigned reports will appear in this queue.
                  </p>
                  <Button
                    onClick={() => navigate('/officer/tasks')}
                    className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white text-xs font-semibold px-5 h-9"
                  >
                    Check All Tasks
                  </Button>
                </div>
              ) : (
                <div className="space-y-4" role="list" aria-label="Recent tasks">
                  {tasks.map((task) => {
                    const StatusIcon = getStatusIcon(task.status || '');
                    const taskStatus = task.status?.toLowerCase() || '';
                    const canAcknowledge = taskStatus === 'assigned_to_officer';
                    const canStartWork = taskStatus === 'acknowledged';
                    const canComplete = taskStatus === 'in_progress';

                    return (
                      <div 
                        key={task.id} 
                        className="p-5 border border-slate-200/90 rounded-2xl hover:border-emerald-500/40 hover:shadow-xs transition-all cursor-pointer bg-white"
                        onClick={() => navigate(`/officer/task/${task.id}`)}
                        role="listitem"
                        tabIndex={0}
                        aria-label={`Task ${task.report_number}: ${task.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigate(`/officer/task/${task.id}`);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                                #{task.report_number}
                              </span>
                              <span className={`font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${getStatusColor(task.status || '')} text-white flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {toLabel(task.status || '')}
                              </span>
                              {task.severity && (
                                <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200/70">
                                  {toLabel(task.severity)}
                                </span>
                              )}
                            </div>
                            <h4 className="font-display text-base font-bold text-slate-950 mb-1 line-clamp-1">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                              {task.address && (
                                <div className="flex items-center gap-1 text-slate-600">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                                  <span className="truncate max-w-[200px]">{task.address}</span>
                                </div>
                              )}
                              {task.created_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{formatDate(task.created_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 rounded-full border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/officer/task/${task.id}`);
                            }}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1" />
                            Inspect Details
                          </Button>
                          {canAcknowledge && (
                            <Button 
                              size="sm" 
                              className="flex-1 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white text-xs font-semibold h-8 shadow-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/officer/task/${task.id}/acknowledge`);
                              }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Acknowledge
                            </Button>
                          )}
                          {canStartWork && (
                            <Button 
                              size="sm" 
                              className="flex-1 rounded-full bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold h-8 shadow-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/officer/task/${task.id}/start`);
                              }}
                            >
                              <Zap className="w-3.5 h-3.5 mr-1" />
                              Start Work
                            </Button>
                          )}
                          {canComplete && (
                            <Button 
                              size="sm" 
                              className="flex-1 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-8 shadow-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/officer/task/${task.id}/complete`);
                              }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Complete Resolution
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Metrics Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <h3 className="font-display text-base font-bold tracking-tight text-slate-950">Field Capacity & Metrics</h3>
              </div>
              
              <div className="space-y-5">
                {/* Workload Capacity */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-slate-700">Workload Capacity</span>
                    <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                      {toLabel(capacityLevel)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        capacityLevel === 'available' ? 'bg-emerald-600' :
                        capacityLevel === 'moderate' ? 'bg-teal-600' :
                        capacityLevel === 'high' ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`}
                      style={{ 
                        width: `${Math.min((stats?.workload_score || 0) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Workload Index: {(stats?.workload_score || 0).toFixed(2)}
                  </p>
                </div>

                {/* Metrics List */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Avg. Resolution Speed</span>
                    <span className="font-mono font-bold text-slate-950">
                      {stats?.avg_resolution_time_days && stats.avg_resolution_time_days > 0
                        ? `${stats.avg_resolution_time_days.toFixed(1)} days`
                        : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Active Field Tasks</span>
                    <span className="font-mono font-bold text-slate-950">
                      {stats?.active_reports || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total Verified Closures</span>
                    <span className="font-mono font-bold text-emerald-700">
                      {stats?.resolved_reports || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total Assigned Lifecycle</span>
                    <span className="font-mono font-bold text-slate-950">
                      {stats?.total_reports || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Zap className="w-4 h-4 text-emerald-700" />
                <h4 className="font-display text-base font-bold tracking-tight text-slate-950">Quick Operations</h4>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 h-10"
                  onClick={() => navigate('/officer/tasks')}
                >
                  <Target className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                  View All Field Tasks
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 h-10"
                  onClick={() => navigate('/officer/profile')}
                >
                  <Shield className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Officer Credentials & Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default OfficerDashboard;
