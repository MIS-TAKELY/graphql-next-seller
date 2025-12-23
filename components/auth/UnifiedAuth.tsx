"use client";

import { useState, useEffect } from "react";
import { signIn, signUp, useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Mail, Phone, Loader2 } from "lucide-react";

type AuthStep = "SIGN_IN" | "SIGN_UP" | "EMAIL_PENDING" | "PHONE_OTP" | "PHONE_NUMBER";

export default function UnifiedAuth() {
    const { data: session, isPending, refetch } = useSession();
    const [step, setStep] = useState<AuthStep>("SIGN_IN");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const router = useRouter();

    // Handle step transitions based on session state
    useEffect(() => {
        if (!isPending && session) {
            if (!session.user.emailVerified) {
                setStep("EMAIL_PENDING");
            } else if (!(session.user as any).phoneVerified) {
                setStep("PHONE_NUMBER");
            } else if (!(session.user as any).hasProfile) {
                // If everything is verified but no profile, show a loading state
                // The middleware will handle the actual redirect
            }
        }
    }, [session, isPending, router]);

    // Timer for OTP
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === "PHONE_OTP" && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signIn.username({
                username,
                password,
            });
            if (error) {
                const errorMessage = error.message || "Failed to sign in";
                if (errorMessage.includes("Invalid")) {
                    toast.error("Invalid username or password. Please try again.");
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.success("Signed in successfully");
                await refetch();
            }
        } catch (err: any) {
            console.error("Sign in error:", err);
            toast.error("Unable to connect. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await signUp.email({
                email,
                password,
                username,
                name,
            });
            if (error) {
                const errorMessage = error.message || "Failed to sign up";
                if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
                    toast.error("This username or email is already registered. Please try another.");
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.success("Account created! Please check your email to verify.");
                setStep("EMAIL_PENDING");
                await refetch();
            }
        } catch (err: any) {
            console.error("Sign up error:", err);
            toast.error("Unable to connect. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await signIn.social({
                provider: "google",
            });
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            toast.error("Google sign-in failed. Please try again or use email/password.");
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validate phone number format
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phone || !phoneRegex.test(phone)) {
            toast.error("Please enter a valid phone number (e.g., +9779812345678)");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/otp/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("OTP sent to your WhatsApp");
                setStep("PHONE_OTP");
                setTimer(120);
                setCanResend(false);
            } else {
                const errorMessage = data.error || "Failed to send OTP";
                if (errorMessage.includes("already registered")) {
                    toast.error("This phone number is already registered to another account.");
                } else if (errorMessage.includes("Unauthorized")) {
                    toast.error("Your session has expired. Please sign in again.");
                } else {
                    toast.error(errorMessage);
                }
            }
        } catch (error) {
            console.error("Send OTP error:", error);
            toast.error("Unable to send OTP. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/otp/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Phone verified successfully! Redirecting...");
                // Refetch session to update phoneVerified status
                await refetch();
                // Trigger server-side redirect check
                router.refresh();
                // We don't need manual redirect anymore as middleware handles it,
                // but a small delay for feedback is good.
            } else {
                const errorMessage = data.error || "Invalid OTP";
                if (errorMessage.includes("expired")) {
                    toast.error("This code has expired. Please request a new one.");
                    setTimer(0);
                    setCanResend(true);
                } else if (errorMessage.includes("Invalid")) {
                    toast.error("Invalid code. Please check and try again.");
                } else if (errorMessage.includes("Unauthorized")) {
                    toast.error("Your session has expired. Please sign in again.");
                } else {
                    toast.error(errorMessage);
                }
            }
        } catch (error) {
            console.error("Verify OTP error:", error);
            toast.error("Unable to verify OTP. Please check your internet connection.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">Secure Connection</p>
                    <p className="text-sm text-muted-foreground animate-pulse">Verifying your session...</p>
                </div>
            </div>
        );
    }

    const renderSignIn = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Seller Portal</h2>
                <p className="text-sm text-muted-foreground">Welcome back! Please enter your details.</p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username_login">Username</Label>
                    <Input
                        id="username_login"
                        type="text"
                        required
                        disabled={loading}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="seller_jane"
                        className="bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all border-border/50"
                    />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        disabled={loading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-background/50 focus:ring-2 focus:ring-primary/20 transition-all border-border/50"
                    />
                </div>
                <Button type="submit" className="w-full text-base font-semibold py-6 h-auto transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign in to Dashboard"}
                </Button>
            </form>
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-4 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button variant="outline" className="w-full py-6 h-auto border-border/50 hover:bg-accent/50 transition-all" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="mr-3 h-5 w-5" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" /></svg>
                Continue with Google
            </Button>
            <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">New to Vanijay? </span>
                <button onClick={() => setStep("SIGN_UP")} className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">Create a seller account</button>
            </div>
        </div>
    );

    const renderSignUp = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Join Vanijay</h2>
                <p className="text-sm text-muted-foreground">Start reaching millions of customers today.</p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="username_signup">Username</Label>
                        <Input id="username_signup" required disabled={loading} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jane_seller" className="bg-background/50" />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" required disabled={loading} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="bg-background/50" />
                    </div>
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email_signup">Email Address</Label>
                    <Input id="email_signup" type="email" required disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" className="bg-background/50" />
                </div>
                <div className="space-y-1.5 mb-2">
                    <Label htmlFor="password_signup">Password</Label>
                    <Input id="password_signup" type="password" required disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-background/50" />
                    <p className="text-[10px] text-muted-foreground mt-1">Minimum 8 characters with at least one number.</p>
                </div>
                <Button type="submit" className="w-full text-base font-semibold py-6 h-auto transition-all hover:scale-[1.02] active:scale-[0.98] mt-2" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Seller Account"}
                </Button>
            </form>
            <div className="text-center text-sm pt-2">
                <span className="text-muted-foreground">Already have an account? </span>
                <button onClick={() => setStep("SIGN_IN")} className="font-semibold text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors">Sign in here</button>
            </div>
        </div>
    );

    const renderEmailPending = () => (
        <div className="text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative rounded-full bg-primary/10 p-6 border border-primary/20">
                        <Mail className="h-12 w-12 text-primary animate-bounce-subtle" />
                    </div>
                </div>
            </div>
            <div className="space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
                <div className="space-y-2">
                    <p className="text-muted-foreground">
                        We've sent a secure verification link to:
                    </p>
                    <p className="font-bold text-foreground text-lg">{session?.user.email}</p>
                </div>
            </div>
            <div className="space-y-4 pt-2">
                <Button variant="default" className="w-full py-6 h-auto text-base font-semibold shadow-lg shadow-primary/20" onClick={() => refetch()} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "I've clicked the link"}
                </Button>
                <div className="flex flex-col gap-3 pt-2">
                    <p className="text-xs text-muted-foreground">
                        Didn't see it? Check your <span className="font-medium">spam folder</span> or wait a minute.
                    </p>
                    <div className="h-px bg-border/50 w-full" />
                    <button
                        onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    >
                        Sign out and try another email
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPhoneNumber = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <div className="rounded-full bg-green-500/10 p-6 border border-green-500/20">
                        <Phone className="h-12 w-12 text-green-500" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Security Check</h2>
                <p className="text-muted-foreground">Protect your account with WhatsApp 2-factor authentication.</p>
            </div>
            <form onSubmit={sendOtp} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        required
                        disabled={loading}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +9779812345678"
                        className="bg-background/50 h-14 text-lg text-center tracking-wider"
                    />
                    <p className="text-[10px] text-center text-muted-foreground">Include country code (e.g. +977 for Nepal)</p>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-6 h-auto font-bold shadow-lg shadow-green-600/20" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Send Secure Code"}
                </Button>
                <div className="text-center pt-2">
                    <button
                        onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                        className="text-sm font-medium text-muted-foreground hover:text-red-500 transition-colors"
                    >
                        Cancel and sign out
                    </button>
                </div>
            </form>
        </div>
    );

    const renderPhoneOtp = () => (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-3">
                <div className="flex justify-center">
                    <div className="rounded-full bg-primary/10 p-6 border border-primary/20">
                        <CheckCircle2 className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">Verify Code</h2>
                <p className="text-sm text-muted-foreground">Enter the 6-digit code we sent to your WhatsApp <span className="font-bold text-foreground">{phone}</span></p>
            </div>
            <form onSubmit={verifyOtp} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="otp" className="sr-only">6-Digit Code</Label>
                    <Input
                        id="otp"
                        type="text"
                        required
                        maxLength={6}
                        disabled={loading}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="text-center h-20 text-4xl font-mono tracking-[0.5em] focus:ring-4 focus:ring-primary/10 border-2"
                        placeholder="000000"
                    />
                </div>
                <div className="space-y-4">
                    <Button type="submit" className="w-full text-lg py-6 h-auto font-bold shadow-xl shadow-primary/20" disabled={loading || (timer === 0 && !canResend)}>
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify & Continue"}
                    </Button>
                    <div className="flex items-center justify-between px-2">
                        {timer > 0 ? (
                            <p className="text-sm text-muted-foreground">Expires in <span className="font-mono font-medium text-primary">{formatTime(timer)}</span></p>
                        ) : (
                            <button type="button" onClick={() => sendOtp()} className="text-sm font-bold text-primary hover:underline">Resend secure code</button>
                        )}
                        <button type="button" onClick={() => setStep("PHONE_NUMBER")} className="text-sm font-medium text-muted-foreground hover:text-foreground">Change number</button>
                    </div>
                </div>
            </form>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-card/90 border border-border/50 rounded-2xl shadow-2xl backdrop-blur-xl p-8 md:p-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-50"></div>
                {step === "SIGN_IN" && renderSignIn()}
                {step === "SIGN_UP" && renderSignUp()}
                {step === "EMAIL_PENDING" && renderEmailPending()}
                {step === "PHONE_NUMBER" && renderPhoneNumber()}
                {step === "PHONE_OTP" && renderPhoneOtp()}
            </div>
            <p className="text-center mt-8 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-50">Secure Merchant Access • Vanijay Platform</p>
        </div>
    );
}
