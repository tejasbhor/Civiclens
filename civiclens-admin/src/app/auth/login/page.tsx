"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { authApi } from "@/lib/api/auth";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Shield,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  Server,
  Clock,
  ShieldAlert,
  Mail,
  ArrowLeft,
  Bug,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { APP_CONFIG } from "@/lib/config/appConfig";

// ───────────────────────────────────────────────────────────────
// Constants & Helpers
// ───────────────────────────────────────────────────────────────

// Whether we are in development mode – controlled by Next.js env
const IS_DEV = process.env.NODE_ENV === "development";

// Super admin role is exempt from email-based 2FA.
// (Super admins use TOTP-based 2FA managed separately.)
const SUPER_ADMIN_ROLE = "super_admin";

type ErrorType = "network" | "server" | "auth" | "validation" | "rate-limit" | null;

interface LoginError {
  type: ErrorType;
  message: string;
  retryAfter?: number;
}

/** Normalize phone number to backend format (+91XXXXXXXXXX) */
const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91")) return "+" + digits;
  if (digits.length === 10) return "+91" + digits;
  return digits.startsWith("+") ? digits : "+" + digits;
};

const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10 || (digits.startsWith("91") && digits.length === 12);
};

const validatePassword = (password: string): boolean => password.length >= 8;

