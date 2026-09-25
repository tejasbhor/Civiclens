import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, MapPin, Phone, LogOut, Edit, Loader2, AlertCircle, Shield, Bell, CheckCircle2, XCircle, RefreshCw, Award, Star, TrendingUp, Activity, FileText } from "lucide-react";
import { showToast } from "@/lib/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CitizenHeader } from "@/components/layout/CitizenHeader";
import { logger } from "@/lib/logger";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CitizenProfile = () => {
  const navigate = useNavigate();
  const { user, logout: authLogout, refreshUser, loading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userStats, setUserStats] = useState<{
    total_reports?: number;
    resolved_reports?: number;
    in_progress_reports?: number;
    active_reports?: number;
    avg_resolution_time_days?: number;
    reputation_score?: number;
  } | null>(null);
  const [preferences, setPreferences] = useState({
    theme: 'auto' as 'light' | 'dark' | 'auto',
    density: 'comfortable' as 'comfortable' | 'compact'
  });
  const [verificationStatus, setVerificationStatus] = useState<{
    email: { value: string | null; verified: boolean; last_sent_at: string | null };
    phone: { value: string | null; verified: boolean; last_sent_at: string | null };
  } | null>(null);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [emailToken, setEmailToken] = useState("");
  const [phoneOTP, setPhoneOTP] = useState("");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    full_name: "",
    email: "",
    primary_address: "",
    bio: "",
    push_notifications: true,
    sms_notifications: true,
    email_notifications: true
  });

  const loadProfileData = useCallback(async () => {
    if (!user) return;

    try {
      // Set form data from user
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        full_name: user.full_name || "",
        email: user.email || "",
        primary_address: user.primary_address || "",
        bio: user.bio || "",
        push_notifications: true,
        sms_notifications: true,
        email_notifications: true
      });

      // Load user stats, preferences, and verification status in parallel
      const [statsData, prefsData, verificationData] = await Promise.allSettled([
        userService.getMyStats().catch(() => null),
        userService.getPreferences().catch(() => null),
        userService.getVerificationStatus().catch(() => null)
      ]);

      if (statsData.status === 'fulfilled' && statsData.value) {
        setUserStats(statsData.value);
      }

      if (prefsData.status === 'fulfilled' && prefsData.value) {
        setPreferences(prefsData.value);
      }

      if (verificationData.status === 'fulfilled' && verificationData.value) {
        setVerificationStatus(verificationData.value);
      }
    } catch (error) {
      logger.error('Failed to load profile data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/citizen/login');
    } else if (user) {
      loadProfileData();
    }
  }, [authLoading, user, navigate, loadProfileData]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare update data - always send the form state if changed
      const updateData: any = {};
      if (formData.first_name !== user?.first_name) {
        updateData.first_name = formData.first_name || null;
      }
      if (formData.last_name !== user?.last_name) {
        updateData.last_name = formData.last_name || null;
      }
      if (formData.first_name !== user?.first_name || formData.last_name !== user?.last_name) {
        updateData.full_name = `${formData.first_name.trim()} ${formData.last_name.trim()}`;
      }
      if (formData.email !== user?.email) {
        updateData.email = formData.email || null;
      }
      // For optional fields, send the value even if empty to allow clearing (using null for backend)
      updateData.primary_address = formData.primary_address || null;
      updateData.bio = formData.bio || null;

      // Update profile and preferences in parallel
      await Promise.all([
        userService.updateProfile(updateData),
        userService.updatePreferences(preferences)
      ]);

      await refreshUser();
      await loadProfileData();

      showToast.success("Profile Updated", {
        description: "Your profile has been updated successfully."
      });
      setIsEditing(false);
    } catch (error: any) {
      logger.error('Failed to update profile:', error);
      showToast.error("Update Failed", {
        description: error.response?.data?.detail || "Failed to update profile. Please try again."
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailVerification = async () => {
    try {
      setVerifyingEmail(true);
      const result = await userService.sendEmailVerification();
      showToast.success("Verification Email Sent", {
        description: "Please check your email for the verification link."
      });
      if (result.debug_token) {
        setEmailToken(result.debug_token);
      }
      await loadProfileData();
    } catch (error: any) {
      logger.error('Failed to send email verification:', error);
      showToast.error("Failed to Send Email", {
        description: error.response?.data?.detail || "Failed to send verification email. Please try again."
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailToken) {
      showToast.warning("Token Required", {
        description: "Please enter the verification token from your email."
      });
      return;
    }
    try {
      setVerifyingEmail(true);
      await userService.verifyEmail(emailToken);
      showToast.success("Email Verified", {
        description: "Your email has been verified successfully."
      });
      setEmailToken("");
      await loadProfileData();
    } catch (error: any) {
      logger.error('Failed to verify email:', error);
      showToast.error("Verification Failed", {
        description: error.response?.data?.detail || "Invalid or expired token. Please try again."
      });
    } finally {
      setVerifyingEmail(false);
    }
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
      await loadProfileData();
    } catch (error: any) {
      logger.error('Failed to send phone verification:', error);
      showToast.error("Failed to Send OTP", {
        description: error.response?.data?.detail || "Failed to send verification OTP. Please try again."
      });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!phoneOTP) {
      showToast.warning("OTP Required", {
        description: "Please enter the OTP sent to your phone."
      });
      return;
    }
    try {
      setVerifyingPhone(true);
      await userService.verifyPhone(phoneOTP);
      showToast.success("Phone Verified", {
        description: "Your phone number has been verified successfully."
      });
      setPhoneOTP("");
      await loadProfileData();
    } catch (error: any) {
      logger.error('Failed to verify phone:', error);
      showToast.error("Verification Failed", {
        description: error.response?.data?.detail || "Invalid or expired OTP. Please try again."
      });
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate("/citizen/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      navigate("/citizen/login");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
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
        <CitizenHeader />

        <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
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
            <h1 className="font-display text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">Citizen Profile & Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage verified credentials, notification channels, and identity security.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 shadow-xs shrink-0">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h2 className="font-display text-2xl font-bold tracking-tight text-slate-950">{user.full_name || 'Citizen'}</h2>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-0.5 rounded-full font-mono text-xs font-semibold">
                        {user.profile_completion === 'complete' ? 'Verified Citizen' : 'Basic Account'}
                      </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-2 font-mono text-xs">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      {user.phone}
                    </p>
                    {user.email && (
                      <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user.email}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      disabled={loading}
                      className="rounded-full border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 self-start sm:self-auto h-9"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* Stats Grid */}
                {userStats && (
                  <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100">
                    <div className="text-center p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60">
                      <div className="font-display text-2xl font-bold text-slate-950 flex items-center justify-center gap-1">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {userStats.total_reports || 0}
                      </div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mt-1 font-semibold">Total Reports</div>
                    </div>
                    <div className="text-center p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200/40">
                      <div className="font-display text-2xl font-bold text-emerald-800 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {userStats.resolved_reports || 0}
                      </div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-emerald-700 mt-1 font-semibold">Resolved</div>
                    </div>
                    <div className="text-center p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/40">
                      <div className="font-display text-2xl font-bold text-amber-900 flex items-center justify-center gap-1">
                        <Award className="w-4 h-4 text-amber-600" />
                        {userStats.reputation_score || user?.reputation_score || 0}
                      </div>
                      <div className="font-mono text-[11px] uppercase tracking-wider text-amber-800 mt-1 font-semibold">Civic Score</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Details */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <h3 className="font-display text-lg font-bold tracking-tight text-slate-950 mb-6 pb-2 border-b border-slate-100">
                  Profile Information
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-slate-500">First Name</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <Input
                          id="firstName"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          disabled={!isEditing}
                          placeholder="First Name"
                          className="flex-1 rounded-xl border-slate-200"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Last Name</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <Input
                          id="lastName"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          disabled={!isEditing}
                          placeholder="Last Name"
                          className="flex-1 rounded-xl border-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone Number</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={user.phone}
                        disabled
                        className="flex-1 bg-slate-50 font-mono rounded-xl border-slate-200"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Phone number is cryptographically locked to your account</p>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email (Optional)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        placeholder="your.email@example.com"
                        className="flex-1 rounded-xl border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Primary Address (Optional)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <Input
                        id="address"
                        value={formData.primary_address}
                        onChange={(e) => setFormData({ ...formData, primary_address: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Your primary address"
                        className="flex-1 rounded-xl border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bio (Optional)</Label>
                    <textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      className="w-full min-h-[80px] p-3 rounded-xl border border-slate-200 bg-white text-sm disabled:opacity-50 mt-2 leading-relaxed"
                      maxLength={500}
                    />
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSave}
                        className="flex-1 rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white font-semibold shadow-xs active:scale-[0.98] h-10"
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          'Save Profile'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditing(false);
                          loadProfileData();
                        }}
                        variant="outline"
                        className="flex-1 rounded-full border-slate-200 hover:bg-slate-50 text-slate-700 h-10 font-semibold"
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification Status */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <h3 className="font-display text-lg font-bold tracking-tight text-slate-950 mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-emerald-700" />
                  Account Verification
                </h3>

                <div className="space-y-4">
                  {/* Phone Verification */}
                  <div className="p-4 border border-slate-200/90 rounded-2xl bg-slate-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Phone Number</Label>
                          <p className="text-xs font-mono text-slate-500">{user.phone}</p>
                        </div>
                      </div>
                      {verificationStatus?.phone.verified ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 border border-amber-200 font-mono text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Unverified
                        </span>
                      )}
                    </div>
                    {!verificationStatus?.phone.verified && (
                      <div className="space-y-2 mt-3">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter OTP"
                            value={phoneOTP}
                            onChange={(e) => setPhoneOTP(e.target.value)}
                            className="flex-1 font-mono rounded-xl border-slate-200"
                            maxLength={6}
                          />
                          <Button
                            onClick={handleVerifyPhone}
                            disabled={verifyingPhone || !phoneOTP}
                            size="sm"
                            className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white px-5"
                          >
                            {verifyingPhone ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendPhoneVerification}
                          disabled={verifyingPhone}
                          className="w-full rounded-full border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                        >
                          {verifyingPhone ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 mr-2" />
                              Send Verification OTP
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Email Verification */}
                  {formData.email && (
                    <div className="p-4 border border-slate-200/90 rounded-2xl bg-slate-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <div>
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</Label>
                            <p className="text-xs text-slate-500">{formData.email}</p>
                          </div>
                        </div>
                        {verificationStatus?.email.verified ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 border border-amber-200 font-mono text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Unverified
                          </span>
                        )}
                      </div>
                      {!verificationStatus?.email.verified && (
                        <div className="space-y-2 mt-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter verification token"
                              value={emailToken}
                              onChange={(e) => setEmailToken(e.target.value)}
                              className="flex-1 font-mono rounded-xl border-slate-200"
                            />
                            <Button
                              onClick={handleVerifyEmail}
                              disabled={verifyingEmail || !emailToken}
                              size="sm"
                              className="rounded-full bg-[#0a2e2a] hover:bg-[#072421] text-white px-5"
                            >
                              {verifyingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendEmailVerification}
                            disabled={verifyingEmail}
                            className="w-full rounded-full border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                          >
                            {verifyingEmail ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="w-3.5 h-3.5 mr-2" />
                                Send Verification Email
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Preferences Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <h3 className="font-display text-base font-bold tracking-tight text-slate-950 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  Preferences
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="density" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Display Density</Label>
                    <select
                      id="density"
                      value={preferences.density}
                      onChange={(e) => setPreferences({ ...preferences, density: e.target.value as 'comfortable' | 'compact' })}
                      disabled={!isEditing}
                      className="w-full mt-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm disabled:opacity-50"
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <h3 className="font-display text-base font-bold tracking-tight text-slate-950 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-700" />
                  Notifications
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push" className="text-xs font-semibold text-slate-800">Push Notifications</Label>
                      <p className="text-[11px] text-slate-400">Receive browser notifications</p>
                    </div>
                    <Switch
                      id="push"
                      checked={formData.push_notifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, push_notifications: checked })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms" className="text-xs font-semibold text-slate-800">SMS Notifications</Label>
                      <p className="text-[11px] text-slate-400">Receive SMS updates</p>
                    </div>
                    <Switch
                      id="sms"
                      checked={formData.sms_notifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, sms_notifications: checked })}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notif" className="text-xs font-semibold text-slate-800">Email Notifications</Label>
                      <p className="text-[11px] text-slate-400">
                        {user.email ? 'Receive status emails' : 'Add email above'}
                      </p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked })}
                      disabled={!isEditing || !user.email}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              {userStats && userStats.avg_resolution_time_days !== undefined && (
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                  <h3 className="font-display text-base font-bold tracking-tight text-slate-950 mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Civic Impact
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Avg Resolution Speed</span>
                      <span className="text-sm font-bold font-mono text-slate-900">
                        {userStats.avg_resolution_time_days.toFixed(1)} days
                      </span>
                    </div>
                    {userStats.in_progress_reports !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-amber-600" />
                          In Progress
                        </span>
                        <span className="text-sm font-bold font-mono text-amber-700">
                          {userStats.in_progress_reports}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Logout */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs border border-rose-200/60 h-10">
                      <LogOut className="w-3.5 h-3.5 mr-2" />
                      Sign Out
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl border-slate-200">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">Sign out of CivicLens?</AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-slate-500">
                        You will need to verify your phone number again to sign back in.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white">
                        Sign Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;
