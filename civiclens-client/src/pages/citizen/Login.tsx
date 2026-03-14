import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  ChevronRight,
  User,
  Mail,
  RefreshCw,
  MapPin,
  Smartphone,
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
import { isCitizen } from "@/utils/authHelpers";
import { APP_CONFIG, getCopyrightText } from "@/config/appConfig";
import { SEO } from "@/components/SEO";

// ─── Auth flow types ──────────────────────────────────────────────────────────
type Screen =
  | { id: "select" }
  | { id: "otp-phone" }
  | { id: "otp-verify"; phone: string }
  | { id: "register" }
  | { id: "register-verify"; phone: string }
  | { id: "password-login" }
  | { id: "email-login" }
  | { id: "email-verify"; email: string };

// ─── Password strength helper ─────────────────────────────────────────────────
function usePasswordStrength(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
    score: [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length,
  };
}

// ─── OTP Countdown hook ───────────────────────────────────────────────────────
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

// ─── Shared PhoneField component ──────────────────────────────────────────────
function PhoneField({
  value,
  onChange,
  disabled,
  id = "phone",
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        Mobile Number <span className="text-destructive">*</span>
      </Label>
      <div className="flex gap-2">
        <div className="flex items-center px-3 py-2 bg-muted rounded-lg border text-sm font-semibold text-foreground/70 select-none">
          +91
        </div>
        <Input
          id={id}
          type="tel"
          placeholder="Enter 10-digit number"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="flex-1 font-mono"
          maxLength={10}
          disabled={disabled}
          autoComplete="tel-national"
        />
      </div>
    </div>
  );
}

