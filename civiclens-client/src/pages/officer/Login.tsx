import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  MapPin,
  RefreshCw,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate, Link } from "react-router-dom";
import { showToast } from "@/lib/utils/toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { isOfficer, isCitizen } from "@/utils/authHelpers";
import { APP_CONFIG, getCopyrightText } from "@/config/appConfig";
import { SEO } from "@/components/SEO";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/brand/Logo";

// ─── Auth flow types ──────────────────────────────────────────────────────────
type Screen = "credentials" | "otp";

// ─── Countdown hook ───────────────────────────────────────────────────────────
function useCountdown(initial: number, active: boolean) {
  const [remaining, setRemaining] = useState(initial);
  useEffect(() => {
    if (!active) return;
    setRemaining(initial);
    const id = setInterval(() => setRemaining((p) => Math.max(0, p - 1)), 1000);
    return () => clearInterval(id);
  }, [active, initial]);
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return { remaining, formatted: fmt(remaining) };
}

// ─── Demo OTP banner ──────────────────────────────────────────────────────────
function DemoOtpBanner({ otp }: { otp: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-warning/10 border border-warning/30 rounded-xl text-sm">
      <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
        <Shield className="w-4 h-4 text-warning" />
      </div>
      <div>
        <p className="text-xs font-semibold text-warning uppercase tracking-wide">
          Demo Environment
        </p>
        <p className="font-mono font-bold text-warning text-base tracking-widest">
          {otp}
        </p>
      </div>
      <Badge variant="outline" className="ml-auto text-xs border-warning/30 text-warning">
        OTP
      </Badge>
    </div>
  );
}

