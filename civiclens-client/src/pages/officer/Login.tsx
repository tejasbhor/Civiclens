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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { isOfficer, isCitizen } from "@/utils/authHelpers";
import { APP_CONFIG, getCopyrightText } from "@/config/appConfig";
import { SEO } from "@/components/SEO";

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
    <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
        <Shield className="w-4 h-4 text-amber-600" />
      </div>
      <div>
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
          Demo Environment
        </p>
        <p className="font-mono font-bold text-amber-800 text-base tracking-widest">
          {otp}
        </p>
      </div>
      <Badge variant="outline" className="ml-auto text-xs border-amber-300 text-amber-600">
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
  disabled,
}: {
  role: string;
  phone: string;
  password: string;
  accent: string;
  onApply: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onApply}
      disabled={disabled}
      className="flex flex-col gap-1.5 p-3.5 bg-muted/60 hover:bg-muted border rounded-xl text-left transition-all hover:border-border group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className={`flex items-center gap-1.5 ${accent}`}>
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wide">{role}</span>
      </div>
      <span className="font-mono text-xs text-foreground/80 font-medium">{phone}</span>
      <span className="text-[10px] text-muted-foreground">Password: {pwd}</span>
    </button>
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
  const { toast } = useToast();
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
          if (otpRes.otp) setDemoOtp(otpRes.otp);
          setOtpActive(true);
          setOtp("");
          setScreen("otp");
          toast({
            title: "Verification Required",
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
      toast({ title: "Login Successful", description: "Welcome back, Officer." });
    } catch (err: any) {
      let msg = "Invalid credentials. Please check your phone and password.";
      if (err.response?.data?.detail?.includes("Citizen Portal")) {
        msg = err.response.data.detail;
        toast({ title: "Wrong Portal", description: msg, variant: "destructive", duration: 8000 });
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
      toast({ title: "Login Failed", description: msg, variant: "destructive" });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // ── OTP verification ─────────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({ title: "Invalid Code", description: "Enter the 6-digit verification code.", variant: "destructive" });
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
        toast({ title: "Login Successful", description: "Welcome back, Officer." });
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.response?.data?.detail || "Invalid or expired code.",
        variant: "destructive",
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
      if (res.otp) setDemoOtp(res.otp);
      setOtpActive(false);
      setTimeout(() => setOtpActive(true), 50);
      setOtp("");
      toast({ title: "OTP Resent", description: `A new code was sent to ${officerEmail}` });
    } catch {
      toast({ title: "Error", description: "Failed to resend verification code.", variant: "destructive" });
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
    toast({ title: "Sandbox Credentials Applied", description: `${label} credentials filled in.` });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <SEO
        title={`Officer Login — ${APP_CONFIG.appName}`}
        description={`Secure officer portal for ${APP_CONFIG.orgName} personnel. Manage and resolve civic issues.`}
      />

      <div className="min-h-screen bg-background flex flex-col">
        {/* ── Navbar ──────────────────────────────────────────────────────────── */}
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-sm">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">{APP_CONFIG.appName}</h1>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">Officer Portal</p>
                </div>
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ── Main content ─────────────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          {/* Background decoration */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="w-full max-w-md relative">
            {/* Hero header */}
            {screen === "credentials" && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-semibold mb-4 border border-secondary/20">
                  <Shield className="w-3.5 h-3.5" />
                  Authorized Personnel Only
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Officer Sign In
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {APP_CONFIG.orgName} · Secure Access
                </p>
              </div>
            )}

            <Card className="p-7 shadow-xl border bg-card">
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
                          toast({
                            title: "Password Reset",
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
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity"
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
                        disabled={loading}
                      />
                      <SandboxCredCard
                        role="System Admin"
                        phone="9999999999"
                        password="Admin123!"
                        accent="text-primary"
                        onApply={() => applyCreds("9999999999", "Admin123!", "System Admin")}
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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/20">
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
                    className="w-full bg-gradient-to-r from-secondary to-accent hover:opacity-90 transition-opacity"
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
            </Card>
          </div>
        </main>

        {/* ── Footer ────────────────────────────────────────────────────────────── */}
        <footer className="border-t bg-card/50 py-5 text-center text-xs text-muted-foreground">
          {getCopyrightText()}
        </footer>
      </div>
    </>
  );
};

export default OfficerLogin;
