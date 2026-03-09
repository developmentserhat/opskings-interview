import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets, ticketTypes, clients, teamMembers } from "@/db/schema";
import { sql, eq, desc, and, ilike, count } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const offset = (page - 1) * limit;

        const conditions = [];

        // Client users can only see their own tickets
        if (user.role === "client" && user.clientId) {
            conditions.push(eq(tickets.clientId, user.clientId));
        } else if (user.role === "client") {
            // Client without linked client_id — show nothing
            return NextResponse.json({
                data: [],
                pagination: { page: 1, limit, total: 0, totalPages: 0 },
            });
        }

        // Allow internal users to filter by clientId param
        const clientIdParam = searchParams.get("clientId");
        if (clientIdParam && user.role === "internal") {
            conditions.push(eq(tickets.clientId, parseInt(clientIdParam)));
        }

        if (status && status !== "all") conditions.push(eq(tickets.status, status));
        if (search) conditions.push(ilike(tickets.title, `%${search}%`));

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const rlsUserId = user ? user.id : null;

        return await withRLS(rlsUserId, async (dbTx) => {
            const [totalResult] = await dbTx.select({ count: count() }).from(tickets).where(whereClause);

            const results = await dbTx
                .select({
                    id: tickets.id,
                    title: tickets.title,
                    status: tickets.status,
                    priority: tickets.priority,
                    createdAt: tickets.createdAt,
                    resolvedAt: tickets.resolvedAt,
                    clientName: clients.clientName,
                    typeName: ticketTypes.typeName,
                    assigneeName: teamMembers.username,
                })
                .from(tickets)
                .leftJoin(clients, eq(tickets.clientId, clients.id))
                .leftJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
                .leftJoin(teamMembers, eq(tickets.assignedTo, teamMembers.id))
                .where(whereClause)
                .orderBy(desc(tickets.createdAt))
                .limit(limit)
                .offset(offset);

            return NextResponse.json({
                data: results,
                pagination: {
                    page,
                    limit,
                    total: totalResult.count,
                    totalPages: Math.ceil(totalResult.count / limit),
                },
            });
        });
    } catch (error) {
        console.error("Tickets API error:", error);
        return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { ticketTypeId, title, priority } = body;

        // Determine client_id: for client users, use their linked client_id
        // For internal users, require clientId in body
        let clientId: number;
        if (user.role === "client") {
            if (!user.clientId) {
                return NextResponse.json({ error: "No client profile linked" }, { status: 400 });
            }
            clientId = user.clientId;
        } else {
            clientId = body.clientId;
            if (!clientId) {
                return NextResponse.json({ error: "clientId required for internal users" }, { status: 400 });
            }
        }

        return await withRLS(user.id, async (dbTx) => {
            const [newTicket] = await dbTx
                .insert(tickets)
                .values({
                    clientId,
                    ticketTypeId,
                    title,
                    priority: priority || "medium",
                    status: "open",
                })
                .returning();

            return NextResponse.json(newTicket, { status: 201 });
        });
    } catch (error) {
        console.error("Create ticket error:", error);
        return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
    }
}
