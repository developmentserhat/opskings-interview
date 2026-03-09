import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets, ticketTypes } from "@/db/schema";
import { sql, and, eq } from "drizzle-orm";
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

        const baseCondition = sql`${tickets.resolvedAt} IS NOT NULL`;
        const whereClause =
            conditions.length > 0
                ? and(baseCondition, ...conditions)
                : baseCondition;

        const rlsUserId = user ? user.id : null;

        return await withRLS(rlsUserId, async (dbTx) => {
            const stats = await dbTx
                .select({
                    priority: tickets.priority,
                    count: sql<number>`COUNT(*)`,
                    minHours: sql<number>`MIN(EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600)`,
                    maxHours: sql<number>`MAX(EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600)`,
                    avgHours: sql<number>`AVG(EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600)`,
                    medianHours: sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600)`,
                    expectedHours: sql<number>`AVG(${ticketTypes.avgResolutionHours})`,
                })
                .from(tickets)
                .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
                .where(whereClause)
                .groupBy(tickets.priority);

            const priorityOrder = ["urgent", "high", "medium", "low"];
            const statisticsData = priorityOrder.map((p) => {
                const row = stats.find((r: any) => r.priority === p);
                return {
                    priority: p,
                    count: row ? Number(row.count) : 0,
                    minHours: row ? parseFloat(Number(row.minHours).toFixed(1)) : 0,
                    maxHours: row ? parseFloat(Number(row.maxHours).toFixed(1)) : 0,
                    avgHours: row ? parseFloat(Number(row.avgHours).toFixed(1)) : 0,
                    medianHours: row ? parseFloat(Number(row.medianHours).toFixed(1)) : 0,
                    expectedHours: row ? parseFloat(Number(row.expectedHours).toFixed(1)) : 0,
                };
            });

            const overdueTickets = await dbTx
                .select({
                    id: tickets.id,
                    title: tickets.title,
                    priority: tickets.priority,
                    actualHours: sql<number>`EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600`,
                    expectedHours: ticketTypes.avgResolutionHours,
                    typeName: ticketTypes.typeName,
                    createdAt: tickets.createdAt,
                    resolvedAt: tickets.resolvedAt,
                })
                .from(tickets)
                .innerJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
                .where(
                    and(
                        whereClause,
                        sql`EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600 > ${ticketTypes.avgResolutionHours}`
                    )
                )
                .orderBy(sql`EXTRACT(EPOCH FROM (${tickets.resolvedAt} - ${tickets.createdAt})) / 3600 DESC`)
                .limit(50);

            const overdueData = overdueTickets.map((t: any) => ({
                id: t.id,
                title: t.title,
                priority: t.priority,
                actualHours: parseFloat(Number(t.actualHours).toFixed(1)),
                expectedHours: t.expectedHours,
                typeName: t.typeName,
                createdAt: t.createdAt,
                resolvedAt: t.resolvedAt,
            }));

            return NextResponse.json({
                statistics: statisticsData,
                overdueTickets: overdueData,
            });
        });
    } catch (error) {
        console.error("Response time API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch response time data" },
            { status: 500 }
        );
    }
}
