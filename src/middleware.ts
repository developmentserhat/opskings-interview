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

    // Allow public paths
    if (publicPaths.some((p) => pathname.startsWith(p))) {
        // If already authenticated, redirect away from login/register
        if (isAuthenticated) {
            // Fetch role from the me endpoint
            try {
                const meUrl = new URL("/api/auth/me", request.url);
                const meResponse = await fetch(meUrl.toString(), {
                    headers: {
                        cookie: request.headers.get("cookie") || "",
                    },
                });

                if (meResponse.ok) {
                    const user = await meResponse.json();
                    const redirectPath = user.role === "internal" ? "/dashboard" : "/portal";
                    return NextResponse.redirect(new URL(redirectPath, request.url));
                }
            } catch {
                // If me endpoint fails, let them through
            }
        }
        return NextResponse.next();
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // For authenticated users, enforce role-based routing
    // We check role by calling the me endpoint
    try {
        const meUrl = new URL("/api/auth/me", request.url);
        const meResponse = await fetch(meUrl.toString(), {
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        });

        if (!meResponse.ok) {
            // Session invalid, clear and redirect to login
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        const user = await meResponse.json();

        // Client users cannot access /dashboard/*
        if (user.role === "client" && pathname.startsWith("/dashboard")) {
            return NextResponse.redirect(new URL("/portal", request.url));
        }

        // Internal users cannot access /portal/*
        if (user.role === "internal" && pathname.startsWith("/portal")) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    } catch {
        // On error, allow through (don't block authenticated users)
    }

    return NextResponse.next();
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
