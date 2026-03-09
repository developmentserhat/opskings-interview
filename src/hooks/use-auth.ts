"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    role: "internal" | "client";
    clientId: number | null;
    teamMemberId: number | null;
}

export function useAuth() {
    const { data: session, isPending: sessionLoading } = useSession();

    const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
        queryKey: ["auth-me"],
        queryFn: async () => {
            const res = await fetch("/api/auth/me");
            if (!res.ok) throw new Error("Not authenticated");
            return res.json();
        },
        enabled: !!session?.user,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    return {
        user: profile ?? null,
        session: session,
        isLoading: sessionLoading || profileLoading,
        isAuthenticated: !!session?.user && !!profile,
        isInternal: profile?.role === "internal",
        isClient: profile?.role === "client",
        role: profile?.role ?? null,
        clientId: profile?.clientId ?? null,
        teamMemberId: profile?.teamMemberId ?? null,
    };
}
