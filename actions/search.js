'use server'

import connectDB from '@/lib/db'
import Event from '@/models/Event'

export async function searchEvents(params) {
  if (params === "skip" || !params || !params.query) {
    return []
  }

  try {
    await connectDB()
    const { query, limit = 5 } = params

    const events = await Event.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ startDate: 1 })
    .limit(limit)

    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error('Error searching events:', error)
    return []
  }
}
