import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, Smartphone, Loader2, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { showToast } from "@/lib/utils/toast";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";

const VerifyPhone = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const phoneParam = searchParams.get("phone");
  const otpParam = searchParams.get("otp");

  const [otp, setOtp] = useState(otpParam || "");
  const [phone, setPhone] = useState(phoneParam || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (phoneParam && otpParam) {
      handleVerify(phoneParam, otpParam);
    }
  }, []);

  const handleVerify = async (targetPhone: string, targetOtp: string) => {
    if (!targetPhone || !targetOtp) return;
    
    setIsVerifying(true);
    setError(null);
    try {
      const res = await authService.verifyPhone(targetPhone, targetOtp);
      await login(res.access_token, res.refresh_token);
      setIsSuccess(true);
      showToast.success("Phone Verified Successfully");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/citizen/dashboard");
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Verification failed. The link or OTP may be invalid.";
      setError(msg);
      showToast.error("Verification Failed", { description: msg });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone && otp.length === 6) {
      handleVerify(phone, otp);
    } else {
      showToast.warning("Invalid Input", { description: "Please enter a valid phone number and 6-digit OTP." });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-2xl border-none bg-background/80 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-transform duration-500 scale-110 ${
              isSuccess ? 'bg-green-500 shadow-green-200 rotate-0' : 
              error ? 'bg-destructive shadow-destructive/20 rotate-12' : 
              'bg-primary shadow-primary/20 hover:rotate-3'
            }`}>
              {isVerifying ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : error ? (
                <AlertCircle className="w-10 h-10 text-white" />
              ) : (
                <Smartphone className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {isSuccess ? "Phone Verified!" : "Phone Verification"}
            </h1>
            <p className="text-muted-foreground">
              {isSuccess 
                ? "Your account is now fully active. Redirecting you to dashboard..." 
                : "Verify your mobile number to access all CivicLens features."
              }
            </p>
          </div>

          {!isSuccess && (
            <form onSubmit={handleManualVerify} className="space-y-4 text-left pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Phone Number</label>
                <Input
                  placeholder="+91XXXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isVerifying || !!phoneParam}
                  className="h-12 text-lg font-mono bg-muted/50 border-none shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">6-Digit OTP</label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  disabled={isVerifying}
                  className="h-12 text-center text-2xl tracking-[0.5em] font-mono bg-muted/50 border-none shadow-inner"
                  maxLength={6}
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isVerifying || otp.length < 6 || !phone}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </form>
          )}

          {error && !isVerifying && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-2">
              <p className="font-semibold mb-1 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error
              </p>
              <p>{error}</p>
              <Button 
                variant="link" 
                className="text-destructive font-bold h-auto p-0 mt-2"
                onClick={() => handleVerify(phone, otp)}
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Try Again
              </Button>
            </div>
          )}

          {!isVerifying && !isSuccess && (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:bg-transparent"
              onClick={() => navigate("/citizen/login")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VerifyPhone;
