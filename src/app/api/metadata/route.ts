import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { teamMembers, ticketTypes } from "@/db/schema";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const members = await db
            .select({
                id: teamMembers.id,
                username: teamMembers.username,
                department: teamMembers.department,
            })
            .from(teamMembers)
            .orderBy(teamMembers.username);

        const types = await db
            .select({
                id: ticketTypes.id,
                typeName: ticketTypes.typeName,
                department: ticketTypes.department,
                priority: ticketTypes.priority,
            })
            .from(ticketTypes)
            .orderBy(ticketTypes.typeName);

        return NextResponse.json({ teamMembers: members, ticketTypes: types });
    } catch (error) {
        console.error("Metadata API error:", error);
        return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
    }
}
