import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { userService } from "@/services/userService";
import { showToast } from "@/lib/utils/toast";
import { logger } from "@/lib/logger";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage("No verification token found. Please check your link.");
        return;
      }

      try {
        setStatus('verifying');
        const response = await userService.verifyEmail(token);
        setStatus('success');
        setMessage(response.message || "Email verified successfully!");
        showToast.success("Email Verified", {
          description: "Your email address has been successfully verified."
        });
      } catch (error: any) {
        logger.error('Email verification failed:', error);
        setStatus('error');
        setMessage(error.response?.data?.detail || "Invalid or expired verification token.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-2xl border-primary/10 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative text-center">
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner ${
              status === 'verifying' ? 'bg-primary/10 animate-pulse' :
              status === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            }`}>
              {status === 'verifying' && <Loader2 className="w-10 h-10 text-primary animate-spin" />}
              {status === 'success' && <CheckCircle2 className="w-10 h-10 text-green-600" />}
              {status === 'error' && <XCircle className="w-10 h-10 text-red-600" />}
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            {status === 'verifying' ? 'Verifying Your Email' :
             status === 'success' ? 'Verification Successful!' :
             'Verification Failed'}
          </h1>

          <p className="text-muted-foreground mb-8 text-balance">
            {message || (status === 'verifying' ? 'Please wait while we confirm your email address...' : '')}
          </p>

          <div className="space-y-3">
            {status === 'success' && (
              <Button asChild className="w-full h-12 shadow-md">
                <Link to="/citizen/profile">
                  Go to Profile
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button asChild variant="outline" className="w-full h-12">
                  <Link to="/citizen/profile">
                    Return to Profile
                  </Link>
                </Button>
                <div className="pt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Need help? Contact support</span>
                </div>
              </>
            )}
            
            {status === 'verifying' && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground animate-pulse">
                <ShieldCheck className="w-4 h-4" />
                <span>Securing your account...</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VerifyEmail;
