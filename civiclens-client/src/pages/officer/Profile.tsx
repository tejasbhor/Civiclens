import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Mail, Phone, Shield, Calendar,
  LogOut, Loader2, AlertCircle, TrendingUp, CheckCircle2,
  RefreshCw, Activity, Timer, FileText, Users, BarChart3, Target,
  AlertTriangle, Edit, KeyRound, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { showToast } from "@/lib/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { officerService, OfficerStats } from "@/services/officerService";
import { userService } from "@/services/userService";
import { OfficerHeader } from "@/components/layout/OfficerHeader";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { logger } from "@/lib/logger";
import { CountUp } from "@/components/landing/CountUp";

const OfficerProfile = () => {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const { isBackendReachable } = useConnectionStatus();
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map backend capacity_level to frontend values
  const getCapacityLevelDisplay = useCallback((level: string | undefined): string => {
    if (!level) return 'unknown';
    const l = level.toLowerCase();
    if (l === 'low') return 'available';
    if (l === 'medium') return 'moderate';
    if (l === 'high') return 'high';
    return l;
  }, []);

  const capacityLevel = getCapacityLevelDisplay(stats?.capacity_level);

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

  const [verificationStatus, setVerificationStatus] = useState<{
    email: { value: string | null; verified: boolean; last_sent_at: string | null };
    phone: { value: string | null; verified: boolean; last_sent_at: string | null };
  } | null>(null);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [phoneOTP, setPhoneOTP] = useState("");

  const loadProfileData = useCallback(async () => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);

      logger.debug(`Loading profile data for officer ${user.id}`);

      // Fetch profile and stats in parallel
      const [profileData, statsData] = await Promise.allSettled([
        officerService.getCurrentOfficer(),
        officerService.getOfficerStats(user.id)
      ]);

      // Handle profile
      if (profileData.status === 'fulfilled') {
        logger.debug('Profile data loaded:', profileData.value);
        setProfile(profileData.value);
      } else {
        logger.error('Failed to load profile:', profileData.reason);
        setError(extractErrorMessage(profileData.reason));
      }

      // Handle stats
      if (statsData.status === 'fulfilled') {
        logger.debug('Stats data loaded:', statsData.value);
        setStats(statsData.value);
      } else {
        logger.error('Failed to load stats:', statsData.reason);
        if (!error) {
          setError(extractErrorMessage(statsData.reason));
        }
      }

      // Load verification status
      try {
        const vData = await userService.getVerificationStatus();
        setVerificationStatus(vData);
      } catch (vErr) {
        logger.error('Failed to load verification status:', vErr);
      }
    } catch (err: any) {
      logger.error('Profile load error:', err);
      const errorMsg = extractErrorMessage(err);
      setError(errorMsg);
      showToast.error("Failed to Load Profile", {
        description: errorMsg
      });
    } finally {
      setLoading(false);
    }
  }, [user, extractErrorMessage, error]);

  // Initial load
  useEffect(() => {
    if (user && !authLoading) {
      loadProfileData();
    }
  }, [user, authLoading, loadProfileData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/officer/login', { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
    showToast.success("Refreshed", {
      description: "Profile data updated successfully."
    });
  }, [loadProfileData]);

  const handleLogout = async () => {
    await logout();
    showToast.success("Logged Out", {
      description: "You have been logged out successfully",
    });
    navigate('/');
  };

  const handleSendPhoneVerification = async () => {
    try {
      setVerifyingPhone(true);
      const result = await userService.sendPhoneVerification();
      showToast.success("Verification OTP Sent", {
        description: "Please check your phone for the OTP."
      });
      if (result.debug_otp) {
        setPhoneOTP(result.debug_otp);
      }
      loadProfileData();
    } catch (error: any) {
      logger.error('Failed to send phone verification:', error);
      showToast.error("Failed to Send OTP", {
        description: extractErrorMessage(error)
      });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOTP) {
      showToast.error("OTP Required", { description: "Please enter the OTP." });
      return;
    }
    try {
      setVerifyingPhone(true);
      await userService.verifyPhone(phoneOTP);
      showToast.success("Phone Verified", {
        description: "Your phone number has been verified successfully."
      });
      setPhoneOTP("");
      loadProfileData();
    } catch (error: any) {
      logger.error('Failed to verify phone:', error);
      showToast.error("Verification Failed", {
        description: extractErrorMessage(error)
      });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const formatDate = useCallback((dateString: string): string => {
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

  const toLabel = useCallback((str: string): string => {
    return str?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
  }, []);

  // Loading state
  if (authLoading || (loading && !profile && !stats && !error)) {
    return (
      <div className="min-h-screen bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-[#0a2e2a]" />
          <p className="text-sm font-mono text-slate-500">Loading officer profile telemetry...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile && !stats) {
    return (
      <div className="min-h-screen bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px]">
        <OfficerHeader onRefresh={handleRefresh} refreshing={refreshing} />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xs">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-bold font-display text-slate-950 mb-2">Failed to Load Profile</h3>
            <p className="text-sm text-slate-500 mb-6 font-mono">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={loadProfileData}
                className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white px-6 font-semibold shadow-xs"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/officer/dashboard')}
                className="rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 px-6 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfcfd] bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:32px_32px] text-slate-900 selection:bg-emerald-100 selection:text-emerald-950 font-sans antialiased">
      <OfficerHeader onRefresh={handleRefresh} refreshing={refreshing} />

      {/* Connection Status Banner */}
      {!isBackendReachable && (
        <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5">
          <div className="container mx-auto flex items-center gap-2 text-xs font-mono text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Telemetry link offline. Local cached profile records active.</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/officer/dashboard')}
              aria-label="Back to Dashboard"
              className="rounded-full hover:bg-slate-200/60 text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-emerald-800 tracking-wider uppercase font-semibold">
                  Field Operations Personnel
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight">
                Officer Profile &amp; Telemetry
              </h1>
            </div>
          </div>
          <p className="text-slate-500 font-sans ml-12 text-sm sm:text-base">
            Verified municipal credentials, assignment metrics, and field performance audit history.
          </p>
        </div>

        {/* Profile Header Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center flex-shrink-0 text-emerald-800 shadow-xs">
              <Shield className="w-10 h-10 text-[#0a2e2a]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950 mb-2">
                {stats?.full_name || profile?.full_name || user?.full_name || 'Officer'}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {stats?.employee_id && (
                  <Badge variant="outline" className="font-mono text-xs rounded-full bg-slate-50 text-slate-700 border-slate-200/90 px-3 py-0.5">
                    Badge ID: {stats.employee_id}
                  </Badge>
                )}
                {stats?.department_name && (
                  <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200/60 font-sans text-xs rounded-full px-3 py-0.5">
                    <Users className="w-3 h-3 mr-1 text-emerald-700" />
                    {stats.department_name}
                  </Badge>
                )}
                {profile?.role && (
                  <Badge variant="outline" className="text-xs rounded-full border-slate-200 text-slate-600 px-3 py-0.5">
                    {toLabel(profile.role)}
                  </Badge>
                )}
                {profile?.phone_verified && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200/60 font-mono text-xs rounded-full px-3 py-0.5">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
                    Verified Personnel
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500">
                {profile?.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Commissioned {formatDate(profile.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Statistics */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-6">
                <BarChart3 className="w-5 h-5 text-emerald-800" />
                <h3 className="text-xl font-bold font-display tracking-tight text-slate-950">
                  Performance &amp; Resolution Statistics
                </h3>
              </div>
          
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="text-3xl font-black font-display text-slate-950 mb-1 tabular-nums">
                    <CountUp to={stats?.total_reports || 0} />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 font-sans">Total Handled</div>
                </div>
                <div className="text-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60">
                  <div className="text-3xl font-black font-display text-emerald-900 mb-1 tabular-nums">
                    <CountUp to={stats?.resolved_reports || 0} />
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 font-sans">Resolved</div>
                </div>
                <div className="text-center p-4 bg-blue-50/50 rounded-2xl border border-blue-200/60">
                  <div className="text-3xl font-black font-display text-blue-950 mb-1 tabular-nums">
                    <CountUp to={stats?.active_reports || 0} />
                  </div>
                  <div className="text-xs font-semibold text-blue-800 font-sans">Active</div>
                </div>
                <div className="text-center p-4 bg-amber-50/50 rounded-2xl border border-amber-200/60">
                  <div className="text-3xl font-black font-display text-amber-950 mb-1 tabular-nums">
                    <CountUp to={stats?.in_progress_reports || 0} />
                  </div>
                  <div className="text-xs font-semibold text-amber-800 font-sans">In Progress</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Avg. Resolution Turnaround</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-slate-900">
                    {stats?.avg_resolution_time_days && stats.avg_resolution_time_days > 0
                      ? `${stats.avg_resolution_time_days.toFixed(1)} days`
                      : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Workload Capacity Level</span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`font-mono text-xs rounded-full px-3 py-0.5 ${
                      capacityLevel === 'available' ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' :
                      capacityLevel === 'moderate' ? 'bg-blue-50 text-blue-800 border-blue-200/60' :
                      capacityLevel === 'high' ? 'bg-amber-50 text-amber-800 border-amber-200/60' :
                      'bg-red-50 text-red-800 border-red-200/60'
                    }`}
                  >
                    {toLabel(capacityLevel)}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Current Workload Score</span>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-900">
                      {(stats?.workload_score || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${
                        capacityLevel === 'available' ? 'bg-emerald-600' :
                        capacityLevel === 'moderate' ? 'bg-blue-600' :
                        capacityLevel === 'high' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((stats?.workload_score || 0) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2.5 mb-6">
                <User className="w-5 h-5 text-emerald-800" />
                <h3 className="text-xl font-bold font-display tracking-tight text-slate-950">
                  Account Credentials &amp; Verification
                </h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-700" />
                    <div>
                      <span className="text-sm font-semibold text-slate-900">Account Authorization</span>
                      <p className="text-xs text-slate-500 font-sans">Active field dispatch privilege status</p>
                    </div>
                  </div>
                  <Badge 
                    className={`font-mono text-xs rounded-full px-3 py-0.5 ${
                      profile?.is_active 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' 
                        : 'bg-red-50 text-red-800 border-red-200/60'
                    }`}
                  >
                    {profile?.is_active ? 'Active & Authorized' : 'Suspended'}
                  </Badge>
                </div>
                
                {/* Phone Verification */}
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-emerald-700" />
                      <div>
                        <span className="text-sm font-semibold text-slate-900">Official Mobile Dispatch</span>
                        <p className="text-xs font-mono text-slate-500">{profile?.phone || user?.phone || 'No phone set'}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`font-mono text-xs rounded-full px-3 py-0.5 ${
                        verificationStatus?.phone.verified 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200/60" 
                          : "bg-amber-50 text-amber-800 border-amber-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {verificationStatus?.phone.verified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        {verificationStatus?.phone.verified ? 'Verified' : 'Pending OTP'}
                      </div>
                    </Badge>
                  </div>
                  
                  {!verificationStatus?.phone.verified && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="OTP"
                          value={phoneOTP}
                          onChange={(e) => setPhoneOTP(e.target.value)}
                          className="h-10 text-sm font-mono rounded-xl border-slate-200 bg-white"
                          maxLength={6}
                        />
                        {phoneOTP && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-mono">
                            <Shield className="w-3 h-3" />
                            <span>Demo OTP: {phoneOTP}</span>
                          </div>
                        )}
                        <Button 
                          onClick={handleVerifyPhone}
                          disabled={verifyingPhone || !phoneOTP}
                          size="sm"
                          className="h-10 px-5 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold active:scale-[0.98]"
                        >
                          {verifyingPhone ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSendPhoneVerification}
                        disabled={verifyingPhone}
                        className="w-full h-8 text-xs text-emerald-800 hover:text-emerald-900 active:scale-[0.98]"
                      >
                        {verifyingPhone ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                        Resend Verification OTP
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Email Verification */}
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-emerald-700" />
                      <div>
                        <span className="text-sm font-semibold text-slate-900">Email Address</span>
                        <p className="text-xs font-mono text-slate-500">{profile?.email || 'No email set'}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs rounded-full bg-emerald-50 text-emerald-800 border-emerald-200/60 px-3 py-0.5">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Official Domain
                    </Badge>
                  </div>
                </div>

                {profile?.last_login && (
                  <div className="flex justify-between items-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-slate-400" />
                      <div>
                        <span className="text-sm font-semibold text-slate-900">Last Telemetry Check-in</span>
                        <p className="text-xs text-slate-500 font-sans">Most recent session timestamp</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500">
                      {formatDate(profile.last_login)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-emerald-800" />
                <h4 className="font-bold font-display tracking-tight text-slate-950">Quick Actions</h4>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium active:scale-[0.98] transition-all"
                  onClick={() => {
                    showToast.info("Coming Soon", {
                      description: "Profile editing will be available in a future update.",
                    });
                  }}
                >
                  <Edit className="w-4 h-4 mr-2 text-slate-400" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium active:scale-[0.98] transition-all"
                  onClick={() => {
                    showToast.info("Coming Soon", {
                      description: "Password change will be available in a future update.",
                    });
                  }}
                >
                  <KeyRound className="w-4 h-4 mr-2 text-slate-400" />
                  Change Security Pin
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium active:scale-[0.98] transition-all"
                  onClick={() => navigate('/officer/tasks')}
                >
                  <FileText className="w-4 h-4 mr-2 text-slate-400" />
                  View All Tasks Queue
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 font-medium active:scale-[0.98] transition-all"
                  onClick={() => navigate('/officer/dashboard')}
                >
                  <Activity className="w-4 h-4 mr-2 text-slate-400" />
                  Operations Dashboard
                </Button>
              </div>
            </div>

            {/* Workload Status */}
            {stats && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-800" />
                  <h4 className="font-bold font-display tracking-tight text-slate-950">Workload Guidance</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 font-sans">
                  {capacityLevel === 'available' && 
                    'You have optimal capacity for additional field assignments. Resolution efficiency is within top municipal percentiles.'}
                  {capacityLevel === 'moderate' && 
                    'Your active queue is balanced. Maintain steady progress on current priority tasks.'}
                  {capacityLevel === 'high' && 
                    'Active operational load is high. Complete in-progress assignments before accepting further field dispatches.'}
                  {capacityLevel === 'overloaded' && 
                    'Queue capacity limit reached. Prioritize urgent municipal safety concerns and request crew reinforcement.'}
                  {(capacityLevel === 'unknown' || !stats?.capacity_level) && 
                    'Workload telemetry will populate as field assignments are fulfilled.'}
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-2xl">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span className="font-mono">
                    {capacityLevel === 'available' ? 'Status: Ready for Task Ingestion' :
                     capacityLevel === 'moderate' ? 'Status: Balanced Operational Queue' :
                     capacityLevel === 'high' ? 'Status: High Field Volume' :
                     capacityLevel === 'overloaded' ? 'Status: Critical Load' :
                     'Status: Telemetry Pending'}
                  </span>
                </div>
              </div>
            )}

            {/* Logout */}
            <div className="rounded-3xl border border-red-200/60 bg-white p-6 shadow-xs">
              <Button 
                variant="destructive" 
                className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold h-11 active:scale-[0.98] transition-all shadow-xs"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out of Officer Terminal
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficerProfile;
