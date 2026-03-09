import { NextRequest, NextResponse } from "next/server";
import { db, withRLS } from "@/db";
import { tickets, ticketFeedback } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth-utils";

export async function POST(
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

        return await withRLS(user.id, async (dbTx) => {
            // Verify ticket access for client users
            if (user.role === "client" && user.clientId) {
                const [ticket] = await dbTx
                    .select({ clientId: tickets.clientId })
                    .from(tickets)
                    .where(eq(tickets.id, ticketId));
                if (!ticket || ticket.clientId !== user.clientId) {
                    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
                }
            }

            const body = await request.json();
            const { rating, feedbackText } = body;

            const [newFeedback] = await dbTx
                .insert(ticketFeedback)
                .values({
                    ticketId,
                    rating,
                    feedbackText,
                })
                .returning();

            return NextResponse.json(newFeedback, { status: 201 });
        });
    } catch (error) {
        console.error("Create feedback error:", error);
        return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 });
    }
}
