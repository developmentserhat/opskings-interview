import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const publicPaths = ["/login", "/register"];

// Routes that are always allowed (API auth, static assets)
const alwaysAllowedPrefixes = ["/api/auth", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Always allow auth API, static assets
    if (alwaysAllowedPrefixes.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    // Check for session cookie (BetterAuth uses this cookie name)
    const sessionToken =
        request.cookies.get("better-auth.session_token")?.value ||
        request.cookies.get("__Secure-better-auth.session_token")?.value;

    const isAuthenticated = !!sessionToken;
    const userRole = request.cookies.get("user_role")?.value || "client"; // Default to client if unknown

    // Allow public paths
    if (publicPaths.some((p) => pathname.startsWith(p))) {
        // If already authenticated, redirect away from login/register
        if (isAuthenticated) {
            const redirectPath = userRole === "internal" ? "/dashboard" : "/portal";
            return NextResponse.redirect(new URL(redirectPath, request.url));
        }
        return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // For authenticated users, enforce role-based routing using the cookie
    // Client users cannot access /dashboard/*
    if (userRole === "client" && pathname.startsWith("/dashboard")) {
        return NextResponse.redirect(new URL("/portal", request.url));
    }

    // Internal users cannot access /portal/*
    if (userRole === "internal" && pathname.startsWith("/portal")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Pass down the user role as a header so server components can access it instantly if needed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-role", userRole);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         * - public folder files
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
