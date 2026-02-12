import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Shield, Mail, User, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import { isCitizen } from "@/utils/authHelpers";
import { useAuthNavigation, getScreenTitle, getScreenSubtitle } from "@/hooks/useAuthNavigation";

const CitizenLoginNew = () => {
    const { current, push, pop, goToLanding, canGoBack } = useAuthNavigation();
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [countdown, setCountdown] = useState(300);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login, user, loading: authLoading } = useAuth();

    // Redirect if already logged in as citizen
    useEffect(() => {
        if (!authLoading && user) {
            if (isCitizen(user.role)) {
                navigate('/citizen/dashboard', { replace: true });
            } else {
                navigate('/officer/dashboard', { replace: true });
            }
        }
    }, [user, authLoading, navigate]);

    // Normalize phone number to backend format (+91XXXXXXXXXX)
    const normalizePhoneNumber = (phone: string): string => {
        const digits = phone.replace(/\D/g, '');

        if (digits.length === 10) {
            if (digits[0] === '0') {
                throw new Error('Phone number cannot start with 0');
            }
            return `+91${digits}`;
        }

        if (digits.length === 12 && digits.startsWith('91')) {
            return `+${digits}`;
        }

        if (phone.startsWith('+91')) {
            const cleaned = phone.replace(/\D/g, '').replace(/^91/, '');
            if (cleaned.length === 10 && cleaned[0] !== '0') {
                return `+91${cleaned}`;
            }
        }

        throw new Error('Invalid phone number format');
    };

    const handleRequestOtp = async () => {
        if (phone.length !== 10) {
            toast({
                title: "Invalid Phone Number",
                description: "Please enter a valid 10-digit phone number",
                variant: "destructive"
            });
            return;
        }

        if (phone[0] === '0') {
            toast({
                title: "Invalid Phone Number",
                description: "Phone number cannot start with 0",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const normalizedPhone = normalizePhoneNumber(phone);
            const response = await authService.requestOTP(normalizedPhone);
            toast({
                title: "OTP Sent!",
                description: response.message + (response.otp ? ` (Dev OTP: ${response.otp})` : ''),
            });

            // Navigate to OTP verification screen
            push({ type: 'QUICK_OTP_VERIFY', phone: normalizedPhone });

            // Start countdown
            setCountdown(300);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            if (error.message && error.message.includes('phone number')) {
                toast({
                    title: "Invalid Phone Number",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Error",
                    description: error.response?.data?.detail || error.message || "Failed to send OTP",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast({
                title: "Invalid OTP",
                description: "Please enter a valid 6-digit OTP",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        if (current.type === 'QUICK_OTP_VERIFY') {
            try {
                const response = await authService.verifyOTP(current.phone, otp);
                await login(response.access_token, response.refresh_token);
                toast({
                    title: "Quick Login Successful!",
                    description: "You can now file reports",
                });
                navigate('/citizen/dashboard');
            } catch (error: any) {
                toast({
                    title: "Verification Failed",
                    description: error.response?.data?.detail || "Invalid OTP",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        } else if (current.type === 'REGISTER_VERIFY') {
            try {
                const response = await authService.verifyPhone(current.phone, otp);
                await login(response.access_token, response.refresh_token);
                toast({
                    title: "Account Verified!",
                    description: "Welcome to CivicLens!",
                });
                navigate('/citizen/dashboard');
            } catch (error: any) {
                toast({
                    title: "Verification Failed",
                    description: error.response?.data?.detail || "Invalid OTP",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const handleRegister = async () => {
        if (!name || !password) {
            toast({
                title: "Missing Information",
                description: "Please fill in name and password",
                variant: "destructive"
            });
            return;
        }

        if (phone.length !== 10) {
            toast({
                title: "Invalid Phone Number",
                description: "Please enter a valid 10-digit phone number",
                variant: "destructive"
            });
            return;
        }

        if (phone[0] === '0') {
            toast({
                title: "Invalid Phone Number",
                description: "Phone number cannot start with 0",
                variant: "destructive"
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 8 characters",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const normalizedPhone = normalizePhoneNumber(phone);
            const response = await authService.signup({
                phone: normalizedPhone,
                full_name: name,
                email: email || undefined,
                password
            });

            const otpMessage = response.message +
                ((response as any).otp ? ` (Dev OTP: ${(response as any).otp})` : '');

            toast({
                title: "Account Created!",
                description: otpMessage,
                duration: 10000,
            });

            // Navigate to OTP verification
            push({ type: 'REGISTER_VERIFY', phone: normalizedPhone, name, email });

            // Start countdown
            setCountdown(300);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            if (error.message && error.message.includes('phone number')) {
                toast({
                    title: "Invalid Phone Number",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Registration Failed",
                    description: error.response?.data?.detail || error.message || "Failed to create account",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async () => {
        if (phone.length !== 10 || !password) {
            toast({
                title: "Invalid Credentials",
                description: "Please enter valid phone and password",
                variant: "destructive"
            });
            return;
        }

        if (phone[0] === '0') {
            toast({
                title: "Invalid Phone Number",
                description: "Phone number cannot start with 0",
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
                title: "Login Successful!",
                description: "Welcome back to CivicLens",
            });
            navigate('/citizen/dashboard');
        } catch (error: any) {
            if (error.message && error.message.includes('phone number')) {
                toast({
                    title: "Invalid Phone Number",
                    description: error.message,
                    variant: "destructive"
                });
            } else if (error.response?.data?.detail?.includes('Officer Portal')) {
                toast({
                    title: "Wrong Portal",
                    description: error.response.data.detail,
                    variant: "destructive",
                    duration: 6000,
                });
            } else {
                toast({
                    title: "Login Failed",
                    description: error.response?.data?.detail || error.message || "Invalid credentials",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleBack = () => {
        if (canGoBack) {
            pop();
        } else {
            goToLanding();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex flex-col">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-foreground">Citizen Login</h1>
                            <p className="text-xs text-muted-foreground">CivicLens Portal</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md p-8">
                    {/* Mode Selection */}
                    {current.type === 'SELECT_MODE' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{getScreenTitle(current)}</h2>
                                <p className="text-muted-foreground">{getScreenSubtitle(current)}</p>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => push({ type: 'QUICK_OTP_PHONE' })}
                                    className="w-full h-auto py-4 flex flex-col gap-2"
                                    size="lg"
                                >
                                    <Phone className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Quick Report</div>
                                        <div className="text-xs opacity-90">No account needed - Just phone verification</div>
                                    </div>
                                </Button>

                                <Button
                                    onClick={() => push({ type: 'REGISTER_FORM' })}
                                    variant="outline"
                                    className="w-full h-auto py-4 flex flex-col gap-2"
                                    size="lg"
                                >
                                    <User className="w-6 h-6" />
                                    <div>
                                        <div className="font-semibold">Create Full Account</div>
                                        <div className="text-xs opacity-90">Access all features with complete profile</div>
                                    </div>
                                </Button>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={() => push({ type: 'PASSWORD_LOGIN' })}
                                    variant="ghost"
                                    className="w-full"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Login with Password
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Quick OTP Phone Entry */}
                    {current.type === 'QUICK_OTP_PHONE' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                    <Phone className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{getScreenTitle(current)}</h2>
                                <p className="text-muted-foreground">{getScreenSubtitle(current)}</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Phone Number *</label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center px-3 py-2 bg-muted rounded-lg border text-sm font-medium">
                                            +91
                                        </div>
                                        <Input
                                            type="tel"
                                            placeholder="Enter 10-digit number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="flex-1"
                                            maxLength={10}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <Button onClick={handleRequestOtp} className="w-full" size="lg" disabled={loading}>
                                    {loading ? "Sending..." : "Request OTP"}
                                </Button>
                            </div>
                        </>
                    )}

                    {/* OTP Verification */}
                    {(current.type === 'QUICK_OTP_VERIFY' || current.type === 'REGISTER_VERIFY') && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{getScreenTitle(current)}</h2>
                                <p className="text-muted-foreground mb-2">{getScreenSubtitle(current)}</p>
                                <Button variant="link" size="sm" onClick={() => pop()}>
                                    Change Number
                                </Button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Enter 6-digit OTP</label>
                                    <Input
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="text-center text-2xl tracking-widest"
                                        maxLength={6}
                                        disabled={loading}
                                    />
                                    <div className="text-center mt-2 text-sm">
                                        <span className="text-muted-foreground">OTP expires in: </span>
                                        <span className="font-mono font-semibold text-primary">{formatTime(countdown)}</span>
                                    </div>
                                </div>

                                <Button onClick={handleVerifyOtp} className="w-full" size="lg" disabled={loading}>
                                    {loading ? "Verifying..." : "Verify & Continue"}
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Didn't receive the OTP?</p>
                                    <Button
                                        variant="link"
                                        onClick={async () => {
                                            setCountdown(300);
                                            await handleRequestOtp();
                                        }}
                                        disabled={loading}
                                    >
                                        Resend OTP
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Full Registration Form */}
                    {current.type === 'REGISTER_FORM' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{getScreenTitle(current)}</h2>
                                <p className="text-muted-foreground">{getScreenSubtitle(current)}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Phone Number *</label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center px-3 py-2 bg-muted rounded-lg border text-sm font-medium">
                                            +91
                                        </div>
                                        <Input
                                            type="tel"
                                            placeholder="Enter 10-digit number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="flex-1"
                                            maxLength={10}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Full Name *</label>
                                    <Input
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <span>Email Address</span>
                                        <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Create Password *</label>
                                    <Input
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="bg-muted/50 p-3 rounded-lg text-sm">
                                    <p className="text-muted-foreground">
                                        📱 You'll receive an OTP to verify your phone number after registration.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleRegister} className="w-full" size="lg" disabled={loading}>
                                        {loading ? "Creating Account..." : "Create Account"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Password Login */}
                    {current.type === 'PASSWORD_LOGIN' && (
                        <>
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">{getScreenTitle(current)}</h2>
                                <p className="text-muted-foreground">{getScreenSubtitle(current)}</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Phone Number *</label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center px-3 py-2 bg-muted rounded-lg border text-sm font-medium">
                                            +91
                                        </div>
                                        <Input
                                            type="tel"
                                            placeholder="Enter 10-digit number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="flex-1"
                                            maxLength={10}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">Password *</label>
                                    <Input
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handlePasswordLogin} className="w-full" size="lg" disabled={loading}>
                                        {loading ? "Logging in..." : "Login"}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            <footer className="border-t bg-card/50 py-6 text-center text-sm text-muted-foreground">
                © 2025 CivicLens. All rights reserved.
            </footer>
        </div>
    );
};

export default CitizenLoginNew;
