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
    console.log(`[Middleware] Processing ${request.method} ${request.nextUrl.pathname}`);
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
    // We check for both standard and secure cookies to support dev and prod
    const sessionToken = request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__Secure-better-auth.session_token");

    const isLoggedIn = !!sessionToken;

    // 2. If not logged in
    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // 2.5 If logged in, don't allow access to sign-in/sign-up
    if (nextUrl.pathname.startsWith("/sign-in") || nextUrl.pathname.startsWith("/sign-up")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // Note: Detailed verification checks (phone, profile) are handled in the application UI
    // to avoid expensive and fragile database/API calls in Edge Middleware, 
    // mirroring the buyer implementation.


    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
