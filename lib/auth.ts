import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { username } from "better-auth/plugins";
import { senMail } from "@/services/nodeMailer.services";
import { AuthUser, GoogleProfile, FacebookProfile, TikTokProfile } from "@/types/auth";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        username(),
    ],
    accountLinking: {
        enabled: true,
        trustedProviders: ["google", "facebook", "tiktok"],
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await prisma.userRole.create({
                        data: {
                            userId: user.id,
                            role: "SELLER",
                        },
                    });
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
    },
    user: {
        additionalFields: {
            phoneVerified: {
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
