import { createAuthEndpoint } from "@better-auth/core/api";
import { APIError } from "better-call";
import { setSessionCookie } from "better-auth/cookies";
import { BASE_ERROR_CODES } from "@better-auth/core/error";
import * as z from "zod";
import type { BetterAuthPlugin } from "better-auth";
import { senMail } from "@/services/nodeMailer.services";
import { sendWhatsAppOTP } from "@/lib/whatsapp";
import * as crypto from "crypto";

const signInPhoneBodySchema = z.object({
    phone: z.string().meta({ description: "The phone number of the user" }),
    password: z.string().meta({ description: "The password of the user" }),
    rememberMe: z.boolean().meta({ description: "Remember the user session" }).optional(),
});

export const phonePassword = () => {
    return {
        id: "phone-password",
        endpoints: {
            signInPhone: createAuthEndpoint("/phone-password/phone-login", {
                method: "POST",
                body: signInPhoneBodySchema,
            }, async (ctx) => {
                const { phone, password, rememberMe } = ctx.body;

                const phoneRegex = /^\+?[1-9]\d{7,14}$/;
                if (!phoneRegex.test(phone.replace(/\s|-/g, ""))) {
                    throw new APIError("BAD_REQUEST", { message: "Invalid phone number format" });
                }

                // 1. Find user by phone number
                // Note: The schema now uses 'phoneNumber' field
                const user = await ctx.context.adapter.findOne({
                    model: "user",
                    where: [{
                        field: "phoneNumber",
                        value: phone,
                    }]
                }) as any;

                if (!user) {
                    // Hash input password to prevent timing attacks
                    await ctx.context.password.hash(password);
                    throw new APIError("UNAUTHORIZED", { message: "Invalid phone number or password" });
                }

                // 2. Find credential account for the user
                const account = await ctx.context.adapter.findOne({
                    model: "account",
                    where: [
                        { field: "userId", value: user.id },
                        { field: "providerId", value: "credential" }
                    ]
                }) as any;

                if (!account || !account.password) {
                    throw new APIError("UNAUTHORIZED", { message: "Invalid phone number or password" });
                }

                // 3. Verify password
                const isPasswordValid = await ctx.context.password.verify({
                    hash: account.password,
                    password: password
                });

                if (!isPasswordValid) {
                    throw new APIError("UNAUTHORIZED", { message: "Invalid phone number or password" });
                }

                // 4. Check if phone is verified if required (optional, usually good to have)
                // For now we follow the user's request which is just "phone and password login"

                // 5. Create session
                const session = await ctx.context.internalAdapter.createSession(user.id, rememberMe === false);
                if (!session) {
                    throw new APIError("INTERNAL_SERVER_ERROR", { message: BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION });
                }

                // 6. Set session cookie
                await setSessionCookie(ctx, {
                    session,
                    user
                }, rememberMe === false);

                return ctx.json({
                    token: session.token,
                    user: {
                        id: user.id as string,
                        email: user.email as string,
                        name: user.name as string,
                        image: user.image as string | null,
                        phoneNumber: user.phoneNumber as string | null,
                        phoneNumberVerified: user.phoneNumberVerified as boolean,
                        createdAt: user.createdAt as Date,
                        updatedAt: user.updatedAt as Date
                    }
                });
            }),

            sendForgotPasswordOtp: createAuthEndpoint("/phone-password/send-forgot-password-otp", {
                method: "POST",
                body: z.object({
                    identifier: z.string(),
                }),
            }, async (ctx) => {
                const { identifier } = ctx.body;

                const isEmail = identifier.includes("@");

                if (isEmail) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(identifier)) {
                        throw new APIError("BAD_REQUEST", { message: "Please enter a valid email address" });
                    }
                } else {
                    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
                    if (!phoneRegex.test(identifier.replace(/\s|-/g, ""))) {
                        throw new APIError("BAD_REQUEST", { message: "Please enter a valid phone number" });
                    }
                }

                let user;

                if (isEmail) {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "email", value: identifier }]
                    }) as any;
                } else {
                    const cleanPhone = identifier.replace(/\s|-/g, "");
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "phoneNumber", value: cleanPhone }]
                    }) as any;
                }

                if (!user) {
                    throw new APIError("NOT_FOUND", { message: "No account found with this email or phone number" });
                }

                const account = await ctx.context.adapter.findOne({
                    model: "account",
                    where: [
                        { field: "userId", value: user.id },
                        { field: "providerId", value: "credential" }
                    ]
                }) as any;

                if (!account) {
                    throw new APIError("BAD_REQUEST", { message: "This account uses social login. Please sign in with Google or Facebook instead." });
                }

                const otp = crypto.randomInt(100000, 999999).toString();
                const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

                if (isEmail) {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: {
                            emailOtp: otp,
                            emailOtpExpiresAt: expiresAt
                        }
                    });
                    await senMail(user.email, "VERIFICATION_OTP", { otp, name: user.name || "Seller" });
                } else {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: {
                            otp: otp,
                            otpExpiresAt: expiresAt
                        }
                    });
                    await sendWhatsAppOTP(user.phoneNumber, otp);
                }

                return ctx.json({ success: true, isEmail });
            }),

            verifyForgotPasswordOtp: createAuthEndpoint("/phone-password/verify-forgot-password-otp", {
                method: "POST",
                body: z.object({
                    identifier: z.string(),
                    otp: z.string(),
                }),
            }, async (ctx) => {
                const { identifier, otp } = ctx.body;

                if (!/^\d{6}$/.test(otp)) {
                    throw new APIError("BAD_REQUEST", { message: "OTP must be a 6-digit number" });
                }

                const isEmail = identifier.includes("@");
                let user;

                if (isEmail) {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "email", value: identifier }]
                    }) as any;
                } else {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "phoneNumber", value: identifier }]
                    }) as any;
                }

                if (!user) {
                    throw new APIError("UNAUTHORIZED", { message: "Invalid Request" });
                }

                if (isEmail) {
                    if (!user.emailOtp || user.emailOtp !== otp || new Date() > new Date(user.emailOtpExpiresAt)) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid or expired OTP" });
                    }
                } else {
                    if (!user.otp || user.otp !== otp || new Date() > new Date(user.otpExpiresAt)) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid or expired OTP" });
                    }
                }

                return ctx.json({ success: true });
            }),

            resetPasswordWithOtp: createAuthEndpoint("/phone-password/reset-password-with-otp", {
                method: "POST",
                body: z.object({
                    identifier: z.string(),
                    otp: z.string(),
                    password: z.string().min(8, "Password must be at least 8 characters"),
                }),
            }, async (ctx) => {
                const { identifier, otp, password } = ctx.body;

                if (!/^\d{6}$/.test(otp)) {
                    throw new APIError("BAD_REQUEST", { message: "OTP must be a 6-digit number" });
                }

                if (password.length < 8) {
                    throw new APIError("BAD_REQUEST", { message: "Password must be at least 8 characters" });
                }

                const isEmail = identifier.includes("@");
                let user;

                if (isEmail) {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "email", value: identifier }]
                    }) as any;
                } else {
                    user = await ctx.context.adapter.findOne({
                        model: "user",
                        where: [{ field: "phoneNumber", value: identifier }]
                    }) as any;
                }

                if (!user) {
                    throw new APIError("UNAUTHORIZED", { message: "Invalid Request" });
                }

                if (isEmail) {
                    if (!user.emailOtp || user.emailOtp !== otp || new Date() > new Date(user.emailOtpExpiresAt)) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid or expired OTP" });
                    }
                } else {
                    if (!user.otp || user.otp !== otp || new Date() > new Date(user.otpExpiresAt)) {
                        throw new APIError("UNAUTHORIZED", { message: "Invalid or expired OTP" });
                    }
                }

                const hashedPassword = await ctx.context.password.hash(password);

                const account = await ctx.context.adapter.findOne({
                    model: "account",
                    where: [
                        { field: "userId", value: user.id },
                        { field: "providerId", value: "credential" }
                    ]
                }) as any;

                if (account) {
                    await ctx.context.adapter.update({
                        model: "account",
                        where: [{ field: "id", value: account.id }],
                        update: { password: hashedPassword }
                    });
                } else {
                    throw new APIError("BAD_REQUEST", { message: "Account not found" });
                }

                if (isEmail) {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: { emailOtp: null, emailOtpExpiresAt: null }
                    });
                } else {
                    await ctx.context.adapter.update({
                        model: "user",
                        where: [{ field: "id", value: user.id }],
                        update: { otp: null, otpExpiresAt: null }
                    });
                }

                return ctx.json({ success: true });
            }),
        },
    } satisfies BetterAuthPlugin;
};
