"use server";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Event from "@/models/Event";
import User from "@/models/User";
import Registration from "@/models/Registration";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateQRCode() {
  return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export async function registerForEvent(data) {
  try {
    const { eventId, attendeeName, attendeeEmail } = data;
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error("User not found");

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId.toString() === user._id.toString()) {
      throw new Error(
        "As the organizer, you cannot register for your own event.",
      );
    }

    if (event.registrationCount >= event.capacity) {
      throw new Error("Event is full");
    }

    const existingRegistration = await Registration.findOne({
      eventId,
      userId: user._id,
    });

    if (existingRegistration) {
      throw new Error("You are already registered for this event");
    }

    const qrCode = generateQRCode();

    const newRegistration = await Registration.create({
      eventId,
      userId: user._id,
      attendeeName,
      attendeeEmail,
      qrCode,
      status: "confirmed",
      checkedIn: false,
    });

    event.registrationCount += 1;
    await event.save();

    // Send confirmation email asynchronously
    try {
      await resend.emails.send({
        from: "Spott Events <onboarding@resend.dev>",
        to: attendeeEmail,
        subject: `Ticket Confirmation: ${event.title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #f4f4f5; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #18181b; font-size: 24px;">🎟️ You're Going to ${event.title}!</h1>
            </div>
            
            <div style="padding: 32px 24px; border: 1px solid #e4e4e7; border-top: none; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px; line-height: 1.5;">Hi <strong>${attendeeName}</strong>,</p>
              <p style="font-size: 16px; line-height: 1.5;">Your registration for <strong>${event.title}</strong> is confirmed. We can't wait to see you there!</p>
              
              <div style="background-color: #fafafa; border: 1px dashed #d4d4d8; padding: 24px; margin: 32px 0; border-radius: 8px; text-align: center;">
                <p style="text-transform: uppercase; font-size: 12px; font-weight: bold; color: #71717a; margin-top: 0; letter-spacing: 1px;">Your Ticket ID</p>
                <p style="font-family: monospace; font-size: 24px; font-weight: bold; color: #18181b; margin: 8px 0;">${qrCode}</p>
                <p style="font-size: 14px; color: #71717a; margin-bottom: 0;">Present this ID or scanning the QR code in the app at the door.</p>
              </div>

              <h3 style="margin-top: 32px; border-bottom: 2px solid #e4e4e7; padding-bottom: 8px;">Event Details</h3>
              <ul style="list-style: none; padding: 0; margin-top: 16px; font-size: 15px;">
                <li style="margin-bottom: 12px;">🗓️ <strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()} at ${new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</li>
                <li style="margin-bottom: 12px;">📍 <strong>Location:</strong> ${event.city}, ${event.state || event.country}</li>
                ${event.address ? `<li style="margin-bottom: 12px;">🏢 <strong>Address:</strong> ${event.address}</li>` : ""}
              </ul>

              <hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
              <p style="font-size: 14px; color: #71717a; text-align: center; margin: 0;">Having trouble? Contact the organizer directly through the Spott platform.</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error(
        "Failed to send confirmation email. Skipping...",
        emailError,
      );
      // We do not throw the error here because the Registration actually succeeded in DB
    }

    revalidatePath(`/event/${event.slug}`);
    revalidatePath("/dashboard");

    return JSON.parse(JSON.stringify(newRegistration));
  } catch (error) {
    console.error("Error registering for event:", error);
    throw new Error(error.message || "Failed to register for event");
  }
}

export async function checkRegistration(eventId) {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return null;

    const registration = await Registration.findOne({
      eventId,
      userId: user._id,
    });
    return registration ? JSON.parse(JSON.stringify(registration)) : null;
  } catch (error) {
    console.error("Error checking registration:", error);
    return null;
  }
}

export async function getMyRegistrations() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return [];

    const registrations = await Registration.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate("eventId");

    // The frontend expects the populated event object to be under 'event', not 'eventId'
    const formattedRegistrations = registrations.map((reg) => {
      const regObj = reg.toObject();
      regObj.event = regObj.eventId;
      // Optional: don't double send the full event object
      regObj.eventId = regObj.eventId._id || regObj.eventId;
      return regObj;
    });

    return JSON.parse(JSON.stringify(formattedRegistrations));
  } catch (error) {
    console.error("Error fetching my registrations:", error);
    return [];
  }
}

export async function cancelRegistration(registrationId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();
    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error("User not found");

    const registration = await Registration.findById(registrationId);
    if (!registration) throw new Error("Registration not found");

    if (registration.userId.toString() !== user._id.toString()) {
      throw new Error("Not authorized to cancel this registration");
    }

    const event = await Event.findById(registration.eventId);

    registration.status = "cancelled";
    await registration.save();

    if (event && event.registrationCount > 0) {
      event.registrationCount -= 1;
      await event.save();
    }

    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error cancelling registration:", error);
    throw new Error(error.message || "Failed to cancel registration");
  }
}

export async function getEventRegistrations(args) {
  try {
    const { eventId } = args;
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    const event = await Event.findById(eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId.toString() !== user._id.toString()) {
      throw new Error("Not authorized to view registrations");
    }

    const registrations = await Registration.find({ eventId });
    return JSON.parse(JSON.stringify(registrations));
  } catch (error) {
    console.error("Error fetching event registrations:", error);
    return [];
  }
}

export async function checkInAttendee(args) {
  try {
    let { qrCode } = args;
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Normalize code for consistent lookup (trim + uppercase)
    if (typeof qrCode === "string") {
      qrCode = qrCode.trim().toUpperCase();
    }

    await connectDB();
    const user = await User.findOne({ clerkId: userId });

    const registration = await Registration.findOne({ qrCode });
    if (!registration) {
      throw new Error("Invalid QR code");
    }

    const event = await Event.findById(registration.eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId.toString() !== user._id.toString()) {
      throw new Error("Not authorized to check in attendees");
    }

    if (registration.checkedIn) {
      return {
        success: false,
        message: "Already checked in",
        registration: JSON.parse(JSON.stringify(registration)),
      };
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    return {
      success: true,
      message: "Check-in successful",
      registration: JSON.parse(JSON.stringify(registration)),
    };
  } catch (error) {
    console.error("Error checking in attendee:", error);
    throw new Error(error.message || "Check-in failed");
  }
}
