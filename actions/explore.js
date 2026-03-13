'use server'

import connectDB from '@/lib/db'
import Event from '@/models/Event'

export async function getFeaturedEvents(params = {}) {
  try {
    await connectDB()
    const limit = params.limit || 3
    const events = await Event.find({}).sort({ createdAt: -1 }).limit(limit)
    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error('Error fetching featured events:', error)
    return []
  }
}

export async function getEventsByLocation(params = {}) {
  if (params === "skip") return []
  try {
    await connectDB()
    const { city, state, limit = 50 } = params
    const query = {}
    if (city) query.city = { $regex: new RegExp(`^${city}$`, 'i') }
    if (state) query.state = { $regex: new RegExp(`^${state}$`, 'i') }
    
    const events = await Event.find(query).sort({ startDate: 1 }).limit(limit)
    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error('Error fetching events by location:', error)
    return []
  }
}

export async function getPopularEvents(params = {}) {
  try {
    await connectDB()
    const limit = params.limit || 6
    const events = await Event.find({}).sort({ registrationCount: -1 }).limit(limit)
    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error('Error fetching popular events:', error)
    return []
  }
}

export async function getCategoryCounts() {
  try {
    await connectDB()
    const counts = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ])
    const result = {}
    counts.forEach(c => {
      if (c._id) result[c._id] = c.count
    })
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error('Error fetching category counts:', error)
    return {}
  }
}

export async function getEventsByCategory(params = {}) {
  if (params === "skip") return []
  try {
    await connectDB()
    const { category, limit = 50 } = params
    if (!category) return []
    
    const events = await Event.find({ category }).sort({ startDate: 1 }).limit(limit)
    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error('Error fetching events by category:', error)
    return []
  }
}
