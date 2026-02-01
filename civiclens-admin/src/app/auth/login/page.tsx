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
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Error types for better UX
type ErrorType = 'network' | 'server' | 'auth' | 'validation' | 'rate-limit' | null;

interface LoginError {
  type: ErrorType;
  message: string;
  retryAfter?: number;
}

// Normalize phone number to match backend format (+91XXXXXXXXXX)
const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('91')) {
    return '+' + digits;
  }
  
  if (digits.length === 10) {
    return '+91' + digits;
  }
  
  return digits.startsWith('+') ? digits : '+' + digits;
};

// Validate phone number
const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.startsWith('91') && digits.length === 12);
};

// Validate password
const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuth();
  
  // Form state
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Error state
  const [error, setError] = useState<LoginError | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  
  // Validation state
  const [touched, setTouched] = useState({ phone: false, password: false });
  
  // Backend health check
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + '/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });
        setBackendStatus(response.ok ? 'online' : 'offline');
      } catch {
        setBackendStatus('offline');
      }
    };
    
    checkBackend();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Countdown timer for rate limiting
  useEffect(() => {
    if (retryCountdown > 0) {
      const timer = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (retryCountdown === 0 && error?.type === 'rate-limit') {
      setError(null);
    }
  }, [retryCountdown, error]);

  // Handle login
  const onLogin = useCallback(async () => {
    if (loading || !phone || !password) return;
    
    // Clear previous errors
    setError(null);
    
    // Validate inputs
    if (!validatePhone(phone)) {
      setError({
        type: 'validation',
        message: 'Please enter a valid 10-digit phone number'
      });
      return;
    }
    
    if (!validatePassword(password)) {
      setError({
        type: 'validation',
        message: 'Password must be at least 8 characters'
      });
      return;
    }
    
    try {
      setLoading(true);
      const normalizedPhone = normalizePhone(phone);
      const data = await authApi.login(normalizedPhone, password);
      
      // Update auth store
      setAuth(data.access_token, data.refresh_token || '', {
        id: data.user_id,
        role: data.role,
        phone: normalizedPhone,
      });
      
      toast.success("Welcome back!", {
        description: "Redirecting to dashboard..."
      });
      
      router.push('/dashboard');
    } catch (e: any) {
      setLoading(false);
      
      // Parse error and set appropriate message
      if (e.code === 'ERR_NETWORK' || e.message?.includes('Network Error')) {
        setError({
          type: 'network',
          message: 'Unable to connect to server. Please check your internet connection.'
        });
        setBackendStatus('offline');
      } else if (e.response?.status === 429) {
        const retryAfter = parseInt(e.response.headers['retry-after'] || '60');
        setError({
          type: 'rate-limit',
          message: `Too many login attempts. Please try again in ${retryAfter} seconds.`,
          retryAfter
        });
        setRetryCountdown(retryAfter);
      } else if (e.response?.status === 401 || e.response?.status === 403) {
        setError({
          type: 'auth',
          message: 'Invalid phone number or password. Please try again.'
        });
      } else if (e.response?.status === 422) {
        setError({
          type: 'validation',
          message: e.response?.data?.detail || 'Invalid input. Please check your credentials.'
        });
      } else if (e.response?.status >= 500) {
        setError({
          type: 'server',
          message: 'Server error. Please try again later or contact support.'
        });
      } else {
        setError({
          type: 'auth',
          message: e.response?.data?.detail || 'Login failed. Please try again.'
        });
      }
    }
  }, [loading, phone, password, setAuth, router]);

  // Get error icon and color
  const getErrorDisplay = (errorType: ErrorType) => {
    switch (errorType) {
      case 'network':
        return { icon: WifiOff, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
      case 'server':
        return { icon: Server, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'rate-limit':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'auth':
        return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'validation':
        return { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const isFormValid = validatePhone(phone) && validatePassword(password);
  const canSubmit = isFormValid && !loading && retryCountdown === 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl border-gray-200">
        {/* Header */}
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <CardTitle className="text-2xl">CivicLens Admin Portal</CardTitle>
          <CardDescription className="text-base mt-2">
            Secure access for government officials and administrators
          </CardDescription>
          
          {/* Backend Status Indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              backendStatus === 'online' && "bg-green-500 animate-pulse",
              backendStatus === 'offline' && "bg-red-500",
              backendStatus === 'checking' && "bg-yellow-500 animate-pulse"
            )} />
            <span className="text-xs text-gray-600">
              {backendStatus === 'online' && "System Online"}
              {backendStatus === 'offline' && "System Offline"}
              {backendStatus === 'checking' && "Checking Status..."}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Error Alert */}
          {error && (
            <div className={cn(
              "rounded-lg p-4 border animate-slide-in",
              getErrorDisplay(error.type).bg,
              getErrorDisplay(error.type).border
            )}>
              <div className="flex items-start gap-3">
                {React.createElement(getErrorDisplay(error.type).icon, {
                  className: cn("w-5 h-5 flex-shrink-0 mt-0.5", getErrorDisplay(error.type).color)
                })}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", getErrorDisplay(error.type).color)}>
                    {error.message}
                  </p>
                  {error.type === 'rate-limit' && retryCountdown > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Retry in {retryCountdown} seconds
                    </p>
                  )}
                  {error.type === 'network' && (
                    <p className="text-xs text-gray-600 mt-1">
                      Check your connection and try again
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Phone Number Input */}
          <div>
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error?.type === 'validation' || error?.type === 'auth') {
                  setError(null);
                }
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
                if (error?.type === 'validation' || error?.type === 'auth') {
                  setError(null);
                }
              }}
              onBlur={() => setTouched({ ...touched, password: true })}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && canSubmit) {
                  onLogin();
                }
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
              error={touched.password && !validatePassword(password) ? "Minimum 8 characters required" : undefined}
            />
          </div>

          {/* Login Button */}
          <Button 
            onClick={onLogin} 
            disabled={!canSubmit || backendStatus === 'offline'}
            loading={loading}
            fullWidth
            size="lg"
            className="mt-6"
          >
            {loading ? "Signing in..." : retryCountdown > 0 ? `Wait ${retryCountdown}s` : "Sign In"}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <a 
              href="/auth/forgot-password" 
              className="text-sm text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
            >
              Forgot your password?
            </a>
          </div>

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
                    <span>Your session is encrypted and secure</span>
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
        <p>CivicLens v2.0 • Secure Government Portal</p>
      </div>
    </div>
  );
}

