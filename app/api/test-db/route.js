import connectDB from "@/lib/db";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Test database connection
    const testConnection = await mongoose.connection.db.admin().ping();
    console.log("Database connection test:", testConnection);

    // Count scorecards
    const scorecardCount = await mongoose.connection.db
      .collection("scorecards")
      .countDocuments();
    console.log("Total scorecards in database:", scorecardCount);

    return NextResponse.json({
      status: "Database connected successfully",
      scorecardCount,
      connectionTest: testConnection,
    });
  } catch (error) {
    console.error("Database test failed:", error);
    return NextResponse.json(
      { error: "Database connection failed", details: error.message },
      { status: 500 },
    );
  }
}
