"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { revalidatePath } from "next/cache";

export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    await connectDB();
    let user = await User.findOne({ clerkId: userId });

    // If user doesn't exist in DB, fetch from Clerk and create
    if (!user) {
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();

      if (!clerkUser) return null;

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name =
        `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
        "Anonymous";

      user = await User.create({
        clerkId: clerkUser.id,
        email,
        name,
        imageUrl: clerkUser.imageUrl,
      });
    }

    return JSON.parse(JSON.stringify(user)); // Serialize for Server Actions
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

export async function setUserRole(role) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { role },
      { new: true },
    );

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error("Error setting user role:", error);
    throw new Error("Failed to set user role");
  }
}

export async function completeOnboarding(location, interests) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        location,
        interests,
        hasCompletedOnboarding: true,
      },
      { new: true },
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    revalidatePath("/"); // Revalidate homepage to clear any onboarding banners

    return { success: true, userId: updatedUser._id.toString() };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw new Error("Failed to complete onboarding");
  }
}