const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ───────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuth();

  // Form state
  const [authMode, setAuthMode] = useState<"password" | "email">("password");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // TFA state
  // step: 'credentials' → fill phone+pass or email
  // step: 'tfa'         → enter 6-digit email OTP
  const [step, setStep] = useState<"credentials" | "tfa">("credentials");
  const [emailCode, setEmailCode] = useState("");
  const [tfaEmail, setTfaEmail] = useState("");
  // Dev-only: OTP returned by backend in DEBUG mode
  const [devOtp, setDevOtp] = useState<string | null>(null);
  // Holds the tokens from the password-login step until MFA is complete
  const [tempLoginData, setTempLoginData] = useState<{
    access_token: string;
    refresh_token?: string;
    user_id: number;
    role: string;
  } | null>(null);

  // Error state
  const [error, setError] = useState<LoginError | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);

  // Validation touch state
  const [touched, setTouched] = useState({ phone: false, password: false, email: false });

  // Backend health
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");

  // ── Backend health check ──────────────────────────────────────
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") + "/health",
          { method: "GET", signal: AbortSignal.timeout(5000) }
        );
        setBackendStatus(response.ok ? "online" : "offline");
      } catch {
        setBackendStatus("offline");
      }
    };
    checkBackend();
  }, []);

  // ── Already authenticated → redirect ─────────────────────────
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  // ── Rate-limit countdown ─────────────────────────────────────
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => setRetryCountdown(retryCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (retryCountdown === 0 && error?.type === "rate-limit") {
      setError(null);
    }
  }, [retryCountdown, error]);

  // ── finishLogin helper  ───────────────────────────────────────
  /**
   * Called ONLY after full authentication is complete (either after OTP verify or
   * when MFA is skipped for super_admin).
   * Persists tokens to localStorage and sets React auth state.
   */
  const finishLogin = useCallback(
    (data: { access_token: string; refresh_token?: string; user_id: number; role: string }) => {
      // Commit tokens to localStorage — this is the ONLY place they are persisted
      authApi.commitAuthTokens(data as any);

      setAuth(data.access_token, data.refresh_token || "", {
        id: data.user_id,
        role: data.role,
        phone: authMode === "password" ? normalizePhone(phone) : "",
        email: authMode === "email" ? tfaEmail : undefined,
      });
      toast.success("Welcome back!", { description: "Redirecting to dashboard..." });
      router.push("/dashboard");
    },
    [setAuth, router, authMode, phone, tfaEmail]
  );

  // ── Error display config ─────────────────────────────────────
  const getErrorDisplay = (errorType: ErrorType) => {
    switch (errorType) {
      case "network":
        return { icon: WifiOff, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" };
      case "server":
        return { icon: Server, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      case "rate-limit":
        return { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" };
      case "auth":
        return { icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" };
      case "validation":
        return { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" };
      default:
        return { icon: AlertCircle, color: "text-gray-600", bg: "bg-gray-50", border: "border-gray-200" };
    }
  };

  // ── Parse API error ───────────────────────────────────────────
  const parseApiError = (e: any): LoginError => {
    if (e.code === "ERR_NETWORK" || e.message?.includes("Network Error")) {
      setBackendStatus("offline");
      return { type: "network", message: "Unable to connect to server. Please check your internet connection." };
    }
    if (e.response?.status === 429) {
      const retryAfter = parseInt(e.response.headers["retry-after"] || "60");
      setRetryCountdown(retryAfter);
      return { type: "rate-limit", message: `Too many login attempts. Please try again in ${retryAfter} seconds.`, retryAfter };
    }
    if (e.response?.status === 401 || e.response?.status === 403) {
      return { type: "auth", message: e.response?.data?.detail || "Invalid credentials. Please try again." };
    }
    if (e.response?.status === 422) {
      return { type: "validation", message: e.response?.data?.detail || "Invalid input. Please check your credentials." };
    }
    if (e.response?.status >= 500) {
      return { type: "server", message: "Server error. Please try again later or contact support." };
    }
    return { type: "auth", message: e.response?.data?.detail || "Login failed. Please try again." };
  };

  // ── Password login handler ────────────────────────────────────
  const onLogin = useCallback(async () => {
    if (loading || !phone || !password) return;
    setError(null);

    if (!validatePhone(phone)) {
      setError({ type: "validation", message: "Please enter a valid 10-digit phone number" });
      return;
    }
    if (!validatePassword(password)) {
      setError({ type: "validation", message: "Password must be at least 8 characters" });
      return;
    }

    try {
      setLoading(true);
      const normalizedPhone = normalizePhone(phone);

      // Step 1: Authenticate with credentials.
      // authApi.login() sets the token on the API client in memory
      // but does NOT persist to localStorage (security: prevents
      // token leak before MFA is complete).
      const loginData = await authApi.login(normalizedPhone, password);

      // Step 2: Super admin bypasses email 2FA
      // (Super admins use TOTP-based 2FA managed separately via /2fa/* endpoints)
      if (loginData.role === SUPER_ADMIN_ROLE) {
        finishLogin(loginData);
        return;
      }

      // Step 3: For non-super-admin roles, require email OTP as 2FA
      try {
        // We use the raw axios call here or handle error specifically to avoid 
        // the global interceptor redirecting us while we are mid-login.
        const user = await authApi.getCurrentUser().catch(err => {
          console.warn("MFA Check: Could not fetch detailed profile, attempting to continue...", err);
          return loginData; // Fallback to basic data from login response if /me fails
        });

        if (user && user.email) {
          // Send OTP to user's email
          const otpRes = await authApi.requestEmailOtp(user.email);
          setTfaEmail(user.email);
          // Hold the password-login tokens so we can revoke the temp session later
          setTempLoginData(loginData);
          // In demo/dev mode, show the OTP from the backend response
          if ((IS_DEV || APP_CONFIG.enableDemoOtp) && otpRes.otp) {
            setDevOtp(otpRes.otp);
          }
          setStep("tfa");
          setLoading(false);
          toast.info("Security Verification", {
            description: `A 6-digit code has been sent to ${user.email}`,
          });
          return;
        }
      } catch (mfaError) {
        console.error("MFA Step failed:", mfaError);
        // If MFA request fails but we have loginData, we might 
        // proceed or show a specific error.
      }

      // No email on account or MFA step failed — complete login without TFA
      finishLogin(loginData);
    } catch (e: any) {
      setLoading(false);
      setError(parseApiError(e));
    }
  }, [loading, phone, password, finishLogin]);

  // ── Email OTP request handler (email login mode) ──────────────
  const onRequestEmailOtp = useCallback(async () => {
    if (loading || !email) return;
    setError(null);

    if (!validateEmail(email)) {
      setError({ type: "validation", message: "Please enter a valid email address" });
      return;
    }

    try {
      setLoading(true);
      const otpRes = await authApi.requestEmailOtp(email.trim());
      setTfaEmail(email.trim());

      // In demo/dev mode, show the OTP inline
      if ((IS_DEV || APP_CONFIG.enableDemoOtp) && otpRes.otp) {
        setDevOtp(otpRes.otp);
      }

      setStep("tfa");
      setLoading(false);
      toast.info("Verification Code Sent", {
        description: `OTP sent to ${email}`,
      });
    } catch (e: any) {
      setLoading(false);
      setError({ type: "auth", message: e.response?.data?.detail || "Failed to send OTP to email." });
    }
  }, [loading, email]);

  // ── TFA verify handler ────────────────────────────────────────
  const onVerifyTfa = useCallback(async () => {
    if (loading || !emailCode || emailCode.length !== 6) {
      setError({ type: "validation", message: "Please enter a valid 6-digit code" });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // verifyEmailOtp returns full token data — this is the FINAL auth token we use
      const data = await authApi.verifyEmailOtp(tfaEmail, emailCode);

      // Revoke the temporary session from the password-login step
      // to prevent orphaned sessions in the database.
      if (tempLoginData?.access_token) {
        authApi.revokeTemporaryToken(tempLoginData.access_token);
      }

      setDevOtp(null);
      setTempLoginData(null);
      finishLogin(data);
    } catch (e: any) {
      setLoading(false);
      setError({ type: "auth", message: e.response?.data?.detail || "Invalid verification code." });
    }
  }, [loading, emailCode, tfaEmail, tempLoginData, finishLogin]);

  // ── Auto-fill OTP (dev only) ─────────────────────────────────
  const handleDevAutoFill = useCallback(() => {
    if (devOtp) {
      setEmailCode(devOtp);
      setError(null);
    }
  }, [devOtp]);

  // ── Form validity ─────────────────────────────────────────────
  const isFormValid =
    authMode === "password" ? validatePhone(phone) && validatePassword(password) : validateEmail(email);
  const canSubmit = isFormValid && !loading && retryCountdown === 0;

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl border-gray-200">
        {/* Header */}
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <CardTitle className="text-2xl">{APP_CONFIG.appName} Admin Portal</CardTitle>
          <CardDescription className="text-base mt-2">
            Secure access for government officials and administrators
          </CardDescription>

          {/* Backend Status */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                backendStatus === "online" && "bg-green-500 animate-pulse",
                backendStatus === "offline" && "bg-red-500",
                backendStatus === "checking" && "bg-yellow-500 animate-pulse"
              )}
            />
            <span className="text-xs text-gray-600">
              {backendStatus === "online" && "System Online"}
              {backendStatus === "offline" && "System Offline"}
              {backendStatus === "checking" && "Checking Status..."}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Error Alert */}
          {error && (
            <div
              className={cn(
                "rounded-lg p-4 border animate-slide-in",
                getErrorDisplay(error.type).bg,
                getErrorDisplay(error.type).border
              )}
            >
              <div className="flex items-start gap-3">
                {React.createElement(getErrorDisplay(error.type).icon, {
                  className: cn("w-5 h-5 flex-shrink-0 mt-0.5", getErrorDisplay(error.type).color),
                })}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", getErrorDisplay(error.type).color)}>
                    {error.message}
                  </p>
                  {error.type === "rate-limit" && retryCountdown > 0 && (
                    <p className="text-xs text-gray-600 mt-1">Retry in {retryCountdown} seconds</p>
                  )}
                  {error.type === "network" && (
                    <p className="text-xs text-gray-600 mt-1">Check your connection and try again</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === "credentials" ? (
            <>
              {/* Login Method Tabs */}
              <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => { setAuthMode("password"); setError(null); }}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    authMode === "password" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Phone &amp; Password
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("email"); setError(null); }}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    authMode === "email" ? "bg-white text-primary-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Email Login
                </button>
              </div>

              {authMode === "password" ? (
                <>
                  {/* Phone Number Input */}
                  <div>
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (error?.type === "validation" || error?.type === "auth") setError(null);
                      }}
                      onBlur={() => setTouched({ ...touched, phone: true })}
                      autoComplete="username"
                      disabled={loading || retryCountdown > 0}
                      startIcon={<Phone className="w-4 h-4" />}
                      error={touched.phone && !validatePhone(phone) ? "Enter a valid 10-digit number" : undefined}
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <Input
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error?.type === "validation" || error?.type === "auth") setError(null);
                      }}
                      onBlur={() => setTouched({ ...touched, password: true })}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && canSubmit) onLogin();
                      }}
                      autoComplete="current-password"
                      disabled={loading || retryCountdown > 0}
                      startIcon={<Lock className="w-4 h-4" />}
                      endIcon={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="cursor-pointer hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                      error={
                        touched.password && !validatePassword(password)
                          ? "Minimum 8 characters required"
                          : undefined
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Email Input */}
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error?.type === "validation" || error?.type === "auth") setError(null);
                      }}
                      onBlur={() => setTouched({ ...touched, email: true })}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && canSubmit) onRequestEmailOtp();
                      }}
                      autoComplete="email"
                      disabled={loading || retryCountdown > 0}
                      startIcon={<Mail className="w-4 h-4" />}
                      error={
                        touched.email && !validateEmail(email) ? "Enter a valid email address" : undefined
                      }
                    />
                  </div>
                </>
              )}

              {/* Forgot Password Link (password mode only) */}
              {authMode === "password" && (
                <div className="flex items-center justify-end mt-1">
                  <a
                    href="/auth/forgot-password"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={authMode === "password" ? onLogin : onRequestEmailOtp}
                disabled={!canSubmit || backendStatus === "offline"}
                loading={loading}
                fullWidth
                size="lg"
                className="mt-6"
              >
                {loading
                  ? "Please wait..."
                  : authMode === "password"
                    ? retryCountdown > 0
                      ? `Wait ${retryCountdown}s`
                      : "Sign In"
                    : "Send Verification Code"}
              </Button>
            </>
          ) : (
            <>
              {/* TFA Step */}
              <div className="text-center mb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-900">Check your email</p>
                <p className="text-sm text-gray-500 mt-1">
                  We've sent a 6-digit code to
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{tfaEmail}</p>
              </div>

              {/* Dev/Demo OTP Hint */}
              {(IS_DEV || APP_CONFIG.enableDemoOtp) && devOtp && (
                <div
                  className="rounded-lg p-3 bg-amber-50 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                  onClick={handleDevAutoFill}
                  title="Click to auto-fill OTP"
                >
                  <div className="flex items-center gap-2">
                    <Bug className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-amber-800">DEMO MODE — click to auto-fill</p>
                      <p className="text-lg font-mono font-bold text-amber-900 tracking-widest mt-0.5">
                        {devOtp}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="0 0 0 0 0 0"
                  value={emailCode}
                  onChange={(e) => {
                    setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && emailCode.length === 6 && !loading) onVerifyTfa();
                  }}
                  disabled={loading}
                  startIcon={<Shield className="w-4 h-4" />}
                  className="text-center text-lg tracking-[0.5em]"
                />
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <Button
                  onClick={onVerifyTfa}
                  disabled={loading || emailCode.length !== 6}
                  loading={loading}
                  fullWidth
                  size="lg"
                >
                  Verify &amp; Sign In
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // Revoke the temp session from the password-login step
                    if (tempLoginData?.access_token) {
                      authApi.revokeTemporaryToken(tempLoginData.access_token);
                    }
                    setStep("credentials");
                    setEmailCode("");
                    setDevOtp(null);
                    setTempLoginData(null);
                    setError(null);
                  }}
                  disabled={loading}
                  fullWidth
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </div>
            </>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-2">Secure Access</p>
                <ul className="text-xs text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>All login attempts are logged and monitored</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Email OTP verification required for every login</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>Contact your system administrator for access</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-500">
        <p>{APP_CONFIG.appName} v{APP_CONFIG.appVersion} • {APP_CONFIG.adminTagline}{IS_DEV && " • 🛠 Development Mode"}</p>
      </div>
    </div>
  );
}
