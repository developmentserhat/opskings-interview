import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { clients, tickets, payments } from "@/db/schema";
import { sql, and, eq, count, desc, ilike } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only internal users can see all clients analysis
        if (user.role === "client") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const offset = (page - 1) * limit;

        const searchCondition = search
            ? ilike(clients.clientName, `%${search}%`)
            : undefined;

        const rlsUserId = user ? user.id : null;

        return await withRLS(rlsUserId, async (dbTx) => {
            const [rawTotalResult] = await dbTx
                .select({ count: count() })
                .from(clients)
                .where(searchCondition);

            // Cap total at 20 to strictly enforce "Top 20 clients" requirement
            const maxTotal = 20;
            const totalResultCount = Math.min(rawTotalResult.count, maxTotal);

            const results = await dbTx
                .select({
                    id: clients.id,
                    clientName: clients.clientName,
                    planType: clients.planType,
                    status: clients.status,
                    totalTickets: sql<number>`COUNT(DISTINCT ${tickets.id})`,
                    openTickets: sql<number>`COUNT(DISTINCT CASE WHEN ${tickets.status} = 'open' THEN ${tickets.id} END)`,
                    totalSpent: sql<number>`COALESCE(SUM(DISTINCT ${payments.amountUsd}), 0)`,
                    lastTicketDate: sql<string>`MAX(${tickets.createdAt})`,
                })
                .from(clients)
                .leftJoin(tickets, eq(tickets.clientId, clients.id))
                .leftJoin(payments, eq(payments.clientId, clients.id))
                .where(searchCondition)
                .groupBy(clients.id, clients.clientName, clients.planType, clients.status)
                .orderBy(desc(sql`COUNT(DISTINCT ${tickets.id})`))
                .limit(Math.min(limit, Math.max(0, maxTotal - offset))) // Don't fetch past the 20th item
                .offset(offset);

            const data = results.map((r: any) => ({
                id: r.id,
                clientName: r.clientName,
                planType: r.planType,
                status: r.status,
                totalTickets: Number(r.totalTickets),
                openTickets: Number(r.openTickets),
                totalSpent: parseFloat(Number(r.totalSpent).toFixed(2)),
                lastTicketDate: r.lastTicketDate,
            }));

            return NextResponse.json({
                data,
                pagination: {
                    page,
                    limit,
                    total: totalResultCount,
                    totalPages: Math.ceil(totalResultCount / limit),
                },
            });
        });
    } catch (error) {
        console.error("Client analysis API error:", error);
        return NextResponse.json(
            { error: "Failed to fetch client analysis" },
            { status: 500 }
        );
    }
}
