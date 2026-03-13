import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    hasCompletedOnboarding: {
      type: Boolean,
      default: false,
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    interests: {
      type: [String],
      default: [],
    },
    freeEventsCreated: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
