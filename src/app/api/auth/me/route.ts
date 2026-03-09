import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
    try {
        const user = await getAuthUser();

        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            clientId: user.clientId,
            teamMemberId: user.teamMemberId,
        });
    } catch (error) {
        console.error("Auth me error:", error);
        return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
    }
}
