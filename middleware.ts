import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/api/auth",
    "/api/otp",
    "/api/webhook",
    "/",
];

export default async function middleware(request: NextRequest) {
    const { nextUrl } = request;

    // Enforce canonical domain (seller.vanijay.com)
    if (process.env.NODE_ENV === "production" && nextUrl.hostname === "vanijay.com") {
        // Note: If you want seller on a subdomain, redirect here. 
        // Assuming seller is at seller.vanijay.com or similar.
        // Buying app usually handles www.vanijay.com.
        // If this is the seller app, and it hits vanijay.com without subdomain, maybe it should redirect to seller.vanijay.com?
        // For now, mirroring buyer's canonical logic but for the specific seller host if known.
        if (nextUrl.hostname === "vanijay.com") {
            return NextResponse.redirect(new URL(`https://seller.vanijay.com${nextUrl.pathname}${nextUrl.search}`));
        }
    }

    // 0. Early return for public routes
    const isPublicRoute = publicRoutes.some(route =>
        nextUrl.pathname === route || nextUrl.pathname.startsWith(`${route}/`)
    );

    if (isPublicRoute || nextUrl.pathname === "/verify-phone" || nextUrl.pathname.startsWith("/api/graphql")) {
        return NextResponse.next();
    }

    // 1. Check session via Better Auth (Server-side check)
    try {
        const sessionResponse = await auth.api.getSession({
            headers: request.headers,
        });

        const session = sessionResponse;

        // Add hasProfile check if logged in
        if (session && session.user) {
            const sellerProfile = await prisma.sellerProfile.findUnique({
                where: { userId: session.user.id }
            });
            session.user.hasProfile = !!sellerProfile;
        }

        // 2. If not logged in
        if (!session || !session.user) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        // 2.5 If logged in, don't allow access to sign-in/sign-up
        if (nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname.startsWith("/sign-up")) {
            // Check verification status before redirecting to dashboard
            if (!session.user.phoneVerified) {
                return NextResponse.redirect(new URL("/verify-phone", request.url));
            }
            if (!session.user.hasProfile) {
                return NextResponse.redirect(new URL("/profileSetup", request.url));
            }
            return NextResponse.redirect(new URL("/", request.url));
        }

        // 3. If logged in but phone is not verified
        if (session.user && !session.user.phoneVerified) {
            return NextResponse.redirect(new URL("/verify-phone", request.url));
        }

        // 4. If logged in, phone verified, but no profile
        if (session.user && session.user.phoneVerified && !session.user.hasProfile) {
            if (nextUrl.pathname !== "/profileSetup") {
                return NextResponse.redirect(new URL("/profileSetup", request.url));
            }
        }

        // 5. If logged in, verified, and has profile, prevent access to profileSetup (optional but good UX)
        if (session.user && session.user.phoneVerified && session.user.hasProfile && nextUrl.pathname === "/profileSetup") {
            return NextResponse.redirect(new URL("/", request.url));
        }

    } catch (error) {
        console.error("Middleware session check failed:", error);
        // Fallback to sign-in on error
        if (!isPublicRoute) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
