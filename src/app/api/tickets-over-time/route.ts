import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets } from "@/db/schema";
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
            const createdCounts = await dbTx
                .select({
                    month: sql<number>`EXTRACT(MONTH FROM ${tickets.createdAt})`.as("month"),
                    count: count(),
                })
                .from(tickets)
                .where(and(whereClause, sql`EXTRACT(YEAR FROM ${tickets.createdAt}) = 2025`))
                .groupBy(sql`EXTRACT(MONTH FROM ${tickets.createdAt})`)
                .orderBy(sql`EXTRACT(MONTH FROM ${tickets.createdAt})`);

            const resolvedCounts = await dbTx
                .select({
                    month: sql<number>`EXTRACT(MONTH FROM ${tickets.resolvedAt})`.as("month"),
                    count: count(),
                })
                .from(tickets)
                .where(
                    and(
                        whereClause,
                        sql`${tickets.resolvedAt} IS NOT NULL`,
                        sql`EXTRACT(YEAR FROM ${tickets.resolvedAt}) = 2025`
                    )
                )
                .groupBy(sql`EXTRACT(MONTH FROM ${tickets.resolvedAt})`)
                .orderBy(sql`EXTRACT(MONTH FROM ${tickets.resolvedAt})`);

            const months = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];

            const result = months.map((monthName, index) => {
                const monthNum = index + 1;
                const created = createdCounts.find((c: any) => Number(c.month) === monthNum)?.count || 0;
                const resolved = resolvedCounts.find((c: any) => Number(c.month) === monthNum)?.count || 0;

                return {
                    month: monthName,
                    created: Number(created),
                    resolved: Number(resolved),
                };
            });

            return NextResponse.json(result);
        });
    } catch (error) {
        console.error("Tickets over time API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch tickets over time" },
            { status: 500 }
        );
    }
}
