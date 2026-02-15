import { createAuthEndpoint } from "@better-auth/core/api";
import { APIError } from "better-call";
import { setSessionCookie } from "better-auth/cookies";
import { BASE_ERROR_CODES } from "@better-auth/core/error";
import * as z from "zod";
import type { BetterAuthPlugin } from "better-auth";

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
        },
    } satisfies BetterAuthPlugin;
};
