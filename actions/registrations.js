'use server'

import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/db'
import Event from '@/models/Event'
import User from '@/models/User'
import Registration from '@/models/Registration'
import { revalidatePath } from 'next/cache'

function generateQRCode() {
  return `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
}

export async function registerForEvent(data) {
  try {
    const { eventId, attendeeName, attendeeEmail } = data;
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    if (!user) throw new Error('User not found')

    const event = await Event.findById(eventId)
    if (!event) throw new Error('Event not found')

    if (event.registrationCount >= event.capacity) {
      throw new Error('Event is full')
    }

    const existingRegistration = await Registration.findOne({
      eventId,
      userId: user._id
    })

    if (existingRegistration) {
      throw new Error('You are already registered for this event')
    }

    const qrCode = generateQRCode()

    const newRegistration = await Registration.create({
      eventId,
      userId: user._id,
      attendeeName,
      attendeeEmail,
      qrCode,
      status: 'confirmed',
      checkedIn: false
    })

    event.registrationCount += 1
    await event.save()

    revalidatePath(`/event/${event.slug}`)
    revalidatePath('/dashboard')

    return JSON.parse(JSON.stringify(newRegistration))
  } catch (error) {
    console.error('Error registering for event:', error)
    throw new Error(error.message || 'Failed to register for event')
  }
}

export async function checkRegistration(eventId) {
  try {
    const { userId } = await auth()
    if (!userId) return null

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    if (!user) return null

    const registration = await Registration.findOne({ eventId, userId: user._id })
    return registration ? JSON.parse(JSON.stringify(registration)) : null
  } catch (error) {
    console.error('Error checking registration:', error)
    return null
  }
}

export async function getMyRegistrations() {
  try {
    const { userId } = await auth()
    if (!userId) return []

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    if (!user) return []

    const registrations = await Registration.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('eventId')

    // The frontend expects the populated event object to be under 'event', not 'eventId'
    const formattedRegistrations = registrations.map(reg => {
      const regObj = reg.toObject();
      regObj.event = regObj.eventId;
      // Optional: don't double send the full event object 
      regObj.eventId = regObj.eventId._id || regObj.eventId; 
      return regObj;
    });

    return JSON.parse(JSON.stringify(formattedRegistrations))
  } catch (error) {
    console.error('Error fetching my registrations:', error)
    return []
  }
}

export async function cancelRegistration(registrationId) {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    if (!user) throw new Error('User not found')

    const registration = await Registration.findById(registrationId)
    if (!registration) throw new Error('Registration not found')

    if (registration.userId.toString() !== user._id.toString()) {
      throw new Error('Not authorized to cancel this registration')
    }

    const event = await Event.findById(registration.eventId)
    
    registration.status = 'cancelled'
    await registration.save()

    if (event && event.registrationCount > 0) {
      event.registrationCount -= 1
      await event.save()
    }

    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Error cancelling registration:', error)
    throw new Error(error.message || 'Failed to cancel registration')
  }
}

export async function getEventRegistrations(args) {
  try {
    const { eventId } = args;
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    await connectDB()
    const user = await User.findOne({ clerkId: userId })
    
    const event = await Event.findById(eventId)
    if (!event) throw new Error('Event not found')

    if (event.organizerId.toString() !== user._id.toString()) {
      throw new Error('Not authorized to view registrations')
    }

    const registrations = await Registration.find({ eventId })
    return JSON.parse(JSON.stringify(registrations))
  } catch (error) {
    console.error('Error fetching event registrations:', error)
    return []
  }
}

export async function checkInAttendee(args) {
  try {
    const { qrCode } = args;
    const { userId } = await auth()
    if (!userId) throw new Error('Unauthorized')

    await connectDB()
    const user = await User.findOne({ clerkId: userId })

    const registration = await Registration.findOne({ qrCode })
    if (!registration) {
      throw new Error('Invalid QR code')
    }

    const event = await Event.findById(registration.eventId)
    if (!event) throw new Error('Event not found')

    if (event.organizerId.toString() !== user._id.toString()) {
      throw new Error('Not authorized to check in attendees')
    }

    if (registration.checkedIn) {
      return { success: false, message: 'Already checked in', registration: JSON.parse(JSON.stringify(registration)) }
    }

    registration.checkedIn = true
    registration.checkedInAt = new Date()
    await registration.save()

    return { 
      success: true, 
      message: 'Check-in successful', 
      registration: JSON.parse(JSON.stringify(registration)) 
    }
  } catch (error) {
    console.error('Error checking in attendee:', error)
    throw new Error(error.message || 'Check-in failed')
  }
}
