import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets, ticketTypes, clients, teamMembers, ticketMessages, ticketFeedback } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth-utils";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const ticketId = parseInt(id);

        const rlsUserId = user ? user.id : null;

        return await withRLS(rlsUserId, async (dbTx) => {
            const [ticket] = await dbTx
                .select({
                    id: tickets.id,
                    title: tickets.title,
                    status: tickets.status,
                    priority: tickets.priority,
                    createdAt: tickets.createdAt,
                    resolvedAt: tickets.resolvedAt,
                    closedAt: tickets.closedAt,
                    clientId: tickets.clientId,
                    clientName: clients.clientName,
                    typeName: ticketTypes.typeName,
                    assigneeName: teamMembers.username,
                    assigneeId: teamMembers.id,
                })
                .from(tickets)
                .leftJoin(clients, eq(tickets.clientId, clients.id))
                .leftJoin(ticketTypes, eq(tickets.ticketTypeId, ticketTypes.id))
                .leftJoin(teamMembers, eq(tickets.assignedTo, teamMembers.id))
                .where(eq(tickets.id, ticketId));

            if (!ticket) {
                return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
            }

            // Client users can only view their own tickets
            if (user.role === "client" && user.clientId && ticket.clientId !== user.clientId) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            const messages = await dbTx
                .select({
                    id: ticketMessages.id,
                    fromClient: ticketMessages.fromClient,
                    fromTeamMemberId: ticketMessages.fromTeamMemberId,
                    messageText: ticketMessages.messageText,
                    createdAt: ticketMessages.createdAt,
                    teamMemberName: teamMembers.username,
                })
                .from(ticketMessages)
                .leftJoin(teamMembers, eq(ticketMessages.fromTeamMemberId, teamMembers.id))
                .where(eq(ticketMessages.ticketId, ticketId))
                .orderBy(asc(ticketMessages.createdAt));

            const [feedback] = await dbTx
                .select()
                .from(ticketFeedback)
                .where(eq(ticketFeedback.ticketId, ticketId));

            return NextResponse.json({
                ticket,
                messages,
                feedback: feedback || null,
            });
        });
    } catch (error) {
        console.error("Ticket detail API error:", error);
        return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
    }
}
