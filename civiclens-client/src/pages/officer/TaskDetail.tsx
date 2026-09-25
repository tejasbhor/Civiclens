import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { officerService } from "@/services/officerService";
import { OfficerHeader } from "@/components/layout/OfficerHeader";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { logger } from "@/lib/logger";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Navigation,
  Image as ImageIcon,
  FileText,
  Star,
  XCircle,
  Pause,
  Play,
  RefreshCw,
  Zap,
  AlertTriangle,
  Users,
  Building2,
  Tag,
  MessageSquare,
  ExternalLink,
  Copy,
  Award,
  TrendingUp
} from "lucide-react";
import { RejectAssignmentModal } from "@/components/officer/RejectAssignmentModal";
import { PutOnHoldModal } from "@/components/officer/PutOnHoldModal";
import { ResumeWorkModal } from "@/components/officer/ResumeWorkModal";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaViewer, MediaItem } from "@/components/media/MediaViewer";
import { getMediaUrl } from "@/lib/mediaUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isBackendReachable } = useConnectionStatus();
  const { toast } = useToast();

  const [task, setTask] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateText, setUpdateText] = useState("");
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  // Helper functions
  const getStatusColor = useCallback((status: string): string => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'closed') return 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    if (s === 'rejected' || s === 'assignment_rejected') return 'bg-rose-50 text-rose-800 border-rose-200/60';
    if (s === 'in_progress') return 'bg-teal-50 text-teal-800 border-teal-200/60';
    if (s === 'acknowledged') return 'bg-blue-50 text-blue-800 border-blue-200/60';
    if (s === 'assigned_to_officer') return 'bg-amber-50 text-amber-800 border-amber-200/60';
    if (s === 'pending_verification') return 'bg-indigo-50 text-indigo-800 border-indigo-200/60';
    if (s === 'on_hold') return 'bg-slate-100 text-slate-700 border-slate-200';
    if (s === 'reopened') return 'bg-amber-50 text-amber-800 border-amber-200/60';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const s = status?.toLowerCase();
    if (s === 'resolved' || s === 'closed') return CheckCircle2;
    if (s === 'rejected' || s === 'assignment_rejected') return XCircle;
    if (s === 'on_hold') return Pause;
    if (s === 'pending_verification') return Clock;
    return Clock;
  }, []);

  const getSeverityColor = useCallback((severity: string): string => {
    const s = severity?.toLowerCase();
    if (s === 'critical') return 'text-rose-700 bg-rose-50 border-rose-200/60';
    if (s === 'high') return 'text-amber-700 bg-amber-50 border-amber-200/60';
    if (s === 'medium') return 'text-amber-700 bg-amber-50 border-amber-200/60';
    return 'text-teal-700 bg-teal-50 border-teal-200/60';
  }, []);

  const toLabel = useCallback((str: string): string => {
    return str?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  const formatDateShort = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }, []);

  const getTimeAgo = useCallback((dateString: string): string => {
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
      return formatDateShort(dateString);
    } catch {
      return 'Invalid date';
    }
  }, [formatDateShort]);

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

  // Load task details
  const loadTaskDetails = useCallback(async () => {
    if (!id || !user) return;

    try {
      setError(null);
      setLoading(true);

      logger.debug(`Loading task details for report ID: ${id}`);

      // Fetch task details and history in parallel
      const [taskData, historyData] = await Promise.allSettled([
        officerService.getTaskDetails(parseInt(id)),
        officerService.getTaskHistory(parseInt(id))
      ]);

      // Handle task data
      if (taskData.status === 'fulfilled') {
        logger.debug('Task data loaded:', taskData.value);
        setTask(taskData.value);
      } else {
        logger.error('Failed to load task:', taskData.reason);
        const errorMsg = extractErrorMessage(taskData.reason);
        setError(errorMsg);
        toast({
          title: "Failed to Load Task",
          description: errorMsg,
          variant: "destructive"
        });
      }

      // Handle history data
      if (historyData.status === 'fulfilled') {
        logger.debug('History data loaded:', historyData.value);
        setHistory(historyData.value?.history || []);
      } else {
        logger.error('Failed to load history:', historyData.reason);
        // Don't show error toast for history, just log it
      }
    } catch (err: any) {
      logger.error('Task detail load error:', err);
      const errorMsg = extractErrorMessage(err);
      setError(errorMsg);
      toast({
        title: "Failed to Load Task Details",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [id, user, extractErrorMessage, toast]);

  // Initial load
  useEffect(() => {
    if (id && user && !authLoading) {
      loadTaskDetails();
    }
  }, [id, user, authLoading, loadTaskDetails]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/officer/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTaskDetails();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Task details updated successfully."
    });
  }, [loadTaskDetails, toast]);

  const handleAcknowledge = async () => {
    try {
      setActionLoading(true);
      await officerService.acknowledgeTask(parseInt(id!));
      toast({
        title: "Success",
        description: "Task acknowledged successfully"
      });
      await loadTaskDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      setActionLoading(true);
      await officerService.startWork(parseInt(id!));
      toast({
        title: "Success",
        description: "Work started successfully"
      });
      await loadTaskDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitForVerification = () => {
    navigate(`/officer/task/${id}/complete`);
  };

  const handleAddUpdate = () => {
    setShowUpdateModal(true);
  };

  const handleSubmitUpdate = async () => {
    if (!updateText.trim()) {
      toast({
        title: "Error",
        description: "Please enter an update message",
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(true);
      await officerService.addUpdate(parseInt(id!), updateText.trim());
      toast({
        title: "Success",
        description: "Progress update added successfully"
      });
      setShowUpdateModal(false);
      setUpdateText("");
      await loadTaskDetails();
    } catch (error: any) {
      toast({
        title: "Error",
        description: extractErrorMessage(error),
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectAssignment = () => {
    setShowRejectModal(true);
  };

  const handlePutOnHold = () => {
    setShowHoldModal(true);
  };

  const handleResumeWork = () => {
    setShowResumeModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard"
    });
  };

  // Calculate time metrics
  const timeMetrics = useMemo(() => {
    if (!task?.task) return null;

    const now = new Date();
    const assignedAt = task.task.assigned_at ? new Date(task.task.assigned_at) : null;
    const acknowledgedAt = task.task.acknowledged_at ? new Date(task.task.acknowledged_at) : null;
    const startedAt = task.task.started_at ? new Date(task.task.started_at) : null;
    const resolvedAt = task.task.resolved_at ? new Date(task.task.resolved_at) : null;

    let timeInCurrentStatus = 0;
    if (task.status === 'assigned_to_officer' && assignedAt) {
      timeInCurrentStatus = Math.floor((now.getTime() - assignedAt.getTime()) / 86400000);
    } else if (task.status === 'acknowledged' && acknowledgedAt) {
      timeInCurrentStatus = Math.floor((now.getTime() - acknowledgedAt.getTime()) / 86400000);
    } else if (task.status === 'in_progress' && startedAt) {
      timeInCurrentStatus = Math.floor((now.getTime() - startedAt.getTime()) / 86400000);
    }

    return {
      assignedAt,
      acknowledgedAt,
      startedAt,
      resolvedAt,
      timeInCurrentStatus
    };
  }, [task]);

  // Action permissions
  const canAcknowledge = task?.status === 'assigned_to_officer' && task?.task?.assigned_to === user?.id;
  const canStartWork = task?.status === 'acknowledged' && task?.task?.assigned_to === user?.id;
  const canComplete = task?.status === 'in_progress' && task?.task?.assigned_to === user?.id;
  const canReject = task?.status === 'assigned_to_officer' && task?.task?.assigned_to === user?.id;
  const isOnHold = task?.status === 'on_hold' && task?.task?.assigned_to === user?.id;
  const canAddUpdate = ['acknowledged', 'in_progress'].includes(task?.status?.toLowerCase() || '') && task?.task?.assigned_to === user?.id;

  // Loading state
  if (authLoading || (loading && !task && !error)) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#fbfcfd]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-emerald-800" />
          <p className="font-mono text-sm text-slate-500">Retrieving task record & field telemetry...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !task) {
    return (
      <div className="min-h-dvh bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]">
        <OfficerHeader />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="rounded-3xl border border-rose-200/80 bg-white p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-5 text-rose-700">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-950 mb-2">Unable to Load Task</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">{error}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button 
                onClick={loadTaskDetails}
                className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold px-5 active:scale-[0.98] shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/officer/tasks')}
                className="rounded-full border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-5 active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                Return to Task Queue
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-dvh bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]">
        <OfficerHeader />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-5 text-slate-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-950 mb-2">Task Not Found</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
              The task you are looking for does not exist in your assigned district beat or access credentials.
            </p>
            <Button 
              onClick={() => navigate('/officer/tasks')}
              className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold px-6 active:scale-[0.98] shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-2" />
              Return to Task Queue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(task.status || '');

  return (
    <div className="min-h-dvh bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]">
      <OfficerHeader onRefresh={handleRefresh} refreshing={refreshing} />

      {/* Connection Status Banner */}
      {!isBackendReachable && (
        <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2.5">
          <div className="container mx-auto flex items-center gap-2 text-xs font-mono text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Telemetry Offline: Local changes queued. Connection with dispatch will resume automatically.</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/officer/tasks')}
              aria-label="Back to Tasks"
              className="rounded-full w-10 h-10 border-slate-200 bg-white hover:bg-slate-50 active:scale-[0.92] transition-transform shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Task Details</h1>
                {task.report_number && (
                  <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border-slate-200">
                    {task.report_number}
                  </Badge>
                )}
                {task.id && !task.report_number && (
                  <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 border-slate-200">
                    ID: {task.id}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500">
                View telemetry details, location parameters, before/after evidence, and progress actions
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hold Information Banner */}
            {isOnHold && task.task?.hold_reason && (
              <div className="rounded-3xl border border-amber-200/80 bg-amber-50/60 p-6 shadow-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 flex-shrink-0">
                    <Pause className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-amber-900 mb-1 text-base">Task On Hold</h3>
                    <p className="text-sm text-amber-800 mb-2 leading-relaxed">{task.task.hold_reason}</p>
                    {task.task.estimated_resume_date && (
                      <p className="text-xs font-mono text-amber-700">
                        Estimated Resume Date: {formatDate(task.task.estimated_resume_date)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Task Overview Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Badge className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(task.status || '')}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {toLabel(task.status || '')}
                    </Badge>
                    {task.severity && (
                      <Badge variant="outline" className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getSeverityColor(task.severity)}`}>
                        {toLabel(task.severity)} Priority
                      </Badge>
                    )}
                    {task.task?.priority && (
                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        Priority Level: {task.task.priority}/10
                      </Badge>
                    )}
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-950 mb-3 tracking-tight">{task.title}</h2>
                  <p className="text-slate-600 leading-relaxed text-base">{task.description}</p>
                </div>
              </div>

              {/* Category and Department */}
              <div className="grid md:grid-cols-2 gap-4 pt-5 border-t border-slate-100">
                {task.category && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-mono">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Category:</span>
                    <span className="font-semibold text-slate-800">{toLabel(task.category)}</span>
                    {task.sub_category && (
                      <span className="text-slate-400">• {toLabel(task.sub_category)}</span>
                    )}
                  </div>
                )}
                {task.department && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 font-mono">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Dept:</span>
                    <span className="font-semibold text-slate-800">{task.department.name}</span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="grid md:grid-cols-2 gap-4 pt-5 border-t border-slate-100 mt-4">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Reported:</span>
                  <span className="font-semibold text-slate-700">{formatDate(task.created_at)}</span>
                </div>
                {timeMetrics?.assignedAt && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Assigned:</span>
                    <span className="font-semibold text-slate-700">{getTimeAgo(timeMetrics.assignedAt.toISOString())}</span>
                  </div>
                )}
                {timeMetrics?.acknowledgedAt && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-400">Acknowledged:</span>
                    <span className="font-semibold text-slate-700">{getTimeAgo(timeMetrics.acknowledgedAt.toISOString())}</span>
                  </div>
                )}
                {timeMetrics?.startedAt && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Zap className="w-4 h-4 text-teal-600" />
                    <span className="text-slate-400">Started:</span>
                    <span className="font-semibold text-slate-700">{getTimeAgo(timeMetrics.startedAt.toISOString())}</span>
                  </div>
                )}
                {timeMetrics?.resolvedAt && (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-400">Resolved:</span>
                    <span className="font-semibold">{getTimeAgo(timeMetrics.resolvedAt.toISOString())}</span>
                  </div>
                )}
                {timeMetrics && timeMetrics.timeInCurrentStatus > 0 && (
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-400">Duration in Status:</span>
                    <span className="font-semibold text-slate-700">{timeMetrics.timeInCurrentStatus} day{timeMetrics.timeInCurrentStatus !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-800">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-950">Location Telemetry</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(`${task.latitude}, ${task.longitude}`)}
                  className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono px-3"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy Coords
                </Button>
              </div>
              <div className="space-y-4">
                {task.address && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">Site Address</p>
                    <p className="font-medium text-slate-900">{task.address}</p>
                  </div>
                )}
                {task.landmark && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">Landmark</p>
                    <p className="text-sm font-medium text-slate-700">{task.landmark}</p>
                  </div>
                )}
                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">GPS Coordinates</p>
                    <p className="font-mono text-xs text-slate-700 font-semibold bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl inline-block">
                      {task.latitude?.toFixed(6)}, {task.longitude?.toFixed(6)}
                    </p>
                  </div>
                  {(task.ward_number || task.district) && (
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">Beat / Jurisdiction</p>
                      <p className="text-sm font-medium text-slate-700">
                        {task.ward_number && `Ward ${task.ward_number}`}
                        {task.ward_number && task.district && ' • '}
                        {task.district}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold mt-2 h-11 active:scale-[0.98] transition-all"
                  onClick={() => {
                    window.open(`https://www.google.com/maps?q=${task.latitude},${task.longitude}`, '_blank');
                  }}
                >
                  <Navigation className="w-4 h-4 mr-2 text-emerald-700" />
                  Open Navigation Route in Google Maps
                  <ExternalLink className="w-3.5 h-3.5 ml-2 text-slate-400" />
                </Button>
              </div>
            </div>

            {/* Task Notes */}
            {task.task?.notes && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <h3 className="font-display text-lg font-bold text-slate-950 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-800" />
                  Task Field Notes
                </h3>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{task.task.notes}</p>
                </div>
              </div>
            )}

            {/* Media Gallery */}
            {task.media && task.media.length > 0 && (() => {
              // Separate media by source
              const citizenPhotos = task.media.filter((m: any) =>
                !m.upload_source || m.upload_source === 'citizen_submission'
              );
              const officerBeforePhotos = task.media.filter((m: any) =>
                m.upload_source === 'officer_before_photo'
              );
              const officerAfterPhotos = task.media.filter((m: any) =>
                m.upload_source === 'officer_after_photo'
              );



              const allMedia: MediaItem[] = task.media.map((m: any) => ({
                id: m.id,
                file_url: m.file_url || m.url,
                file_type: m.file_type,
                upload_source: m.upload_source,
                caption: m.caption,
                is_proof_of_work: m.is_proof_of_work,
                uploaded_at: m.uploaded_at || m.created_at
              }));

              const handleMediaClick = (index: number) => {
                setSelectedMediaIndex(index);
                setMediaViewerOpen(true);
              };

              return (
                <>
                  {/* Citizen Photos */}
                  {citizenPhotos.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-800" />
                          Citizen Submission Photos ({citizenPhotos.length})
                        </h3>
                        <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border-blue-200/60">
                          Initial Report Evidence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {citizenPhotos.map((media: any, index: number) => {
                          const mediaIndex = task.media.findIndex((m: any) => m.id === media.id);
                          const mediaUrl = getMediaUrl(media.file_url || media.url);

                          return (
                            <div
                              key={media.id}
                              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity group border border-slate-200 shadow-xs"
                              onClick={() => handleMediaClick(mediaIndex)}
                              role="button"
                              tabIndex={0}
                              aria-label={`View citizen photo ${index + 1}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleMediaClick(mediaIndex);
                                }
                              }}
                            >
                              <img
                                src={mediaUrl}
                                alt={`Citizen photo ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="absolute top-2 left-2">
                                <span className="bg-blue-600/90 backdrop-blur-sm text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">Citizen</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Officer Before Photos */}
                  {officerBeforePhotos.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-amber-700" />
                          Field Start Inspection Photos ({officerBeforePhotos.length})
                        </h3>
                        <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border-amber-200/60">
                          Pre-Work Telemetry
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {officerBeforePhotos.map((media: any, index: number) => {
                          const mediaIndex = task.media.findIndex((m: any) => m.id === media.id);
                          const mediaUrl = getMediaUrl(media.file_url || media.url);

                          return (
                            <div
                              key={media.id}
                              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity group border border-slate-200 shadow-xs"
                              onClick={() => handleMediaClick(mediaIndex)}
                              role="button"
                              tabIndex={0}
                              aria-label={`View before photo ${index + 1}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleMediaClick(mediaIndex);
                                }
                              }}
                            >
                              <img
                                src={mediaUrl}
                                alt={`Before photo ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="absolute top-2 left-2">
                                <span className="bg-amber-600/90 backdrop-blur-sm text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">Before</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Officer After Photos */}
                  {officerAfterPhotos.length > 0 && (
                    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-bold text-slate-950 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-emerald-700" />
                          Proof of Resolution Photos ({officerAfterPhotos.length})
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border-emerald-200/60">
                            Post-Work Complete
                          </Badge>
                          {officerAfterPhotos.some((m: any) => m.is_proof_of_work) && (
                            <span className="bg-emerald-700 text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Verified Proof
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {officerAfterPhotos.map((media: any, index: number) => {
                          const mediaIndex = task.media.findIndex((m: any) => m.id === media.id);
                          const mediaUrl = getMediaUrl(media.file_url || media.url);

                          return (
                            <div
                              key={media.id}
                              className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity group border border-slate-200 shadow-xs"
                              onClick={() => handleMediaClick(mediaIndex)}
                              role="button"
                              tabIndex={0}
                              aria-label={`View after photo ${index + 1}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  handleMediaClick(mediaIndex);
                                }
                              }}
                            >
                              <img
                                src={mediaUrl}
                                alt={`After photo ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="absolute top-2 left-2 flex flex-col gap-1">
                                <span className="bg-emerald-700/90 backdrop-blur-sm text-white font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full">After</span>
                                {media.is_proof_of_work && (
                                  <span className="bg-slate-900/90 backdrop-blur-sm text-white font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full">Proof</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Media Viewer */}
                  <MediaViewer
                    media={allMedia}
                    initialIndex={selectedMediaIndex}
                    isOpen={mediaViewerOpen}
                    onClose={() => setMediaViewerOpen(false)}
                  />
                </>
              );
            })()}

            {/* Status History */}
            {history.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <h3 className="font-display text-lg font-bold text-slate-950 mb-5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-800" />
                  Audit Trail & Status History
                </h3>
                <div className="space-y-4">
                  {history.map((item, index) => {
                    const ItemStatusIcon = getStatusIcon(item.new_status || '');
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === 0 ? 'bg-[#0a2e2a] text-white shadow-xs' : 'bg-slate-100 text-slate-500'}`}>
                            <ItemStatusIcon className="w-4 h-4" />
                          </div>
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-200 mt-2" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(item.new_status || '')}`}>
                              {toLabel(item.new_status || '')}
                            </Badge>
                            <span className="text-xs font-mono text-slate-400">
                              {formatDate(item.changed_at)}
                            </span>
                          </div>
                          {item.changed_by_user && (
                            <p className="text-xs text-slate-600 mb-1">
                              by <span className="font-semibold text-slate-800">{item.changed_by_user.full_name}</span>
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 font-mono">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
              <h3 className="font-display text-lg font-bold text-slate-950 mb-4">Operations Actions</h3>
              <div className="space-y-3">
                {canAcknowledge && (
                  <>
                    <Button
                      className="w-full rounded-full h-11 font-semibold bg-[#0a2e2a] hover:bg-[#072421] text-white shadow-xs active:scale-[0.98] transition-all text-sm"
                      onClick={handleAcknowledge}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                      )}
                      Acknowledge Workorder
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-11 font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200/80 active:scale-[0.98] transition-all text-sm"
                      onClick={handleRejectAssignment}
                      disabled={actionLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Assignment
                    </Button>
                  </>
                )}
                {canStartWork && (
                  <Button
                    className="w-full rounded-full h-11 font-semibold bg-[#0a2e2a] hover:bg-[#072421] text-white shadow-xs active:scale-[0.98] transition-all text-sm"
                    onClick={handleStartWork}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 mr-2 text-teal-400" />
                    )}
                    Deploy & Start Field Work
                  </Button>
                )}
                {canComplete && (
                  <>
                    {canAddUpdate && (
                      <Button
                        variant="outline"
                        className="w-full rounded-full h-11 font-semibold border-slate-200 hover:bg-slate-50 text-slate-700 active:scale-[0.98] transition-all text-sm"
                        onClick={handleAddUpdate}
                        disabled={actionLoading}
                      >
                        <MessageSquare className="w-4 h-4 mr-2 text-slate-500" />
                        Log Progress Note
                      </Button>
                    )}
                    <Button
                      className="w-full rounded-full h-11 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-[0.98] transition-all text-sm"
                      onClick={handleSubmitForVerification}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit for Verification
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full h-11 font-semibold text-amber-700 hover:text-amber-800 hover:bg-amber-50 border-amber-200/70 active:scale-[0.98] transition-all text-sm"
                      onClick={handlePutOnHold}
                      disabled={actionLoading}
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      Put On Hold
                    </Button>
                  </>
                )}
                {isOnHold && (
                  <Button
                    className="w-full rounded-full h-11 font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-[0.98] transition-all text-sm"
                    onClick={handleResumeWork}
                    disabled={actionLoading}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume Field Work
                  </Button>
                )}
                {!canAcknowledge && !canStartWork && !canComplete && !isOnHold && (
                  <div className="text-center py-4">
                    <p className="text-xs font-mono text-slate-500 mb-3">
                      No pending actions required for this ticket
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border-slate-200 bg-slate-50 hover:bg-white text-slate-700 font-semibold px-4 active:scale-[0.95] transition-all text-xs"
                      onClick={() => navigate('/officer/tasks')}
                    >
                      Return to Tasks Queue
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Citizen Information */}
            {task.user && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <h3 className="font-display text-base font-bold text-slate-950 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-800" />
                  Citizen Contact Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">Citizen Name</p>
                    <p className="font-medium text-slate-900">{task.user.full_name || 'Anonymous Resident'}</p>
                  </div>
                  {task.user.phone && (
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">Direct Contact</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start rounded-xl border-slate-200 font-mono text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => window.open(`tel:${task.user.phone}`)}
                      >
                        <Phone className="w-3.5 h-3.5 mr-2 text-emerald-700" />
                        {task.user.phone}
                      </Button>
                    </div>
                  )}
                  {task.user.reputation_score !== undefined && (
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium mb-1">Citizen Reliability</p>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span className="font-mono text-xs font-semibold text-slate-800">{task.user.reputation_score || 0} Civic Points</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Department Info */}
            {task.department && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <h3 className="font-display text-base font-bold text-slate-950 mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-800" />
                  Handling Department
                </h3>
                <p className="font-semibold text-slate-900 text-sm">{task.department.name}</p>
              </div>
            )}

            {/* Task Assignment Info */}
            {task.task && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <h3 className="font-display text-sm font-bold text-slate-950 mb-3 uppercase tracking-wider">Assignment Meta</h3>
                <div className="space-y-2.5 text-xs font-mono">
                  {task.task.assigned_at && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-400">Assigned:</span>
                      <span className="font-semibold text-slate-800">{getTimeAgo(task.task.assigned_at)}</span>
                    </div>
                  )}
                  {task.task.priority && (
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-400">Priority Score:</span>
                      <span className="font-semibold text-slate-800">{task.task.priority}/10</span>
                    </div>
                  )}
                  {task.task.officer && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Assigned Officer:</span>
                      <span className="font-semibold text-slate-800">{task.task.officer.full_name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <RejectAssignmentModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        reportId={parseInt(id!)}
        reportNumber={task?.report_number}
        onSuccess={() => {
          setShowRejectModal(false);
          loadTaskDetails();
        }}
      />

      <PutOnHoldModal
        isOpen={showHoldModal}
        onClose={() => setShowHoldModal(false)}
        reportId={parseInt(id!)}
        reportNumber={task?.report_number}
        onSuccess={() => {
          setShowHoldModal(false);
          loadTaskDetails();
        }}
      />

      <ResumeWorkModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        reportId={parseInt(id!)}
        reportNumber={task?.report_number}
        holdReason={task?.task?.hold_reason}
        onSuccess={() => {
          setShowResumeModal(false);
          loadTaskDetails();
        }}
      />

      {/* Add Update Dialog */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Progress Update</DialogTitle>
            <DialogDescription>
              Add a progress update to this task. This will be visible in the status history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="update-text">Update Message</Label>
              <Textarea
                id="update-text"
                placeholder="Enter your progress update..."
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUpdateModal(false);
              setUpdateText("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitUpdate} disabled={actionLoading || !updateText.trim()}>
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Submit Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetail;
