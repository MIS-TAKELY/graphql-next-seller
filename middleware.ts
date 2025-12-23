import { NextResponse, type NextRequest } from "next/server";

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

    if (isPublicRoute || nextUrl.pathname === "/verify-phone") {
        return NextResponse.next();
    }

    // 1. Check session via fetch (edge-compatible)
    try {
        const sessionResponse = await fetch(`${nextUrl.origin}/api/auth/get-session`, {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });

        if (!sessionResponse.ok) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        const session = await sessionResponse.json();

        // 2. If not logged in
        if (!session || !session.user) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }

        // 3. If logged in but phone is not verified
        if (session.user && !session.user.phoneVerified) {
            if (nextUrl.pathname !== "/verify-phone") {
                return NextResponse.redirect(new URL("/verify-phone", request.url));
            }
            return NextResponse.next();
        }

        // 4. If phone is verified but profile is missing
        if (session.user && !session.user.hasProfile) {
            const isApiRoute = nextUrl.pathname.startsWith("/api");
            if (nextUrl.pathname !== "/profileSetup" && !isApiRoute) {
                return NextResponse.redirect(new URL("/profileSetup", request.url));
            }
            return NextResponse.next();
        }

        // 5. If profile exists and user is trying to access onboarding, redirect to dashboard
        if (session.user && session.user.hasProfile && nextUrl.pathname === "/profileSetup") {
            return NextResponse.redirect(new URL("/", request.url));
        }

    } catch (error) {
        console.error("Middleware session check failed:", error);
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
