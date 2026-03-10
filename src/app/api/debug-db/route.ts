import { NextResponse } from "next/server";
import postgres from "postgres";

export const runtime = "nodejs";

export async function GET() {
    const url = process.env.DATABASE_URL;

    if (!url) {
        return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 500 });
    }

    // Try connection 1: with SSL require
    try {
        const client = postgres(url, {
            prepare: false,
            ssl: "require",
            max: 1,
            connect_timeout: 10,
        });
        const result = await client`SELECT current_user, version(), NOW() as server_time`;
        await client.end();
        return NextResponse.json({
            success: true,
            user: result[0].current_user,
            version: result[0].version,
            serverTime: result[0].server_time,
            urlHost: new URL(url).hostname,
            urlPort: new URL(url).port,
        });
    } catch (err1) {
        // Try connection 2: without SSL
        try {
            const client2 = postgres(url, {
                prepare: false,
                ssl: false,
                max: 1,
                connect_timeout: 10,
            });
            const result2 = await client2`SELECT current_user`;
            await client2.end();
            return NextResponse.json({
                success: true,
                note: "Connected WITHOUT ssl — ssl:require failed",
                user: result2[0].current_user,
                urlHost: new URL(url).hostname,
                urlPort: new URL(url).port,
                sslError: String(err1),
            });
        } catch (err2) {
            return NextResponse.json({
                success: false,
                urlHost: new URL(url).hostname,
                urlPort: new URL(url).port,
                sslRequireError: String(err1),
                noSslError: String(err2),
            }, { status: 500 });
        }
    }
}
