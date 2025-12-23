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
            }
            // Don't auto-redirect here - let the layout handle it
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
                // Layout will handle redirect to /profileSetup or dashboard
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
                // Small delay to ensure session is updated
                setTimeout(() => {
                    router.push("/profileSetup");
                }, 500);
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
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Checking authentication...</p>
            </div>
        );
    }

    const renderSignIn = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Seller Portal</h2>
                <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your store</p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username_login">Username</Label>
                    <Input id="username_login" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seller_jane" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Sign in
                </Button>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" /></svg>
                Sign in with Google
            </Button>
            <div className="text-center text-sm">
                <span className="text-muted-foreground">New seller? </span>
                <button onClick={() => setStep("SIGN_UP")} className="font-medium text-primary hover:underline">Create account</button>
            </div>
        </div>
    );

    const renderSignUp = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Become a Seller</h2>
                <p className="mt-2 text-sm text-muted-foreground">Start selling on Vanijay today</p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="username_signup">Username</Label>
                    <Input id="username_signup" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="seller_jane" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email_signup">Email address</Label>
                    <Input id="email_signup" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_signup">Password</Label>
                    <Input id="password_signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Seller Account
                </Button>
            </form>
            <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <button onClick={() => setStep("SIGN_IN")} className="font-medium text-primary hover:underline">Sign in</button>
            </div>
        </div>
    );

    const renderEmailPending = () => (
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                    <Mail className="h-10 w-10 text-primary" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verify your email</h2>
                <p className="text-muted-foreground">
                    We've sent a verification link to <span className="font-medium text-foreground">{session?.user.email}</span>.
                    Please check your inbox and click the link to continue.
                </p>
            </div>
            <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => refetch()} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    I've verified my email
                </Button>
                <p className="text-xs text-muted-foreground">
                    Didn't receive the email? Check your spam folder or contact support.
                </p>
                <div className="pt-4 border-t border-border/50">
                    <button
                        onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Sign out and try another email
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPhoneNumber = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-500/10 p-4">
                        <Phone className="h-10 w-10 text-green-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold">WhatsApp Verification</h2>
                <p className="mt-2 text-sm text-muted-foreground">Enter your WhatsApp number for 2-step verification</p>
            </div>
            <form onSubmit={sendOtp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp Number</Label>
                    <Input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +9779812345678" />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send OTP via WhatsApp
                </Button>
                <div className="text-center pt-4">
                    <button
                        onClick={() => signOut({ fetchOptions: { onSuccess: () => router.push("/") } })}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Cancel and sign out
                    </button>
                </div>
            </form>
        </div>
    );

    const renderPhoneOtp = () => (
        <div className="space-y-6 animate-in fade-in scale-95 duration-500">
            <div className="text-center">
                <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-500/10 p-4 animate-pulse">
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold">Enter OTP</h2>
                <p className="mt-2 text-sm text-muted-foreground">Verification code sent to {phone}</p>
            </div>
            <form onSubmit={verifyOtp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="otp">6-Digit Code</Label>
                    <Input id="otp" type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="text-center text-2xl tracking-[0.5em]" placeholder="000000" />
                </div>
                <div className="space-y-4">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading || (timer === 0 && !canResend)}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Verify OTP
                    </Button>
                    {timer > 0 ? (
                        <p className="text-center text-sm text-muted-foreground">Resend in <span className="font-medium text-primary">{formatTime(timer)}</span></p>
                    ) : (
                        <button type="button" onClick={() => sendOtp()} className="w-full text-sm font-medium text-primary hover:underline">Resend OTP</button>
                    )}
                    <Button variant="ghost" className="w-full" onClick={() => setStep("PHONE_NUMBER")}>Change Number</Button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto overflow-hidden">
            <div className="bg-card/80 border border-border/50 rounded-xl shadow-2xl backdrop-blur-md p-8">
                {step === "SIGN_IN" && renderSignIn()}
                {step === "SIGN_UP" && renderSignUp()}
                {step === "EMAIL_PENDING" && renderEmailPending()}
                {step === "PHONE_NUMBER" && renderPhoneNumber()}
                {step === "PHONE_OTP" && renderPhoneOtp()}
            </div>
        </div>
    );
}
