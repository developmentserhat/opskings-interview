import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { appUserProfile } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "internal" | "client";
    clientId: number | null;
    teamMemberId: number | null;
}

/**
 * Get the authenticated user from the request headers (server-side only).
 * Returns null if not authenticated.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) return null;

        // Get profile linking
        const [profile] = await db
            .select()
            .from(appUserProfile)
            .where(eq(appUserProfile.authUserId, session.user.id))
            .limit(1);

        const role = profile?.role || (session.user as { role?: string }).role || "client";

        return {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            role: role as "internal" | "client",
            clientId: profile?.clientId ?? null,
            teamMemberId: profile?.teamMemberId ?? null,
        };
    } catch {
        return null;
    }
}
