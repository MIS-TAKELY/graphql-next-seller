import { createAuthClient } from "better-auth/react"
import { usernameClient, phoneNumberClient, emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000"),
    plugins: [
        usernameClient(),
        phoneNumberClient(),
        emailOTPClient(),
        {
            id: "phone-password",
            getActions: (client) => ({
                signInPhone: async (data: { phone: string, password: string, rememberMe?: boolean }) => {
                    return client("/phone-password/phone-login", {
                        method: "POST",
                        body: data
                    })
                },
                sendForgotPasswordOtp: async (data: { identifier: string }) => {
                    return client("/phone-password/send-forgot-password-otp", {
                        method: "POST",
                        body: data
                    })
                },
                verifyForgotPasswordOtp: async (data: { identifier: string, otp: string }) => {
                    return client("/phone-password/verify-forgot-password-otp", {
                        method: "POST",
                        body: data
                    })
                },
                resetPasswordWithOtp: async (data: { identifier: string, otp: string, password: string }) => {
                    return client("/phone-password/reset-password-with-otp", {
                        method: "POST",
                        body: data
                    })
                }
            })
        }
    ]
})

export const { signIn, signUp, useSession, signOut, sendVerificationEmail } = authClient;
