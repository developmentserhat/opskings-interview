import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets, ticketTypes } from "@/db/schema";
import { sql, and, eq, count } from "drizzle-orm";
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

        if (user.role === "client" && user.clientId) {
            conditions.push(eq(tickets.clientId, user.clientId));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const rlsUserId = user ? user.id : null;

        return await withRLS(rlsUserId, async (dbTx) => {
            const byType = await dbTx
                .select({
                    typeName: ticketTypes.typeName,
                    count: count(),
                })
                .from(tickets)
                .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
                .where(whereClause)
                .groupBy(ticketTypes.typeName)
                .orderBy(sql`count DESC`);

            const totalByType = byType.reduce((sum: number, r: any) => sum + r.count, 0);
            const byTypeData = byType.map((r: any) => ({
                name: r.typeName,
                value: r.count,
                percentage: totalByType > 0
                    ? parseFloat(((r.count / totalByType) * 100).toFixed(1))
                    : 0,
            }));

            const byPriority = await dbTx
                .select({
                    priority: tickets.priority,
                    status: tickets.status,
                    count: count(),
                })
                .from(tickets)
                .where(whereClause)
                .groupBy(tickets.priority, tickets.status)
                .orderBy(tickets.priority);

            const priorityOrder = ["urgent", "high", "medium", "low"];
            const byPriorityData = priorityOrder.map((p) => {
                const rows = byPriority.filter((r: any) => r.priority === p);
                const open = rows
                    .filter((r: any) => r.status === "open" || r.status === "in_progress")
                    .reduce((sum: number, r: any) => sum + r.count, 0);
                const closed = rows
                    .filter((r: any) => r.status === "resolved" || r.status === "closed")
                    .reduce((sum: number, r: any) => sum + r.count, 0);
                return { priority: p, open, closed };
            });

            return NextResponse.json({ byType: byTypeData, byPriority: byPriorityData });
        });
    } catch (error) {
        console.error("Ticket distribution API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch ticket distribution" },
            { status: 500 }
        );
    }
}
