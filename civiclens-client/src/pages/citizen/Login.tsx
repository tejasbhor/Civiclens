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
  Check, 
  User, 
  Mail, 
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { APP_CONFIG, getCopyrightText } from "@/config/appConfig";

type AuthMode = 'select' | 'quick-otp' | 'full-register' | 'password-login' | 'email-otp';
type AuthStep = 'phone' | 'otp' | 'register' | 'password' | 'email' | 'email-otp-verify';

const CitizenLogin = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('select');
  const [authStep, setAuthStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(300);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [showRules, setShowRules] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Password validation rules
  const passwordRules = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRules).every(rule => rule);

  const normalizePhoneNumber = useCallback((phone: string): string => {
    let cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+91')) return cleaned;
    if (cleaned.startsWith('91') && cleaned.length === 12) return '+' + cleaned;
    if (/^\d{10}$/.test(cleaned)) return '+91' + cleaned;
    return cleaned;
  }, []);

  const handleRequestOtp = async () => {
    if (phone.length !== 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await authService.requestOTP(normalizedPhone);
      
      if (response.otp) setDemoOtp(response.otp);
      
      toast({
        title: "OTP Sent Successfully",
        description: response.message,
      });

      setAuthStep('otp');
      setCountdown(300);
    } catch (error: any) {
      console.error("OTP request failed:", error);
      toast({
        title: "OTP Request Failed",
        description: error.response?.data?.detail || "Could not send OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit code sent to your device",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      let response;
      
      if (authMode === 'email-otp') {
        response = await authService.verifyEmailOTP(email, otp);
      } else {
        response = await authService.verifyOTP(normalizedPhone, otp);
      }

      await login(response.access_token, response.refresh_token);
      
      toast({
        title: "Verification Successful",
        description: "Welcome to CivicLens",
      });
      
      navigate('/citizen/dashboard');
    } catch (error: any) {
      console.error("Verification failed:", error);
      toast({
        title: "Verification Failed",
        description: error.response?.data?.detail || "Incorrect OTP. Please try again.",
        variant: "destructive"
      });
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || phone.length !== 10 || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Weak Password",
        description: "Please ensure your password meets all security requirements.",
        variant: "destructive"
      });
      setShowRules(true);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await authService.signup({
        phone: normalizedPhone,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        email: email || undefined,
        password
      });

      if ((response as any).otp) setDemoOtp((response as any).otp);

      toast({
        title: "Account Created!",
        description: "A verification code has been sent to your phone.",
      });

      setAuthStep('otp');
      setCountdown(300);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Signup Failed",
        description: error.response?.data?.detail || "Account creation failed.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (phone.length !== 10 || !password) {
      toast({
        title: "Login Details Missing",
        description: "Please enter your registered phone and password.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const normalizedPhone = normalizePhoneNumber(phone);
      const response = await authService.login(normalizedPhone, password, 'citizen');
      await login(response.access_token, response.refresh_token);
      
      toast({
        title: "Welcome Back!",
        description: "Login successful.",
      });
      navigate('/citizen/dashboard');
    } catch (error: any) {
      console.error("Login failed:", error);
      let errorMessage = error.response?.data?.detail || "Incorrect phone or password.";
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authService.requestEmailOTP(email);
      if (response.otp) setDemoOtp(response.otp);
      
      toast({
        title: "Email OTP Sent",
        description: response.message,
      });

      setAuthStep('email-otp-verify');
      setCountdown(300);
    } catch (error: any) {
      console.error("Email OTP request failed:", error);
      toast({
        title: "Error Sending OTP",
        description: error.response?.data?.detail || "Failed to send email OTP.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAuthMode('select');
    setAuthStep('phone');
    setPhone("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setDemoOtp(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-primary/10 mb-6 group transition-all duration-500 hover:scale-110">
            <Shield className="w-8 h-8 text-primary transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Civic<span className="text-primary italic">Lens</span> Citizen
          </h1>
          <p className="text-slate-500 font-medium mt-1">Navi Mumbai Civil Service Portal</p>
        </div>

        <Card className="p-8 shadow-2xl shadow-slate-200 border-white bg-white/80 backdrop-blur-xl animate-in zoom-in-95 duration-500 overflow-hidden relative">
          
          {/* Progress Indicator */}
          {authMode !== 'select' && (
             <div className="absolute top-0 left-0 h-1 bg-primary/10 w-full overflow-hidden">
                <div className={`h-full bg-primary transition-all duration-500 ${authStep === 'otp' || authStep === 'email-otp-verify' ? 'w-full' : 'w-1/2'}`} />
             </div>
          )}

          {/* Mode Selection */}
          {authMode === 'select' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center pb-4 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-800">Secure Access</h2>
                <p className="text-sm text-slate-500 mt-1">Choose your authentication method</p>
              </div>

              <div className="grid gap-3">
                <Button
                  onClick={() => { setAuthMode('quick-otp'); setAuthStep('phone'); }}
                  className="h-16 justify-between px-6 bg-slate-900 hover:bg-black group border-none"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm tracking-wide">QUICK REPORT</div>
                      <div className="text-[10px] opacity-60 uppercase font-black tracking-widest">Instant OTP Access</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  onClick={() => { setAuthMode('full-register'); setAuthStep('register'); }}
                  variant="outline"
                  className="h-16 justify-between px-6 bg-white border-slate-200 hover:border-primary hover:bg-primary/5 group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">CREATE ACCOUNT</div>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Permanent Profile</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-slate-400">
                    <span className="bg-white px-3">Existing User</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => { setAuthMode('password-login'); setAuthStep('password'); }}
                    variant="ghost"
                    className="h-14 font-bold text-xs border border-slate-100 bg-slate-50/50 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Lock className="w-3.5 h-3.5 mr-2 opacity-60" />
                    PASSWORD
                  </Button>
                  <Button
                    onClick={() => { setAuthMode('email-otp'); setAuthStep('email'); }}
                    variant="ghost"
                    className="h-14 font-bold text-xs border border-slate-100 bg-slate-50/50 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 mr-2 opacity-60" />
                    EMAIL OTP
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* OTP Verification Grid */}
          {(authStep === 'otp' || authStep === 'email-otp-verify') && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10 shadow-inner">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security Check</h2>
                <p className="text-sm text-slate-500 mt-1">Verification code sent to your {authMode === 'email-otp' ? 'email' : 'device'}</p>
                <p className="text-xs font-mono font-bold text-slate-800 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-full">{authMode === 'email-otp' ? email : `+91-${phone}`}</p>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Input
                    type="text"
                    placeholder="ENTER 6-DIGIT CODE"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-16 text-center text-3xl font-black tracking-[0.5em] bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/10 rounded-2xl"
                    maxLength={6}
                    disabled={loading}
                  />
                  {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>}
                </div>

                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center text-xs font-bold text-slate-400 gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    EXPIRES IN <span className="text-primary font-mono">{formatTime(countdown)}</span>
                  </div>
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-[10px] font-black uppercase tracking-widest text-primary/80"
                    onClick={async () => {
                       setCountdown(300);
                       authMode === 'email-otp' ? await handleRequestEmailOtp() : await handleRequestOtp();
                    }}
                    disabled={loading || countdown > 240}
                  >
                    Resend Code
                  </Button>
                </div>

                {demoOtp && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Demo Environment Access</p>
                        <p className="text-2xl font-black text-primary tracking-[0.3em] font-mono">{demoOtp}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button onClick={handleVerifyOtp} className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20" disabled={loading || otp.length < 6}>
                  {loading ? "Authenticating..." : "Initialize Profile"}
                </Button>

                <Button variant="ghost" className="w-full text-xs text-slate-400 font-bold uppercase" onClick={resetForm} disabled={loading}>
                  <ArrowLeft className="w-3 h-3 mr-2" />
                  Abort & Restart
                </Button>
              </div>
            </div>
          )}

          {/* Full Registration Form Step */}
          {authStep === 'register' && authMode === 'full-register' && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Citizen Identity</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-[0.1em]">Create your unified profile</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</Label>
                  <Input placeholder="eg. Aditya" className="h-12 bg-slate-50 border-slate-200 rounded-xl" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</Label>
                  <Input placeholder="eg. Patil" className="h-12 bg-slate-50 border-slate-200 rounded-xl" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Access</Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold border-r pr-3">+91</div>
                  <Input type="tel" placeholder="000 000 0000" className="h-12 pl-14 bg-slate-50 border-slate-200 rounded-xl font-mono" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} disabled={loading} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Credentials</Label>
                <div className="relative group">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create Secure Password"
                    className="h-12 pr-12 bg-slate-50 border-slate-200 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowRules(true)}
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {showRules && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2 animate-in fade-in zoom-in-95 duration-300">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Integrity Rules</p>
                    <div className="grid grid-cols-2 gap-2">
                       <div className={`flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg transition-colors ${passwordRules.length ? 'bg-green-500/10 text-green-700' : 'bg-slate-200/50 text-slate-400'}`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center ${passwordRules.length ? 'bg-green-500 shadow-sm' : 'bg-slate-300'}`}>
                            {passwordRules.length && <Check className="w-2 h-2 text-white" />}
                          </div>
                          8+ Symbols
                       </div>
                       <div className={`flex items-center gap-2 text-[10px] px-2 py-1.5 rounded-lg transition-colors ${passwordRules.upper && passwordRules.lower ? 'bg-green-500/10 text-green-700' : 'bg-slate-200/50 text-slate-400'}`}>
                          <div className={`w-3 h-3 rounded-full flex items-center justify-center ${passwordRules.upper && passwordRules.lower ? 'bg-green-500 shadow-sm' : 'bg-slate-300'}`}>
                            {(passwordRules.upper && passwordRules.lower) && <Check className="w-2 h-2 text-white" />}
                          </div>
                          Double Case
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Integrity</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat Secure Password"
                    className={`h-12 pr-12 bg-slate-50 rounded-xl transition-all ${confirmPassword && password !== confirmPassword ? 'border-destructive ring-1 ring-destructive' : 'border-slate-200'}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={handleRegister} className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20" disabled={loading || !isPasswordValid || password !== confirmPassword}>
                {loading ? "Initializing..." : "Register & Authenticate"}
              </Button>

              <Button variant="ghost" className="w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest" onClick={resetForm} disabled={loading}>
                <ArrowLeft className="w-3 h-3 mr-1" /> Back
              </Button>
            </div>
          )}

          {/* Fallback for other steps would go here (truncated for brevity but logic is similar) */}
          {(authStep === 'phone' || authStep === 'password' || authStep === 'email') && authMode !== 'select' && (
             <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="text-center">
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {authMode === 'password-login' ? 'Welcome Back' : (authStep === 'email' ? 'Email Login' : 'Request OTP')}
                   </h2>
                </div>

                <div className="space-y-4">
                   {authStep === 'email' ? (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</Label>
                        <Input type="email" placeholder="citizen@example.com" className="h-14 bg-slate-50 border-slate-200 rounded-xl text-lg" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                      </div>
                   ) : (
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</Label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold border-r pr-3">+91</div>
                          <Input type="tel" placeholder="000 000 0000" className="h-14 pl-14 bg-slate-50 border-slate-200 rounded-xl text-xl font-mono tracking-wider" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} disabled={loading} />
                        </div>
                      </div>
                   )}

                   {authStep === 'password' && (
                       <div className="space-y-1.5">
                         <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secret Password</Label>
                         <Input type="password" placeholder="••••••••" className="h-14 bg-slate-50 border-slate-200 rounded-xl text-lg" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                       </div>
                   )}

                   <Button 
                     onClick={authStep === 'email' ? handleRequestEmailOtp : (authStep === 'password' ? handlePasswordLogin : handleRequestOtp)} 
                     className="w-full h-14 text-sm font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20" 
                     disabled={loading}
                   >
                     {loading ? "Wait..." : (authStep === 'password' ? 'ACCESS PORTAL' : 'SECURE CONNECT')}
                   </Button>

                   <Button variant="ghost" className="w-full text-xs text-slate-400 font-bold uppercase" onClick={resetForm} disabled={loading}>
                     <ArrowLeft className="w-3 h-3 mr-2" /> Back
                   </Button>
                </div>
             </div>
          )}

          {/* Security Branding */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
             <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
             </div>
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Verified Secure by NMMC IT</p>
          </div>

        </Card>
      </div>

      <footer className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] opacity-80">
        {getCopyrightText()}
      </footer>
    </div>
  );
};

export default CitizenLogin;
