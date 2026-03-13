import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizerName: { type: String, required: true },
    
    category: { type: String, required: true, index: true },
    tags: { type: [String], default: [] },
    
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    timezone: { type: String, required: true },
    
    locationType: { type: String, enum: ['physical', 'online'], required: true },
    venue: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    
    capacity: { type: Number, required: true },
    ticketType: { type: String, enum: ['free', 'paid'], required: true },
    ticketPrice: { type: Number },
    registrationCount: { type: Number, default: 0 },
    
    coverImage: { type: String },
    themeColor: { type: String },
  },
  { timestamps: true }
);

// Search index for title
EventSchema.index({ title: 'text' });

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
