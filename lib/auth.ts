import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    plugins: [
        username(),
    ],
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
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
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
            username: {
                type: "string",
                required: false,
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
            mapProfileToUser: (profile: any) => {
                const uniqueId = profile.id || profile.sub || Math.random().toString(36).slice(-5);
                return {
                    username: (profile.email.split("@")[0] + "_" + uniqueId.slice(-5)).toLowerCase(),
                    firstName: profile.given_name,
                    lastName: profile.family_name,
                };
            },
        },
    },
    events: {
        signIn: {
            succeeded: async ({ user }: { user: any }) => {
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
