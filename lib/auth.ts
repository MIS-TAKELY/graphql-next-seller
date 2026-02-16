import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { username, phoneNumber, emailOTP } from "better-auth/plugins";
import { phonePassword } from "./auth-plugins/phone-password";
import { senMail } from "@/services/nodeMailer.services";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import { AuthUser, GoogleProfile, FacebookProfile, TikTokProfile } from "@/types/auth";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        username(),
        phoneNumber({
            sendOTP: async ({ phoneNumber, code }) => {
                const phoneRegex = /^\+?[1-9]\d{7,14}$/;
                if (!phoneRegex.test(phoneNumber.replace(/\s|-/g, ""))) {
                    throw new Error("Invalid phone number format");
                }
                await sendWhatsAppOTP(phoneNumber, code);
            },
        }),
        emailOTP({
            sendVerificationOTP: async ({ email, otp, type }) => {
                await senMail(email, "VERIFICATION_OTP", { otp, name: "Seller" });
            },
        }),
        phonePassword(),
    ],
    accountLinking: {
        enabled: true,
        trustedProviders: ["google", "facebook", "tiktok"],
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (!user.name && user.email) {
                        user.name = user.email.split("@")[0];
                    }
                    if (!user.username || (typeof user.username === 'string' && user.username.trim() === "")) {
                        const randomId = Math.random().toString(36).substring(2, 7);
                        const emailPrefix = user.email ? user.email.split("@")[0] : "seller";
                        user.username = (emailPrefix + "_" + randomId).toLowerCase().replace(/[^a-z0-9_]/g, "");
                    }
                    if (user.phoneNumber) {
                        user.phoneNumberVerified = true;
                    }
                    return { data: user };
                },
                after: async (user) => {
                    try {
                        await prisma.userRole.create({
                            data: {
                                userId: user.id,
                                role: "SELLER",
                            },
                        });
                    } catch (err) {
                        console.error("BETTER-AUTH: Error creating SELLER role:", err);
                    }
                },
            },
        },
    },
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "https://seller.vanijay.com",
        "https://www.vanijay.com",
        "https://vanijay.com",
    ],
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000"),
    advanced: {
        useSecureCookies: true,
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }: { user: AuthUser; url: string }) => {
            console.log("BETTER-AUTH: triggering sendVerificationEmail for", user.email);
            try {
                // Use first name or split email for fallback name
                const name = user.firstName || user.name || user.email.split("@")[0];
                await senMail(user.email, "VERIFICATION", { url, name });
                console.log("BETTER-AUTH: senMail call completed");
            } catch (err) {
                console.error("BETTER-AUTH: Error in sendVerificationEmail hook:", err);
            }
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 600,
        sendResetPassword: async ({ user, url }: { user: AuthUser; url: string }) => {
            try {
                const name = user.firstName || user.name || user.email.split("@")[0];
                await senMail(user.email, "PASSWORD_RESET", { url, name });
            } catch (err) {
                console.error("BETTER-AUTH: Error in sendResetPassword hook:", err);
            }
        },
    },
    user: {
        additionalFields: {
            phoneNumberVerified: {
                type: "boolean",
                required: false,
                defaultValue: false,
            },
            otp: {
                type: "string",
                required: false,
            },
            otpExpiresAt: {
                type: "date",
                required: false,
            },
            emailOtp: {
                type: "string",
                required: false,
            },
            emailOtpExpiresAt: {
                type: "date",
                required: false,
            },
            firstName: {
                type: "string",
                required: false,
            },
            lastName: {
                type: "string",
                required: false,
            },
            avatarImageUrl: {
                type: "string",
                required: false,
            },
            phoneNumber: {
                type: "string",
                required: false,
            },

            hasProfile: {
                type: "boolean",
                required: false,
                defaultValue: false,
                returned: true, // Make sure better-auth knows to return this if possible, although we check it in the API route manually.
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ],
            mapProfileToUser: (profile: GoogleProfile) => {
                const uniqueId = profile.id || profile.sub || Math.random().toString(36).slice(-5);
                return {
                    username: (profile.email.split("@")[0] + "_" + uniqueId.slice(-5)).toLowerCase(),
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                };
            },
        },
        facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
            mapProfileToUser: (profile: FacebookProfile) => {
                const uniqueId = profile.id || Math.random().toString(36).slice(-5);
                const email = profile.email || `${uniqueId}@facebook.com`;
                return {
                    username: (email.split("@")[0] + "_" + uniqueId.slice(-5)).toLowerCase(),
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    emailVerified: true,
                };
            },
        },
        tiktok: {
            clientId: process.env.TIKTOK_CLIENT_ID as string,
            clientSecret: process.env.TIKTOK_CLIENT_SECRET as string,
            mapProfileToUser: (profile: TikTokProfile) => {
                const uniqueId = profile.open_id || profile.id || Math.random().toString(36).slice(-5);
                const display_name = profile.display_name || "TikTok User";
                return {
                    username: ("tiktok_" + uniqueId.slice(-10)).toLowerCase(),
                    firstName: display_name.split(" ")[0],
                    lastName: display_name.split(" ").slice(1).join(" ") || "",
                    emailVerified: true,
                };
            },
        },
    } as any,
    events: {
        signIn: {
            succeeded: async ({ user }: { user: AuthUser }) => {
                const roleExists = await prisma.userRole.findUnique({
                    where: {
                        userId_role: {
                            userId: user.id,
                            role: "SELLER",
                        },
                    },
                });

                if (!roleExists) {
                    await prisma.userRole.create({
                        data: {
                            userId: user.id,
                            role: "SELLER",
                        },
                    });
                }
            },
        },
    },
});
