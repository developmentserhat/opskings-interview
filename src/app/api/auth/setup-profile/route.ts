import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-utils";
import { db } from "@/db";
import { appUserProfile, user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
    try {
        const session = await getAuthUser();
        if (!session) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { role } = await request.json();
        if (!role || !["internal", "client"].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        // Update the user role in the user table
        await db
            .update(userTable)
            .set({ role })
            .where(eq(userTable.id, session.id));

        // Check if profile already exists
        const [existing] = await db
            .select()
            .from(appUserProfile)
            .where(eq(appUserProfile.authUserId, session.id))
            .limit(1);

        if (!existing) {
            // Create the app_user_profile record
            await db.insert(appUserProfile).values({
                authUserId: session.id,
                role,
            });
        } else {
            // Update existing profile
            await db
                .update(appUserProfile)
                .set({ role })
                .where(eq(appUserProfile.authUserId, session.id));
        }

        return NextResponse.json({ success: true, role });
    } catch (error) {
        console.error("Setup profile error:", error);
        return NextResponse.json({ error: "Failed to setup profile" }, { status: 500 });
    }
}
