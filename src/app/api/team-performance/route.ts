import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets, teamMembers, ticketFeedback } from "@/db/schema";
import { sql, eq, count, avg } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only internal users can see team performance
        if (user.role === "client") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const rlsUserId = user ? user.id : null;

        return await withRLS(rlsUserId, async (dbTx) => {
            const performanceData = await dbTx
                .select({
                    id: teamMembers.id,
                    username: teamMembers.username,
                    department: teamMembers.department,
                    status: teamMembers.status,
                    ticketsAssigned: sql<number>`COUNT(DISTINCT ${tickets.id})`,
                    ticketsResolved: sql<number>`COUNT(DISTINCT CASE WHEN ${tickets.status} = 'resolved' THEN ${tickets.id} END)`,
                    avgResolutionTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600)`,
                    avgRating: sql<number>`AVG(${ticketFeedback.rating})`,
                })
                .from(teamMembers)
                .leftJoin(tickets, eq(teamMembers.id, tickets.assignedTo))
                .leftJoin(ticketFeedback, eq(tickets.id, ticketFeedback.ticketId))
                .groupBy(teamMembers.id, teamMembers.username, teamMembers.department, teamMembers.status)
                .orderBy(sql`COUNT(DISTINCT ${tickets.id}) DESC`);

            const formattedData = performanceData.map((data: any) => ({
                id: data.id,
                username: data.username,
                department: data.department,
                status: data.status,
                ticketsAssigned: Number(data.ticketsAssigned),
                ticketsResolved: Number(data.ticketsResolved),
                avgResolutionTime: data.avgResolutionTime ? parseFloat(Number(data.avgResolutionTime).toFixed(1)) : 0,
                avgRating: data.avgRating ? parseFloat(Number(data.avgRating).toFixed(1)) : 0,
            }));

            return NextResponse.json(formattedData);
        });
    } catch (error) {
        console.error("Team performance API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch team performance" },
            { status: 500 }
        );
    }
}
