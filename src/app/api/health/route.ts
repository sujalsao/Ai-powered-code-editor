import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Perform a lightweight database operation to keep MongoDB Atlas active
    const count = await db.user.count();

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        registeredUsers: count,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Database connection error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
