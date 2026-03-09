import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { sql } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

// Helper to execute queries with RLS context
// We use `any` for the db/tx instance to support both standard connections and transaction scopes
// without complicated generic type constraints that make the caller code brittle.
export async function withRLS<T>(
    userId: string | null,
    callback: (dbOrTx: any) => Promise<T>
): Promise<T> {
    if (!userId) {
        return callback(db);
    }

    return db.transaction(async (tx) => {
        // Set the Postgres configuration parameter for the current transaction
        await tx.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`);
        return callback(tx);
    });
}
