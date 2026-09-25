import { useState, useEffect, useCallback, useMemo } from "react";
import { CountUp } from "@/components/landing/CountUp";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Filter, ArrowUpDown, Clock, CheckCircle2, 
  AlertCircle, Loader2, RefreshCw, FileText, Users, Calendar,
  AlertTriangle, Zap, Target, Activity, TrendingUp, Eye, ArrowRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { officerService } from "@/services/officerService";
import { useToast } from "@/hooks/use-toast";
import { OfficerHeader } from "@/components/layout/OfficerHeader";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { logger } from "@/lib/logger";
import { Report } from "@/services/reportsService";

const Tasks = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isBackendReachable } = useConnectionStatus();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [tasks, setTasks] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions
  const getStatusColor = useCallback((status: string): string => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    if (s === 'rejected' || s === 'assignment_rejected') return 'bg-rose-50 text-rose-800 border-rose-200/60';
    if (s === 'in_progress') return 'bg-teal-50 text-teal-800 border-teal-200/60';
    if (s === 'acknowledged') return 'bg-blue-50 text-blue-800 border-blue-200/60';
    if (s === 'assigned_to_officer') return 'bg-amber-50 text-amber-800 border-amber-200/60';
    if (s === 'on_hold') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (s === 'pending_verification') return 'bg-indigo-50 text-indigo-800 border-indigo-200/60';
    if (s === 'reopened') return 'bg-amber-50 text-amber-800 border-amber-200/60';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'closed') return CheckCircle2;
    if (s === 'rejected') return AlertCircle;
    if (s === 'on_hold') return Clock;
    if (s === 'pending_verification') return Clock;
    return Activity;
  }, []);

  const getSeverityColor = useCallback((severity: string): string => {
    const s = severity?.toLowerCase();
    if (s === 'critical') return 'text-rose-700 bg-rose-50 border-rose-200/60';
    if (s === 'high') return 'text-amber-700 bg-amber-50 border-amber-200/60';
    if (s === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200/60';
    return 'text-teal-700 bg-teal-50 border-teal-200/60';
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

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);

      logger.debug(`Loading tasks for officer ${user.id}`);

      const response = await officerService.getMyTasks({ limit: 100 });
      
      // Filter for current officer's tasks
      const myTasks = response.filter((report: Report) => {
        return report.task && report.task.assigned_to === user.id;
      });
      
      logger.debug(`Loaded ${myTasks.length} tasks for officer ${user.id}`);
      
      setTasks(myTasks);
    } catch (err: any) {
      logger.error('Failed to load tasks:', err);
      const errorMsg = extractErrorMessage(err);
      setError(errorMsg);
      toast({
        title: "Failed to Load Tasks",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, extractErrorMessage, toast]);

  // Initial load
  useEffect(() => {
    if (user && !authLoading) {
      loadTasks();
    }
  }, [user, authLoading, loadTasks]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/officer/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleAcknowledge = useCallback(async (taskId: number) => {
    try {
      await officerService.acknowledgeTask(taskId);
      toast({ title: "Task acknowledged", description: "You can now start work on this task." });
      await loadTasks();
    } catch (error) {
      toast({ title: "Could not acknowledge task", description: extractErrorMessage(error), variant: "destructive" });
    }
  }, [loadTasks, extractErrorMessage, toast]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Tasks updated successfully."
    });
  }, [loadTasks, toast]);

  // Filter and sort tasks
  const getFilteredAndSortedTasks = useMemo(() => {
    let filtered = [...tasks];
    
    // Apply filter
    if (filter !== "all") {
      filtered = filtered.filter(task => {
        const status = task.status?.toLowerCase() || '';
        return status === filter || status.replace(/_/g, '_') === filter;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "created_at") {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA; // Newest first
      } else if (sortBy === "severity") {
        const severityOrder: Record<string, number> = { 
          critical: 0, 
          high: 1, 
          medium: 2, 
          low: 3 
        };
        const aSeverity = severityOrder[a.severity?.toLowerCase() || ''] ?? 999;
        const bSeverity = severityOrder[b.severity?.toLowerCase() || ''] ?? 999;
        return aSeverity - bSeverity;
      } else if (sortBy === "status") {
        const statusOrder: Record<string, number> = {
          'assigned_to_officer': 0,
          'acknowledged': 1,
          'in_progress': 2,
          'pending_verification': 3,
          'resolved': 4,
          'closed': 5
        };
        const aStatus = statusOrder[a.status?.toLowerCase() || ''] ?? 999;
        const bStatus = statusOrder[b.status?.toLowerCase() || ''] ?? 999;
        return aStatus - bStatus;
      }
      return 0;
    });

    return filtered;
  }, [tasks, filter, sortBy]);

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups: Record<string, Report[]> = {
      assigned_to_officer: [],
      acknowledged: [],
      in_progress: [],
      pending_verification: [],
      on_hold: [],
      assignment_rejected: [],
      reopened: [],
      resolved: [],
      closed: [],
      rejected: []
    };

    getFilteredAndSortedTasks.forEach(task => {
      const status = task.status?.toLowerCase() || '';
      if (groups[status]) {
        groups[status].push(task);
      } else {
        // Add to assigned if unknown status
        groups.assigned_to_officer.push(task);
      }
    });

    return groups;
  }, [getFilteredAndSortedTasks]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeStatuses = ['assigned_to_officer', 'acknowledged', 'in_progress', 'pending_verification', 'on_hold'];
    const activeTasks = tasks.filter(t => 
      activeStatuses.includes(t.status?.toLowerCase() || '')
    ).length;
    
    const criticalTasks = tasks.filter(t => 
      t.severity?.toLowerCase() === 'critical' && 
      activeStatuses.includes(t.status?.toLowerCase() || '')
    ).length;

    const resolvedTasks = tasks.filter(t => 
      t.status?.toLowerCase() === 'resolved' || t.status?.toLowerCase() === 'closed'
    ).length;

    return {
      total: tasks.length,
      active: activeTasks,
      critical: criticalTasks,
      resolved: resolvedTasks
    };
  }, [tasks]);

  const renderTaskCard = useCallback((task: Report) => {
    const StatusIcon = getStatusIcon(task.status || '');
    const taskStatus = task.status?.toLowerCase() || '';
    const canAcknowledge = taskStatus === 'assigned_to_officer';
    const canStartWork = taskStatus === 'acknowledged';
    const canComplete = taskStatus === 'in_progress';

    return (
      <div 
        key={task.id} 
        className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.99]"
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
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs tracking-tight bg-slate-50 text-slate-700 border-slate-200 rounded-full px-2.5 py-0.5 font-semibold">
                {task.report_number}
              </Badge>
              <Badge className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(task.status || '')}`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {toLabel(task.status || '')}
              </Badge>
              {task.severity && (
                <Badge 
                  variant="outline" 
                  className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full ${getSeverityColor(task.severity)}`}
                >
                  {toLabel(task.severity)}
                </Badge>
              )}
            </div>
            <h3 className="font-display font-bold text-slate-950 mb-2 line-clamp-2 text-lg sm:text-xl tracking-tight group-hover:text-emerald-950 transition-colors">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-500 mb-3.5 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
              {task.address && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                  <span className="truncate max-w-[240px]">{task.address}</span>
                </div>
              )}
              {task.department?.name && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{task.department.name}</span>
                </div>
              )}
              {task.created_at && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(task.created_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 active:scale-[0.97] transition-all text-xs font-semibold px-4"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/officer/task/${task.id}`);
            }}
            aria-label={`View details for task ${task.report_number}`}
          >
            <Eye className="w-3.5 h-3.5 mr-1.5" />
            View Details
          </Button>
          {canAcknowledge && (
            <Button 
              size="sm" 
              className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white active:scale-[0.97] transition-all text-xs font-semibold px-4 shadow-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleAcknowledge(task.id);
              }}
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Acknowledge
            </Button>
          )}
          {canStartWork && (
            <Button 
              size="sm" 
              className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white active:scale-[0.97] transition-all text-xs font-semibold px-4 shadow-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/officer/task/${task.id}/start`);
              }}
            >
              <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
              Start Work
            </Button>
          )}
          {canComplete && (
            <Button 
              size="sm" 
              className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white active:scale-[0.97] transition-all text-xs font-semibold px-4 shadow-xs"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/officer/task/${task.id}/complete`);
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Complete Work
            </Button>
          )}
        </div>
      </div>
    );
  }, [navigate, handleAcknowledge, getStatusColor, getStatusIcon, getSeverityColor, toLabel, formatDate]);

  // Loading state
  if (authLoading || (loading && tasks.length === 0 && !error)) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#fbfcfd]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-emerald-800" />
          <p className="font-mono text-sm text-slate-500">Loading your task queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]">
      <OfficerHeader onRefresh={handleRefresh} refreshing={refreshing} />

      {/* Connection Status Banner */}
      {!isBackendReachable && (
        <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2.5">
          <div className="container mx-auto flex items-center gap-2 text-xs font-mono text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Telemetry Offline: Local changes queued. Connection with command dispatch will resume automatically.</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/officer/dashboard')}
              aria-label="Back to Dashboard"
              className="rounded-full w-10 h-10 border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.92] transition-transform shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mb-1">
                Assigned Tasks
              </h1>
              <p className="text-sm text-slate-500">
                Manage, acknowledge, and resolve your civic field operations queue
              </p>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Total</span>
                <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-slate-950 tabular-nums tracking-tight">
                <CountUp to={stats.total} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Active</span>
                <div className="w-9 h-9 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-slate-950 tabular-nums tracking-tight">
                <CountUp to={stats.active} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Critical</span>
                <div className="w-9 h-9 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-rose-600 tabular-nums tracking-tight">
                <CountUp to={stats.critical} />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-medium">Resolved</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="font-display text-3xl sm:text-4xl font-black text-emerald-700 tabular-nums tracking-tight">
                <CountUp to={stats.resolved} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-semibold uppercase">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status Filter:</span>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] rounded-xl border-slate-200 bg-slate-50 text-xs font-medium">
                <SelectValue placeholder="All Tasks" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="assigned_to_officer">Assigned</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="assignment_rejected">Assignment Rejected</SelectItem>
                <SelectItem value="reopened">Reopened</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 font-semibold uppercase">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Order:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[170px] rounded-xl border-slate-200 bg-slate-50 text-xs font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200">
                <SelectItem value="created_at">Newest First</SelectItem>
                <SelectItem value="severity">Priority Severity</SelectItem>
                <SelectItem value="status">Status Stage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-3xl border border-rose-200/80 bg-rose-50/50 p-6 sm:p-7 shadow-xs mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 flex-shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-slate-950 mb-0.5">Error Loading Tasks</h3>
                <p className="text-sm text-slate-600 font-sans">{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadTasks}
                className="rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-4 active:scale-[0.97]"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Tasks List */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-14 text-center shadow-xs">
            <Loader2 className="w-10 h-10 mx-auto mb-4 text-emerald-800 animate-spin" />
            <p className="font-mono text-sm text-slate-500">Retrieving assigned operations...</p>
          </div>
        ) : getFilteredAndSortedTasks.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-12 sm:p-16 text-center shadow-xs max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-5 text-slate-400">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-950 mb-2">No Tasks Found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              {filter !== "all" 
                ? "No tasks match your current filter. Clear or switch filters to view all assigned items." 
                : "You don't have any field tasks assigned right now. When dispatch allocates tickets to your beat, they will appear here instantly."}
            </p>
            {filter !== "all" && (
              <Button 
                variant="outline" 
                onClick={() => setFilter("all")}
                className="rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 active:scale-[0.97]"
              >
                Show All Tasks
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {/* Assigned Tasks Section */}
            {groupedTasks.assigned_to_officer.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">Newly Assigned</h2>
                    <p className="text-xs font-mono text-slate-500">
                      {groupedTasks.assigned_to_officer.length} task{groupedTasks.assigned_to_officer.length !== 1 ? 's' : ''} require immediate triage & acknowledgement
                    </p>
                  </div>
                </div>
                <div className="space-y-4" role="list" aria-label="Assigned tasks">
                  {groupedTasks.assigned_to_officer.map(renderTaskCard)}
                </div>
              </div>
            )}

            {/* Acknowledged Tasks Section */}
            {groupedTasks.acknowledged.length > 0 && (
              <>
                {groupedTasks.assigned_to_officer.length > 0 && <Separator className="my-8 bg-slate-200/80" />}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">Acknowledged Operations</h2>
                      <p className="text-xs font-mono text-slate-500">
                        {groupedTasks.acknowledged.length} task{groupedTasks.acknowledged.length !== 1 ? 's' : ''} queued and ready for site mobilization
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4" role="list" aria-label="Acknowledged tasks">
                    {groupedTasks.acknowledged.map(renderTaskCard)}
                  </div>
                </div>
              </>
            )}

            {/* In Progress Tasks Section */}
            {groupedTasks.in_progress.length > 0 && (
              <>
                {(groupedTasks.assigned_to_officer.length > 0 || groupedTasks.acknowledged.length > 0) && <Separator className="my-8 bg-slate-200/80" />}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">Active In Progress</h2>
                      <p className="text-xs font-mono text-slate-500">
                        {groupedTasks.in_progress.length} task{groupedTasks.in_progress.length !== 1 ? 's' : ''} actively being worked on in the field
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4" role="list" aria-label="In progress tasks">
                    {groupedTasks.in_progress.map(renderTaskCard)}
                  </div>
                </div>
              </>
            )}

            {/* Pending Verification Section */}
            {groupedTasks.pending_verification.length > 0 && (
              <>
                {(groupedTasks.assigned_to_officer.length > 0 || groupedTasks.acknowledged.length > 0 || groupedTasks.in_progress.length > 0) && <Separator className="my-8 bg-slate-200/80" />}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">Pending Admin Verification</h2>
                      <p className="text-xs font-mono text-slate-500">
                        {groupedTasks.pending_verification.length} task{groupedTasks.pending_verification.length !== 1 ? 's' : ''} submitted with proof of work
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4" role="list" aria-label="Pending verification tasks">
                    {groupedTasks.pending_verification.map(renderTaskCard)}
                  </div>
                </div>
              </>
            )}

            {/* On Hold Section */}
            {groupedTasks.on_hold.length > 0 && (
              <>
                {(groupedTasks.assigned_to_officer.length > 0 || groupedTasks.acknowledged.length > 0 || groupedTasks.in_progress.length > 0 || groupedTasks.pending_verification.length > 0) && <Separator className="my-8 bg-slate-200/80" />}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">On Hold</h2>
                      <p className="text-xs font-mono text-slate-500">
                        {groupedTasks.on_hold.length} task{groupedTasks.on_hold.length !== 1 ? 's' : ''} temporarily paused due to external dependencies
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4" role="list" aria-label="On hold tasks">
                    {groupedTasks.on_hold.map(renderTaskCard)}
                  </div>
                </div>
              </>
            )}

            {/* Assignment Rejected Section */}
            {groupedTasks.assignment_rejected.length > 0 && (
              <>
                {(groupedTasks.assigned_to_officer.length > 0 || groupedTasks.acknowledged.length > 0 || groupedTasks.in_progress.length > 0 || groupedTasks.pending_verification.length > 0 || groupedTasks.on_hold.length > 0) && <Separator className="my-8 bg-slate-200/80" />}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-700">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">Assignment Rejected</h2>
                      <p className="text-xs font-mono text-slate-500">
                        {groupedTasks.assignment_rejected.length} task{groupedTasks.assignment_rejected.length !== 1 ? 's' : ''} returned to central dispatch
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4" role="list" aria-label="Assignment rejected tasks">
                    {groupedTasks.assignment_rejected.map(renderTaskCard)}
                  </div>
                </div>
              </>
            )}

            {/* Reopened Section */}
            {groupedTasks.reopened.length > 0 && (
              <>
                {(groupedTasks.assigned_to_officer.length > 0 || groupedTasks.acknowledged.length > 0 || groupedTasks.in_progress.length > 0 || groupedTasks.pending_verification.length > 0 || groupedTasks.on_hold.length > 0 || groupedTasks.assignment_rejected.length > 0) && <Separator className="my-8 bg-slate-200/80" />}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">Reopened Workorders</h2>
                      <p className="text-xs font-mono text-slate-500">
                        {groupedTasks.reopened.length} task{groupedTasks.reopened.length !== 1 ? 's' : ''} flagged for re-inspection after appeal
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4" role="list" aria-label="Reopened tasks">
                    {groupedTasks.reopened.map(renderTaskCard)}
                  </div>
                </div>
              </>
            )}

            {/* Completed Section */}
            {(groupedTasks.resolved.length > 0 || groupedTasks.closed.length > 0) && (
              <>
                {(groupedTasks.assigned_to_officer.length > 0 || groupedTasks.acknowledged.length > 0 || groupedTasks.in_progress.length > 0 || groupedTasks.pending_verification.length > 0 || groupedTasks.on_hold.length > 0 || groupedTasks.assignment_rejected.length > 0 || groupedTasks.reopened.length > 0) && <Separator className="my-8 bg-slate-200/80" />}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl font-bold text-slate-950 tracking-tight">Resolved & Closed</h2>
                      <p className="text-xs font-mono text-slate-500">
                        {groupedTasks.resolved.length + groupedTasks.closed.length} task{groupedTasks.resolved.length + groupedTasks.closed.length !== 1 ? 's' : ''} successfully completed
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4" role="list" aria-label="Completed tasks">
                    {[...groupedTasks.resolved, ...groupedTasks.closed].map(renderTaskCard)}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
