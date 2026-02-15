"use client";

import { useState, useEffect } from "react";
import { signIn, signUp, useSession, signOut, sendVerificationEmail } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, Mail, Phone, Loader2, Eye, EyeOff } from "lucide-react";
// import Logo from "../navbar/Logo"; // Seller app might not have this, omitting or using text

type AuthStep = "SIGN_IN" | "SIGN_UP" | "PHONE_OTP" | "PHONE_NUMBER" | "EMAIL_SENT";

export default function UnifiedAuth() {
    const { data: session, isPending, refetch } = useSession();
    const [step, setStep] = useState<AuthStep>("SIGN_IN");
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
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
            // Check verification first
            if (!(session.user as any).phoneNumberVerified) {
                if (step !== "PHONE_OTP") {
                    setStep("PHONE_NUMBER");
                }
            } else if (!(session.user as any).hasProfile) {
                // If verified but no profile, redirect to setup
                // Middleware handles this mostly, but good for client-side transition
                router.push("/profileSetup");
            } else {
                router.push("/");
            }
        }
    }, [session, isPending, router, step]);

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
            const isEmail = identifier.includes("@");
            const { error } = isEmail
                ? await signIn.email({
                    email: identifier,
                    password,
                })
                : await signIn.username({
                    username: identifier,
                    password,
                });

            if (error) {
                const errorMessage = error.message || "Failed to sign in";
                if (errorMessage.toLowerCase().includes("verify") || errorMessage.toLowerCase().includes("verified")) {
                    toast.error("Please verify your email before signing in.");
                    if (isEmail) {
                        setEmail(identifier);
                        setStep("EMAIL_SENT");
                    }
                } else if (errorMessage.includes("Invalid")) {
                    toast.error("Invalid credentials. Please try again.");
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

    const handleResendVerification = async () => {
        setLoading(true);
        try {
            const { error } = await sendVerificationEmail({
                email,
                callbackURL: window.location.origin
            });
            if (error) {
                toast.error(error.message || "Failed to resend email");
            } else {
                toast.success("Verification email resent!");
            }
        } catch (err) {
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const nameParts = name.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            const { error } = await signUp.email({
                email,
                password,
                name: name.trim(),
                username: email.split("@")[0] + "_" + Math.random().toString(36).slice(-5),
                firstName,
                lastName,
            } as any);
            if (error) {
                const errorMessage = error.message || "Failed to sign up";
                if (errorMessage.includes("already exists") || errorMessage.includes("duplicate")) {
                    toast.error("This username or email is already registered. Please try another.");
                } else {
                    toast.error(errorMessage);
                }
            } else {
                toast.success("Account created! Please check your email for verification.");
                setStep("EMAIL_SENT");
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
            toast.error("Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleFacebookSignIn = async () => {
        try {
            setLoading(true);
            await signIn.social({
                provider: "facebook",
            });
        } catch (error: any) {
            console.error("Facebook sign-in error:", error);
            toast.error("Facebook sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleTikTokSignIn = async () => {
        try {
            setLoading(true);
            await signIn.social({
                provider: "tiktok",
            });
        } catch (error: any) {
            console.error("TikTok sign-in error:", error);
            toast.error("TikTok sign-in failed. Please try again.");
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
                // Refetch session to update phoneNumberVerified status
                await refetch();
                // Trigger server-side redirect check
                router.refresh();
                // Small delay to ensure session is updated
                setTimeout(() => {
                    // Check profile status from session would be ideal, but usually verify -> profile setup for sellers
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
            <div className="text-center flex flex-col items-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Seller Portal</h2>
                <p className="mt-2 text-sm text-muted-foreground">Sign in to manage your store</p>
            </div>
            <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="identifier_login">Email or Username</Label>
                    <Input id="identifier_login" type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="name@example.com or seller123" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
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
            <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="w-full justify-start px-4" onClick={handleGoogleSignIn} disabled={loading}>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 488 512"><path fill="#EA4335" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" /></svg>
                    Continue with Google
                </Button>
                <Button variant="outline" className="w-full justify-start px-4" onClick={handleFacebookSignIn} disabled={loading}>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    Continue with Facebook
                </Button>
                <Button variant="outline" className="w-full justify-start px-4" onClick={handleTikTokSignIn} disabled={loading}>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.11-1.41-.01 2.31 0 4.62-.01 6.93 0 1.93-.45 3.96-1.8 5.37-1.35 1.41-3.38 2.06-5.3 2.13-1.91.07-3.95-.21-5.59-1.28-1.65-1.07-2.79-2.9-3.03-4.83-.24-1.93.07-4.01 1.25-5.63 1.18-1.63 3.12-2.61 5.12-2.78v4.11c-.5.06-1 .24-1.42.54-.42.3-.76.73-.9 1.21-.14.48-.13 1.01.07 1.47.2.46.56.84.99 1.08.43.24.95.34 1.44.29.49-.05.95-.27 1.3-.61.35-.34.58-.81.65-1.29.07-.48.01-1 .01-1.52 0-3.31.01-6.62.01-9.93z" /></svg>
                    Continue with TikTok
                </Button>
            </div>
            <div className="text-center text-sm">
                <span className="text-muted-foreground">New seller? </span>
                <button onClick={() => setStep("SIGN_UP")} className="font-medium text-primary hover:underline">Create account</button>
            </div>
        </div>
    );

    const renderSignUp = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center flex flex-col items-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Become a Seller</h2>
                <p className="mt-2 text-sm text-muted-foreground">Start selling on Vanijay</p>
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email_signup">Email address</Label>
                    <Input id="email_signup" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password_signup">Password</Label>
                    <div className="relative">
                        <Input
                            id="password_signup"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                        </button>
                    </div>
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


    const renderEmailSent = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-4">
                    <Mail className="h-10 w-10 text-primary" />
                </div>
            </div>
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground">
                We've sent a verification link to <span className="font-medium text-foreground">{email}</span>.
                Please click the link in the email to verify your account.
            </p>
            <div className="space-y-4">
                <Button onClick={() => setStep("PHONE_NUMBER")} className="w-full">
                    Continue to Phone Verification
                </Button>
                <div className="flex flex-col gap-2">
                    <button
                        onClick={handleResendVerification}
                        disabled={loading}
                        className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Resend verification email"}
                    </button>
                    <button
                        onClick={() => setStep("SIGN_UP")}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Back to Sign Up
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
                <p className="mt-2 text-sm text-muted-foreground">Enter your WhatsApp number to receive an OTP</p>
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
                <p className="mt-2 text-sm text-muted-foreground">Sent to {phone}</p>
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
                {step === "EMAIL_SENT" && renderEmailSent()}
                {step === "PHONE_NUMBER" && renderPhoneNumber()}
                {step === "PHONE_OTP" && renderPhoneOtp()}
            </div>
        </div>
    );
}
