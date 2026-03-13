import { useState, useEffect, useCallback } from "react";
import { 
  Shield, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { isOfficer, isCitizen } from "@/utils/authHelpers";
import { APP_CONFIG, getCopyrightText } from "@/config/appConfig";

const OfficerLogin = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (isOfficer(user.role)) {
        navigate('/officer/dashboard', { replace: true });
      } else if (isCitizen(user.role)) {
        // Citizen trying to access officer portal - redirect to citizen dashboard
        navigate('/citizen/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const normalizePhoneNumber = useCallback((phone: string): string => {
    // Remove all spaces and dashes
    let cleaned = phone.replace(/[\s-]/g, '');

    // Backend pattern: ^\+?[1-9]\d{1,14}$
    // Expected format: +919876543210 (no dashes, no spaces)

    // If already starts with +91, remove any remaining dashes/spaces
    if (cleaned.startsWith('+91')) {
      return cleaned;
    }

    // If starts with 91 (12 digits total), add +
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return '+' + cleaned;
    }

    // If 10 digits, add +91 prefix
    if (/^\d{10}$/.test(cleaned)) {
      return '+91' + cleaned;
    }

    // Return cleaned version (will be validated)
    return cleaned;
  }, []);

  const validatePhoneNumber = useCallback((phone: string): { valid: boolean; error?: string } => {
    // Backend pattern: ^\+?[1-9]\d{1,14}$
    const pattern = /^\+?[1-9]\d{1,14}$/;

    if (!phone || phone.trim().length === 0) {
      return { valid: false, error: "Phone number is required" };
    }

    const normalized = normalizePhoneNumber(phone);

    if (!pattern.test(normalized)) {
      return {
        valid: false,
        error: "Please enter a valid phone number (10 digits or with +91 country code)"
      };
    }

    return { valid: true };
  }, [normalizePhoneNumber]);

  const validatePassword = useCallback((password: string): { valid: boolean; error?: string } => {
    if (!password || password.trim().length === 0) {
      return { valid: false, error: "Password is required" };
    }

    if (password.length < 8) {
      return { valid: false, error: "Password must be at least 8 characters" };
    }

    return { valid: true };
  }, []);

  // Real-time validation
  useEffect(() => {
    if (phone.length > 0) {
      const validation = validatePhoneNumber(phone);
      setPhoneError(validation.valid ? null : validation.error || null);
    } else {
      setPhoneError(null);
    }
  }, [phone, validatePhoneNumber]);

  useEffect(() => {
    if (password.length > 0) {
      const validation = validatePassword(password);
      setPasswordError(validation.valid ? null : validation.error || null);
    } else {
      setPasswordError(null);
    }
  }, [password, validatePassword]);

  const handleLogin = async () => {
    // Clear previous server-side errors
    setPhoneError(null);
    setPasswordError(null);

    // Validate inputs locally
    const phoneValidation = validatePhoneNumber(phone);
    const passwordValidation = validatePassword(password);

    if (!phoneValidation.valid || !passwordValidation.valid) {
      if (!phoneValidation.valid) setPhoneError(phoneValidation.error || null);
      if (!passwordValidation.valid) setPasswordError(passwordValidation.error || null);
      
      toast({
        title: "Validation Error",
        description: "Please check your login details.",
        variant: "destructive"
      });
      return;
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    try {
      setLoading(true);

      // Call authService.login to get tokens with officer portal type
      const response = await authService.login(normalizedPhone, password, 'officer');

      // Pass tokens to AuthContext login - this will fetch user data
      await login(response.access_token, response.refresh_token);

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
      } else {
        localStorage.removeItem('remember_me');
      }

      // Show success toast
      toast({
        title: "Login Successful",
        description: `Welcome back, Officer`,
      });

    } catch (error: any) {
      console.error("Officer login failed:", error);
      let errorMessage = "Invalid credentials. Please verify your phone number and password.";

      if (error.response?.data?.detail?.includes('Citizen Portal')) {
        errorMessage = error.response.data.detail;
        toast({
          title: "Wrong Portal",
          description: errorMessage,
          variant: "destructive",
          duration: 9000,
        });
        return;
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.detail || "Invalid phone number or password.";
        setPasswordError("Incorrect password");
      } else if (error.response?.status === 429) {
        errorMessage = "Too many login attempts. Please wait a few minutes.";
      } else if (error.response?.status === 423) {
        errorMessage = "Your account is temporarily locked. Please contact IT support.";
      } else if (error.response?.status === 422) {
        errorMessage = "Input validation failed. Please check your phone format.";
        setPhoneError("Invalid format");
      } else if (error.message === 'Network Error' || error.isNetworkError) {
        errorMessage = "Server unreachable. Please check your internet connection.";
      }

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setPassword(""); // Clear password for security
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header / Back Navigation */}
      <div className="absolute top-8 left-8 z-20">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-white transition-colors gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Portal Selection
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 group transition-all duration-500 hover:bg-primary/20 hover:scale-105 border border-primary/20 shadow-xl shadow-primary/10">
            <Shield className="w-10 h-10 text-primary transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 text-white">
            Officer <span className="text-primary italic">Portal</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-wide text-sm">
            SECURE ACCESS FOR NAVI MUMBAI PERSONNEL
          </p>
        </div>

        <Card className="p-8 shadow-2xl border-white/5 bg-slate-900/60 backdrop-blur-2xl animate-in zoom-in-95 duration-500">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">
                Authorized Mobile
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors flex items-center gap-2 border-r border-slate-700 pr-3">
                  <Phone className="w-4 h-4" />
                  <span className="text-xs font-bold">+91</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  className="pl-20 h-14 bg-slate-950/40 border-slate-700 focus:border-primary focus:ring-primary/20 transition-all rounded-xl text-white placeholder:text-slate-600 font-mono"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(value);
                  }}
                  disabled={loading}
                  aria-invalid={!!phoneError}
                />
              </div>
              {phoneError && (
                <p className="text-[10px] font-bold text-destructive mt-1 ml-1 animate-in slide-in-from-left-2 uppercase tracking-tight">{phoneError}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  Encrypted Password
                </Label>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors pr-3 border-r border-slate-700 h-6 flex items-center">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-14 pr-12 h-14 bg-slate-950/40 border-slate-700 focus:border-primary focus:ring-primary/20 transition-all rounded-xl text-white placeholder:text-slate-600"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  disabled={loading}
                  aria-invalid={!!passwordError}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </Button>
              </div>
              {passwordError && (
                <p className="text-[10px] font-bold text-destructive mt-1 ml-1 animate-in slide-in-from-left-2 uppercase tracking-tight">{passwordError}</p>
              )}
            </div>

            <div className="flex justify-between items-center py-1">
              <label className="flex items-center gap-3 cursor-pointer group select-none">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <div className="w-5 h-5 border-2 border-slate-700 rounded-lg bg-slate-950/20 peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                  <div className="absolute opacity-0 peer-checked:opacity-100 transition-opacity">
                    <ShieldCheck className="w-3 h-3 text-slate-950" />
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors">Keep me signed in</span>
              </label>
              <Button
                variant="link"
                className="p-0 h-auto text-xs font-bold text-primary/80 hover:text-primary transition-colors uppercase tracking-widest"
                onClick={() => {
                  toast({
                    title: "Access Restricted",
                    description: "Please visit the Department IT Cell for password reset services.",
                  });
                }}
                disabled={loading}
              >
                Reset Access?
              </Button>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full h-14 text-sm font-black rounded-xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] uppercase tracking-widest"
              disabled={loading || !phone || !password}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Decrypting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Initialize Secure Session</span>
                </div>
              )}
            </Button>

            {/* Premium Sandbox Credentials Section */}
            <div className="relative pt-6 pb-2">
              <div className="absolute inset-x-0 top-0 flex items-center justify-center">
                <div className="bg-slate-800/50 backdrop-blur px-3 py-1 rounded-full border border-slate-700 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Live Sandbox Access
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-1000">
              <Button
                variant="outline"
                size="sm"
                className="h-16 flex flex-col items-start justify-center px-4 bg-slate-800/20 border-slate-700 hover:bg-slate-800/40 hover:border-slate-600 rounded-2xl group transition-all text-left"
                onClick={() => {
                  setPhone("9876543210");
                  setPassword("Officer@123");
                  setPhoneError(null);
                  setPasswordError(null);
                  toast({
                    title: "Authorized Login",
                    description: "Field Officer credentials applied.",
                  });
                }}
                disabled={loading}
              >
                <div className="flex items-center gap-1.5 mb-1 group-hover:translate-x-1 transition-transform">
                  <LayoutGrid className="w-3 h-3 text-secondary" />
                  <span className="text-[9px] font-black text-secondary uppercase tracking-wider">Field Officer</span>
                </div>
                <span className="text-xs font-mono text-white font-bold tracking-tight">9876543210</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-16 flex flex-col items-start justify-center px-4 bg-slate-800/20 border-slate-700 hover:bg-slate-800/40 hover:border-slate-600 rounded-2xl group transition-all text-left"
                onClick={() => {
                  setPhone("9999999999");
                  setPassword("Admin123!");
                  setPhoneError(null);
                  setPasswordError(null);
                  toast({
                    title: "Admin Sandbox",
                    description: "Super Admin credentials applied.",
                  });
                }}
                disabled={loading}
              >
                <div className="flex items-center gap-1.5 mb-1 group-hover:translate-x-1 transition-transform">
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-[9px] font-black text-primary uppercase tracking-wider">System Admin</span>
                </div>
                <span className="text-xs font-mono text-white font-bold tracking-tight">9999999999</span>
              </Button>
            </div>
            
            <div className="flex items-center gap-3 px-4 pt-2 opacity-40">
              <div className="h-px flex-1 bg-slate-700" />
              <div className="flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse" />
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse delay-75" />
                 <div className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse delay-150" />
              </div>
              <div className="h-px flex-1 bg-slate-700" />
            </div>

            <p className="text-[9px] text-center text-slate-500 font-medium leading-relaxed px-4">
              All interactions within the <span className="text-slate-400">NMMC CivicLens Enterprise</span> environment are encrypted and audited for security compliance. Unauthorized access is strictly prohibited.
            </p>
          </div>
        </Card>
      </div>

      <footer className="mt-12 text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] opacity-40">
        {getCopyrightText()}
      </footer>
    </div>
  );
};

export default OfficerLogin;