// ─── Shared OtpField component ────────────────────────────────────────────────
function OtpField({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <Input
      id="otp"
      type="text"
      inputMode="numeric"
      placeholder="• • • • • •"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      className="text-center text-2xl tracking-[0.5em] font-mono h-14"
      maxLength={6}
      disabled={disabled}
      autoComplete="one-time-code"
    />
  );
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

// ─── Back button ──────────────────────────────────────────────────────────────
function BackButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const CitizenLogin = () => {
  const [screen, setScreen] = useState<Screen>({ id: "select" });
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [otpActive, setOtpActive] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, user, loading: authLoading } = useAuth();
  const strength = usePasswordStrength(password);
  const { remaining, formatted: countdown } = useCountdown(300, otpActive);

  // ── Redirect if already logged in ──────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && user) {
      navigate(isCitizen(user.role) ? "/citizen/dashboard" : "/officer/dashboard", {
        replace: true,
      });
    }
  }, [user, authLoading, navigate]);

  // ── Phone normalizer ────────────────────────────────────────────────────────
  const normalizePhone = useCallback((raw: string): string => {
    const cleaned = raw.replace(/[\s-]/g, "");
    if (cleaned.startsWith("+91")) return cleaned;
    if (cleaned.startsWith("91") && cleaned.length === 12) return "+" + cleaned;
    if (/^\d{10}$/.test(cleaned)) return "+91" + cleaned;
    return cleaned;
  }, []);

  // ── Reset helpers ───────────────────────────────────────────────────────────
  const resetOtp = () => {
    setOtp("");
    setDemoOtp(null);
  };
  const resetForm = () => {
    setScreen({ id: "select" });
    setPhone("");
    resetOtp();
    setEmail("");
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
    setOtpActive(false);
  };

  // ── Request phone OTP ───────────────────────────────────────────────────────
  const handleRequestOtp = async () => {
    if (phone.length !== 10) {
      toast({ title: "Invalid Number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const np = normalizePhone(phone);
      const res = await authService.requestOTP(np);
      if (res.otp) setDemoOtp(res.otp);
      setOtpActive(true);
      setOtp(""); // Only clear the input field, not the demo state
      setScreen({ id: "otp-verify", phone: np });
      toast({ title: "OTP Sent", description: res.message });
    } catch (err: any) {
      toast({ title: "Failed to Send OTP", description: err.response?.data?.detail || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Verify phone OTP ────────────────────────────────────────────────────────
  const handleVerifyOtp = async (targetPhone: string) => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOTP(targetPhone, otp);
      await login(res.access_token, res.refresh_token);
      toast({ title: "Welcome!", description: "Logged in successfully." });
      navigate("/citizen/dashboard");
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.response?.data?.detail || "Incorrect OTP.", variant: "destructive" });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Register & send OTP ─────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: "Name Required", description: "Enter your first and last name.", variant: "destructive" });
      return;
    }
    if (phone.length !== 10) {
      toast({ title: "Invalid Number", description: "Enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    if (!strength.length) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords Don't Match", description: "Both passwords must be identical.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const np = normalizePhone(phone);
      const res = await authService.signup({
        phone: np,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim() || undefined,
        password,
      });
      if ((res as any).otp) setDemoOtp((res as any).otp);
      setOtpActive(true);
      setOtp(""); // Only clear the input field
      setScreen({ id: "register-verify", phone: np });
      toast({ title: "Account Created!", description: "Verify your phone to continue." });
    } catch (err: any) {
      toast({ title: "Registration Failed", description: err.response?.data?.detail || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Verify register OTP ─────────────────────────────────────────────────────
  const handleVerifyRegisterOtp = async (targetPhone: string) => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyPhone(targetPhone, otp);
      await login(res.access_token, res.refresh_token);
      toast({ title: `Welcome to ${APP_CONFIG.appName}!`, description: "Your account has been verified." });
      navigate("/citizen/dashboard");
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.response?.data?.detail || "Incorrect OTP.", variant: "destructive" });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Password login ──────────────────────────────────────────────────────────
  const handlePasswordLogin = async () => {
    if (phone.length !== 10 || !password) {
      toast({ title: "Missing Details", description: "Enter your registered phone and password.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const np = normalizePhone(phone);
      const res = await authService.login(np, password, "citizen");
      await login(res.access_token, res.refresh_token);
      toast({ title: "Welcome Back!", description: "Login successful." });
      navigate("/citizen/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Incorrect phone or password.";
      toast({ title: "Login Failed", description: msg, variant: "destructive" });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  // ── Request email OTP ───────────────────────────────────────────────────────
  const handleRequestEmailOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid Email", description: "Enter a valid email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.requestEmailOTP(email.trim());
      if (res.otp) setDemoOtp(res.otp);
      setOtpActive(true);
      setOtp(""); // Only clear the input field
      setScreen({ id: "email-verify", email: email.trim() });
      toast({ title: "OTP Sent", description: res.message });
    } catch (err: any) {
      toast({ title: "Failed to Send OTP", description: err.response?.data?.detail || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Verify email OTP ────────────────────────────────────────────────────────
  const handleVerifyEmailOtp = async (targetEmail: string) => {
    if (otp.length !== 6) {
      toast({ title: "Invalid OTP", description: "Enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyEmailOTP(targetEmail, otp);
      await login(res.access_token, res.refresh_token);
      toast({ title: "Welcome!", description: "Logged in successfully." });
      navigate("/citizen/dashboard");
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.response?.data?.detail || "Incorrect OTP.", variant: "destructive" });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (screen.id === "otp-verify" || screen.id === "register-verify") {
      const np = (screen as any).phone;
      setLoading(true);
      try {
        const res = await authService.requestOTP(np);
        if (res.otp) setDemoOtp(res.otp);
        setOtpActive(false);
        setTimeout(() => setOtpActive(true), 50);
        setOtp("");
        toast({ title: "OTP Resent", description: res.message });
      } catch (err: any) {
        toast({ title: "Failed to Resend", description: err.response?.data?.detail || "Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    } else if (screen.id === "email-verify") {
      setLoading(true);
      try {
        const res = await authService.requestEmailOTP(screen.email);
        if (res.otp) setDemoOtp(res.otp);
        setOtpActive(false);
        setTimeout(() => setOtpActive(true), 50);
        setOtp("");
        toast({ title: "OTP Resent", description: res.message });
      } catch (err: any) {
        toast({ title: "Failed to Resend", description: err.response?.data?.detail || "Please try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  // ── Strength bar color ──────────────────────────────────────────────────────
  const strengthColor =
    strength.score <= 1 ? "bg-destructive" :
    strength.score <= 2 ? "bg-amber-500" :
    strength.score <= 3 ? "bg-amber-400" :
    strength.score <= 4 ? "bg-emerald-500" :
    "bg-emerald-600";

  // ── OTP verification screen (shared for phone & email) ─────────────────────
  const renderOtpScreen = (
    label: string,
    destination: string,
    onVerify: () => void,
    onBack: () => void
  ) => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <BackButton onClick={onBack} disabled={loading} />
      </div>

      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Verify Your {label}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          A 6-digit code was sent to{" "}
          <span className="font-semibold text-foreground">{destination}</span>
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="otp" className="text-sm font-medium text-foreground">
          Enter OTP
        </Label>
        <OtpField value={otp} onChange={setOtp} disabled={loading} />

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Expires in{" "}
            <span className={`font-mono font-semibold ${remaining < 60 ? "text-destructive" : "text-foreground"}`}>
              {countdown}
            </span>
          </span>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-primary"
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
        onClick={onVerify}
        className="w-full"
        size="lg"
        disabled={loading || otp.length < 6}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying…
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Verify & Continue
          </>
        )}
      </Button>
    </div>
  );

  // ── Screen renderer ─────────────────────────────────────────────────────────
  const renderScreen = () => {
    switch (screen.id) {
      // ── Portal selection ────────────────────────────────────────────────────
      case "select":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Choose an Option</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select how you'd like to access the citizen portal.
              </p>
            </div>

            <div className="space-y-3">
              {/* Quick OTP */}
              <button
                onClick={() => { setScreen({ id: "otp-phone" }); setPhone(""); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-muted/50 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">Quick Access via OTP</p>
                  <p className="text-xs text-muted-foreground">No account needed — just your phone</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>

              {/* Register */}
              <button
                onClick={() => { setScreen({ id: "register" }); setPhone(""); }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-muted/50 hover:border-secondary/30 hover:bg-secondary/5 transition-all group text-left"
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-md shadow-secondary/20 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">Create Full Account</p>
                  <p className="text-xs text-muted-foreground">Permanent profile with complete features</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-secondary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => { setScreen({ id: "password-login" }); setPhone(""); setPassword(""); }}
                className="gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </Button>
              <Button
                variant="outline"
                onClick={() => { setScreen({ id: "email-login" }); setEmail(""); }}
                className="gap-2"
              >
                <Mail className="w-4 h-4" />
                Email OTP
              </Button>
            </div>
          </div>
        );

      // ── Phone entry for quick OTP ────────────────────────────────────────────
      case "otp-phone":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BackButton onClick={() => setScreen({ id: "select" })} disabled={loading} />
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Quick Access</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your mobile number to receive an OTP</p>
            </div>

            <PhoneField value={phone} onChange={setPhone} disabled={loading} id="quick-phone" />

            <Button
              onClick={handleRequestOtp}
              className="w-full"
              size="lg"
              disabled={loading || phone.length !== 10}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>
        );

      // ── OTP verify (quick) ───────────────────────────────────────────────────
      case "otp-verify":
        return renderOtpScreen(
          "Phone",
          `+91 ${screen.phone.replace("+91", "")}`,
          () => handleVerifyOtp(screen.phone),
          () => setScreen({ id: "otp-phone" })
        );

      // ── Registration form ────────────────────────────────────────────────────
      case "register":
        return (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <BackButton onClick={() => setScreen({ id: "select" })} disabled={loading} />
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/20">
                <User className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Create Account</h2>
              <p className="text-sm text-muted-foreground mt-1">Join {APP_CONFIG.appName} as a citizen</p>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="e.g. Aditya"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="e.g. Patil"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <PhoneField value={phone} onChange={setPhone} disabled={loading} id="reg-phone" />

            {/* Optional email */}
            <div className="space-y-2">
              <Label htmlFor="regEmail" className="text-sm font-medium flex items-center gap-2">
                Email Address
                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                id="regEmail"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="regPass" className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="regPass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  disabled={loading}
                  autoComplete="new-password"
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          i <= strength.score ? strengthColor : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {strength.score <= 2 ? "Weak" : strength.score <= 3 ? "Fair" : strength.score <= 4 ? "Good" : "Strong"} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="regConfirm" className="text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="regConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pr-10 ${
                    confirmPassword && password !== confirmPassword
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <div className="pt-1">
              <p className="text-xs text-muted-foreground bg-muted/60 p-3 rounded-lg">
                📱 An OTP will be sent to your mobile number to verify your account.
              </p>
            </div>

            <Button
              onClick={handleRegister}
              className="w-full"
              size="lg"
              disabled={loading || !strength.length || password !== confirmPassword}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account…</>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        );

      // ── OTP verify (registration) ────────────────────────────────────────────
      case "register-verify":
        return renderOtpScreen(
          "Phone",
          `+91 ${screen.phone.replace("+91", "")}`,
          () => handleVerifyRegisterOtp(screen.phone),
          () => setScreen({ id: "register" })
        );

      // ── Password login ───────────────────────────────────────────────────────
      case "password-login":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BackButton onClick={() => setScreen({ id: "select" })} disabled={loading} />
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in with your phone and password</p>
            </div>

            <div className="space-y-4">
              <PhoneField value={phone} onChange={setPhone} disabled={loading} id="login-phone" />

              <div className="space-y-2">
                <Label htmlFor="loginPass" className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="loginPass"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                    className="pr-10"
                    disabled={loading}
                    autoComplete="current-password"
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
              </div>
            </div>

            <Button
              onClick={handlePasswordLogin}
              className="w-full"
              size="lg"
              disabled={loading || phone.length !== 10 || !password}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing In…</>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        );

      // ── Email login (enter email) ─────────────────────────────────────────────
      case "email-login":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BackButton onClick={() => setScreen({ id: "select" })} disabled={loading} />
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Email Login</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll send a one-time code to your inbox</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emailInput" className="text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="emailInput"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRequestEmailOtp()}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <Button
              onClick={handleRequestEmailOtp}
              className="w-full"
              size="lg"
              disabled={loading || !email}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>
        );

      // ── Email OTP verify ─────────────────────────────────────────────────────
      case "email-verify":
        return renderOtpScreen(
          "Email",
          screen.email,
          () => handleVerifyEmailOtp(screen.email),
          () => setScreen({ id: "email-login" })
        );

      default:
        return null;
    }
  };

  const isOnSelect = screen.id === "select";

  return (
    <>
      <SEO
        title={`Citizen Login — ${APP_CONFIG.appName}`}
        description={`Sign in to ${APP_CONFIG.appName} to report civic issues, track resolution, and stay informed.`}
      />

      <div className="min-h-screen bg-background flex flex-col">
        {/* ── Navbar ────────────────────────────────────────────────────────── */}
        <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-foreground">{APP_CONFIG.appName}</h1>
                  <p className="text-[11px] text-muted-foreground hidden sm:block">Citizen Portal</p>
                </div>
              </button>

              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-muted-foreground">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Home</span>
              </Button>
            </div>
          </div>
        </header>

        {/* ── Main content ──────────────────────────────────────────────────── */}
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          {/* Background decoration */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="w-full max-w-md relative">
            {/* Hero header (only on select screen) */}
            {isOnSelect && (
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4 border border-primary/20">
                  <Phone className="w-3.5 h-3.5" />
                  Citizen Portal
                </div>
                <h2 className="text-2xl font-extrabold text-foreground">
                  Access Your Account
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Report issues, track progress, and stay informed
                </p>
              </div>
            )}

            <Card className="p-7 shadow-xl border bg-card">
              {/* Progress bar for multi-step flows */}
              {!isOnSelect && (
                <div className="h-0.5 bg-muted rounded-full mb-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                    style={{
                      width:
                        screen.id === "otp-phone" || screen.id === "register" ||
                        screen.id === "password-login" || screen.id === "email-login"
                          ? "50%"
                          : "100%",
                    }}
                  />
                </div>
              )}

              {renderScreen()}
            </Card>

            {/* Reset link */}
            {!isOnSelect && (
              <div className="text-center mt-4">
                <Button
                  variant="link"
                  size="sm"
                  onClick={resetForm}
                  className="text-muted-foreground text-xs"
                  disabled={loading}
                >
                  ← Start Over
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <footer className="border-t bg-card/50 py-5 text-center text-xs text-muted-foreground">
          {getCopyrightText()}
        </footer>
      </div>
    </>
  );
};

export default CitizenLogin;
