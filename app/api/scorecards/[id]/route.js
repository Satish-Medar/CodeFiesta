import connectDB from "@/lib/db";
import Scorecard from "@/models/Scorecard";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    // Next.js 15: params is a Promise and must be awaited
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Scorecard ID is required" },
        { status: 400 },
      );
    }

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid scorecard ID format" },
        { status: 400 },
      );
    }

    // Find by ID — also check organizerId for security
    const scorecard = await Scorecard.findOne({
      _id: objectId,
      organizerId: userId,
    });

    if (!scorecard) {
      return NextResponse.json(
        { error: "Scorecard not found" },
        { status: 404 },
      );
    }

    const obj = scorecard.toObject();
    obj._id = scorecard._id.toString();
    return NextResponse.json(obj);
  } catch (error) {
    console.error("Error fetching scorecard:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch scorecard" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    // Next.js 15: params is a Promise and must be awaited
    const { id } = await params;
    const body = await req.json();

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (err) {
      console.error("Invalid ObjectId format:", id, err);
      return NextResponse.json(
        { error: "Invalid scorecard ID format" },
        { status: 400 },
      );
    }

    const scorecard = await Scorecard.findOneAndUpdate(
      { _id: objectId, organizerId: userId },
      body,
      { new: true },
    );

    if (!scorecard) {
      return NextResponse.json(
        { error: "Scorecard not found" },
        { status: 404 },
      );
    }

    const obj = scorecard.toObject();
    obj._id = scorecard._id.toString();
    return NextResponse.json(obj);
  } catch (error) {
    console.error("Error updating scorecard:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update scorecard" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    // Next.js 15: params is a Promise and must be awaited
    const { id } = await params;

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (err) {
      console.error("Invalid ObjectId format:", id, err);
      return NextResponse.json(
        { error: "Invalid scorecard ID format" },
        { status: 400 },
      );
    }

    const scorecard = await Scorecard.findOneAndDelete({
      _id: objectId,
      organizerId: userId,
    });

    if (!scorecard) {
      return NextResponse.json(
        { error: "Scorecard not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Scorecard deleted successfully" });
  } catch (error) {
    console.error("Error deleting scorecard:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scorecard" },
      { status: 500 },
    );
  }
}