// ─── Sandbox credential button ────────────────────────────────────────────────
function SandboxCredCard({
  role,
  phone,
  password: pwd,
  accent,
  onApply,
  onAutoLogin,
  disabled,
}: {
  role: string;
  phone: string;
  password: string;
  accent: string;
  onApply: () => void;
  onAutoLogin: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col justify-between p-3.5 bg-muted/60 hover:bg-muted border border-border/80 rounded-xl text-left transition-all group">
      <div>
        <div className={`flex items-center gap-1.5 ${accent}`}>
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="text-xs font-bold uppercase tracking-wide">{role}</span>
        </div>
        <span className="font-mono text-xs text-foreground/90 font-medium block mt-1">{phone}</span>
        <span className="text-meta text-muted-foreground block">Pwd: {pwd}</span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={onAutoLogin}
          disabled={disabled}
          className="flex-1 py-1 px-2 rounded-md bg-secondary text-secondary-foreground text-meta font-semibold hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 inline-flex items-center justify-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          1-Click
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={disabled}
          className="py-1 px-2 rounded-md border border-border text-meta text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title="Fill form only"
        >
          Fill
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const OfficerLogin = () => {
  const [screen, setScreen] = useState<Screen>("credentials");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [officerEmail, setOfficerEmail] = useState("");
  const [pendingTokens, setPendingTokens] = useState<{
    access_token: string;
    refresh_token: string;
  } | null>(null);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [otpActive, setOtpActive] = useState(false);

  const navigate = useNavigate();
  // const { toast } = useToast(); // Removed in favor of showToast utility
  const { login, user, loading: authLoading } = useAuth();
  const { remaining, formatted: countdown } = useCountdown(300, otpActive);

  // ── Redirect if already logged in ──────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user) {
      if (isOfficer(user.role)) {
        navigate("/officer/dashboard", { replace: true });
      } else if (isCitizen(user.role)) {
        navigate("/citizen/dashboard", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // ── Phone normalization ──────────────────────────────────────────────────────
  const normalizePhone = useCallback((raw: string): string => {
    const cleaned = raw.replace(/[\s-]/g, "");
    if (cleaned.startsWith("+91")) return cleaned;
    if (cleaned.startsWith("91") && cleaned.length === 12) return "+" + cleaned;
    if (/^\d{10}$/.test(cleaned)) return "+91" + cleaned;
    return cleaned;
  }, []);

  // ── Real-time validation ────────────────────────────────────────────────────
  useEffect(() => {
    if (phone.length === 0) { setPhoneError(null); return; }
    setPhoneError(phone.length !== 10 ? "Enter a valid 10-digit number" : null);
  }, [phone]);

  useEffect(() => {
    if (password.length === 0) { setPasswordError(null); return; }
    setPasswordError(password.length < 8 ? "Password must be at least 8 characters" : null);
  }, [password]);

  // ── Credential login ────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (phone.length !== 10) {
      setPhoneError("Enter a valid 10-digit number");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    setLoading(true);
    setPhoneError(null);
    setPasswordError(null);

    try {
      const np = normalizePhone(phone);
      const response = await authService.login(np, password, "officer");

      // Store pending tokens (needed post-OTP)
      setPendingTokens({
        access_token: response.access_token,
        refresh_token: response.refresh_token,
      });

      // Try to fetch profile for 2FA email OTP
      try {
        const profile = await authService.getCurrentUser();
        if (profile.email) {
          setOfficerEmail(profile.email);
          const otpRes = await authService.requestEmailOTP(profile.email);
          if (otpRes.otp) {
            setDemoOtp(otpRes.otp);
            setOtp(otpRes.otp);
          } else {
            setOtp("");
          }
          setOtpActive(true);
          setScreen("otp");
          showToast.info("Verification Required", {
            description: `A code was sent to ${profile.email}`,
          });
          return;
        }
      } catch {
        // No email / profile error → skip OTP, complete login
      }

      // No email OTP needed — complete login directly
      await login(response.access_token, response.refresh_token);
      if (rememberMe) {
        localStorage.setItem("remember_me", "true");
      } else {
        localStorage.removeItem("remember_me");
      }
      showToast.success("Login Successful", { description: "Welcome back, Officer." });
    } catch (err: any) {
      let msg = "Invalid credentials. Please check your phone and password.";
      if (err.response?.data?.detail?.includes("Citizen Portal")) {
        msg = err.response.data.detail;
        showToast.error("Wrong Portal", { description: msg, duration: 8000 });
        return;
      } else if (err.response?.status === 401) {
        msg = err.response?.data?.detail || "Incorrect phone or password.";
        setPasswordError("Incorrect password");
      } else if (err.response?.status === 429) {
        msg = "Too many attempts. Please wait a few minutes.";
      } else if (err.response?.status === 423) {
        msg = "Account temporarily locked. Contact IT support.";
      } else if (err.response?.status === 422) {
        msg = "Invalid phone format.";
        setPhoneError("Invalid format");
      } else if (err.message === "Network Error" || err.isNetworkError) {
        msg = "Server unreachable. Check your internet connection.";
      }
      showToast.error("Login Failed", { description: msg });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verification ─────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      showToast.error("Invalid Code", { description: "Enter the 6-digit verification code." });
      return;
    }
    setLoading(true);
    try {
      await authService.verifyEmailOTP(officerEmail, otp);
      if (pendingTokens) {
        await login(pendingTokens.access_token, pendingTokens.refresh_token);
        if (rememberMe) {
          localStorage.setItem("remember_me", "true");
        } else {
          localStorage.removeItem("remember_me");
        }
        showToast.success("Login Successful", { description: "Welcome back, Officer." });
      }
    } catch (err: any) {
      showToast.error("Verification Failed", {
        description: err.response?.data?.detail || "Invalid or expired code."
      });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (!officerEmail) return;
    setLoading(true);
    try {
      const res = await authService.requestEmailOTP(officerEmail);
      if (res.otp) {
        setDemoOtp(res.otp);
        setOtp(res.otp);
      } else {
        setOtp("");
      }
      setOtpActive(false);
      setTimeout(() => setOtpActive(true), 50);
      showToast.success("OTP Resent", { description: `A new code was sent to ${officerEmail}` });
    } catch {
      showToast.error("Error", { description: "Failed to resend verification code." });
    } finally {
      setLoading(false);
    }
  };

  // ── Apply sandbox credentials ─────────────────────────────────────────────────
  const applyCreds = (ph: string, pw: string, label: string) => {
    setPhone(ph);
    setPassword(pw);
    setPhoneError(null);
    setPasswordError(null);
    showToast.success("Sandbox Credentials Applied", { description: `${label} credentials filled in.` });
  };

  // ── 1-Click Direct Demo Officer Login ─────────────────────────────────────────
  const handleDirectDemoLogin = async (ph: string, pw: string, label: string) => {
    setPhone(ph);
    setPassword(pw);
    setPhoneError(null);
    setPasswordError(null);
    setLoading(true);
    try {
      const np = normalizePhone(ph);
      const res = await authService.login(np, pw, "officer");
      if (res.access_token) {
        await login(res.access_token, res.refresh_token);
        showToast.success(`Signed in as ${label}`, { description: "Officer session activated." });
        navigate("/officer/dashboard");
      }
    } catch (err: any) {
      showToast.error("Demo Officer Login Failed", { description: err.response?.data?.detail || "Could not auto-login." });
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <SEO
        noindex
        title={`Officer Login — ${APP_CONFIG.appName}`}
        description={`Secure officer portal for ${APP_CONFIG.orgName} personnel. Manage and resolve civic issues.`}
      />

      <div className="min-h-dvh bg-[#fbfcfd] text-slate-900 flex flex-col selection:bg-emerald-500/20 relative">
        {/* ── Background Dot Texture & Ambient Radiance ───────────────────────── */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute top-10 right-[15%] h-[400px] w-[400px] rounded-full bg-emerald-500/08 blur-[120px]" />
          <div className="absolute bottom-10 left-[10%] h-[400px] w-[400px] rounded-full bg-teal-500/08 blur-[120px]" />
        </div>

        {/* ── Top Navbar ──────────────────────────────────────────────────────── */}
        <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-2xl sticky top-0 z-50">
          <div className="container !px-5 max-w-7xl mx-auto py-3.5 flex items-center justify-between">
            <Link
              to="/"
              aria-label="CivicLens home"
              className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Logo name="CivicLens" />
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-1.5 rounded-full text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ── Main content ─────────────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Hero header */}
            {screen === "credentials" && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-white/80 px-3.5 py-1 text-xs font-semibold text-[#0d5c4d] shadow-xs backdrop-blur-md mb-4">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>OFFICER & ADMIN ACCESS</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-mono text-emerald-700 font-bold">FIELD PORTAL</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                  Officer Sign In
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                  Municipal operations dashboard for assigned task resolution and verified closures.
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xs">
              {/* ── Credentials screen ──────────────────────────────────────── */}
              {screen === "credentials" && (
                <div className="space-y-5">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="off-phone" className="text-sm font-medium text-foreground">
                      Registered Mobile <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted rounded-lg border text-sm font-semibold text-foreground/70 select-none flex-shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                        +91
                      </div>
                      <Input
                        id="off-phone"
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className={`flex-1 font-mono ${phoneError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        disabled={loading}
                        autoComplete="tel-national"
                        aria-invalid={!!phoneError}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-xs text-destructive">{phoneError}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="off-pass" className="text-sm font-medium text-foreground">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground"
                        onClick={() =>
                          showToast.info("Password Reset", {
                            description: "Please contact your Department IT Cell for password reset assistance.",
                          })
                        }
                        disabled={loading}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        id="off-pass"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        className={`pl-10 pr-10 ${passwordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                        disabled={loading}
                        autoComplete="current-password"
                        aria-invalid={!!passwordError}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-destructive">{passwordError}</p>
                    )}
                  </div>

                  {/* Remember me */}
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        disabled={loading}
                      />
                      <div className="w-5 h-5 border-2 border-input rounded-md bg-background peer-checked:bg-secondary peer-checked:border-secondary transition-all flex items-center justify-center">
                        <ShieldCheck className="w-3 h-3 text-background opacity-0 peer-checked:opacity-100 transition-opacity absolute" />
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      Keep me signed in
                    </span>
                  </label>

                  {/* Login button */}
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-[#0a2e2a] hover:bg-[#072421] text-white rounded-full font-semibold transition-all active:scale-[0.98] shadow-xs h-11"
                    size="lg"
                    disabled={loading || !phone || !password}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Authenticating…</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4 mr-2" /> Sign In Securely</>
                    )}
                  </Button>

                  {/* Sandbox credentials */}
                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-3 text-muted-foreground">Demo Credentials</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <SandboxCredCard
                        role="Field Officer"
                        phone="9876543210"
                        password="Officer@123"
                        accent="text-secondary"
                        onApply={() => applyCreds("9876543210", "Officer@123", "Field Officer")}
                        onAutoLogin={() => handleDirectDemoLogin("9876543210", "Officer@123", "Field Officer")}
                        disabled={loading}
                      />
                      <SandboxCredCard
                        role="System Admin"
                        phone="9999999999"
                        password="Admin123!"
                        accent="text-primary"
                        onApply={() => applyCreds("9999999999", "Admin123!", "System Admin")}
                        onAutoLogin={() => handleDirectDemoLogin("9999999999", "Admin123!", "System Admin")}
                        disabled={loading}
                      />
                    </div>

                    <p className="text-xs text-center text-muted-foreground leading-relaxed">
                      All activity within the {APP_CONFIG.appName} officer environment is{" "}
                      <span className="text-foreground font-medium">encrypted and audited</span> for security compliance.
                    </p>
                  </div>
                </div>
              )}

              {/* ── OTP screen ───────────────────────────────────────────────── */}
              {screen === "otp" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setScreen("credentials"); setOtp(""); setDemoOtp(null); setOtpActive(false); }}
                      disabled={loading}
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/20">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Two-Factor Verification</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      A security code was sent to{" "}
                      <span className="font-semibold text-foreground">{officerEmail}</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="off-otp" className="text-sm font-medium text-foreground">
                      Enter Verification Code
                    </Label>
                    <Input
                      id="off-otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                      className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                      maxLength={6}
                      disabled={loading}
                      autoComplete="one-time-code"
                    />

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Expires in{" "}
                        <span
                          className={`font-mono font-semibold ${
                            remaining < 60 ? "text-destructive" : "text-foreground"
                          }`}
                        >
                          {countdown}
                        </span>
                      </span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-secondary"
                        onClick={handleResendOtp}
                        disabled={loading || remaining > 240}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Resend
                      </Button>
                    </div>

                    {demoOtp && <DemoOtpBanner otp={demoOtp} />}
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    className="w-full bg-[#0a2e2a] hover:bg-[#072421] text-white rounded-full font-semibold transition-all active:scale-[0.98] shadow-xs h-11"
                    size="lg"
                    disabled={loading || otp.length < 6}
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying…</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4 mr-2" /> Confirm & Sign In</>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── Footer ────────────────────────────────────────────────────────────── */}
        <footer className="border-t border-slate-200/80 bg-white/80 py-5 text-center text-xs text-slate-500 font-mono">
          {getCopyrightText()}
        </footer>
      </div>
    </>
  );
};

export default OfficerLogin;
