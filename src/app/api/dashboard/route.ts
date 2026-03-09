import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets, ticketFeedback } from "@/db/schema";
import { sql, and, eq, count, avg } from "drizzle-orm";
import { parseFilters, buildFilterConditions } from "@/lib/filters";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const filters = parseFilters(searchParams);
        const conditions = buildFilterConditions(filters);

        // Client users can only see their own tickets
        if (user.role === "client" && user.clientId) {
            conditions.push(eq(tickets.clientId, user.clientId));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const openClause = whereClause ? and(eq(tickets.status, "open"), whereClause) : eq(tickets.status, "open");

        const rlsUserId = user ? user.id : null;

        return await withRLS(rlsUserId, async (dbTx) => {
            const [totalResult] = await dbTx
                .select({ count: count() })
                .from(tickets)
                .where(whereClause);

            const [openResult] = await dbTx
                .select({ count: count() })
                .from(tickets)
                .where(openClause);

            const [timeResult] = await dbTx
                .select({
                    avgResolution: sql<number>`AVG(EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600)`,
                })
                .from(tickets)
                .where(and(whereClause, sql`${tickets.resolvedAt} IS NOT NULL`));

            const [ratingResult] = await dbTx
                .select({ avgRating: sql<number>`AVG(${ticketFeedback.rating})` })
                .from(ticketFeedback)
                .innerJoin(tickets, eq(ticketFeedback.ticketId, tickets.id))
                .where(whereClause);

            return NextResponse.json({
                totalTickets: totalResult.count,
                openTickets: openResult.count,
                avgResolutionTime: timeResult.avgResolution ? parseFloat(Number(timeResult.avgResolution).toFixed(1)) : 0,
                avgSatisfaction: ratingResult.avgRating ? parseFloat(Number(ratingResult.avgRating).toFixed(1)) : 0,
            });
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}
