import mongoose from 'mongoose';

export const ACTIVITY_CATEGORIES = [
  'Sightseeing',
  'Food',
  'Accommodation',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Other',
];

const activitySchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Activity must be linked to a trip'],
      index: true,
    },
    dayNumber: {
      type: Number,
      required: [true, 'Day number is required'],
      min: [1, 'Day number must be at least 1'],
    },
    order: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
    title: {
      type: String,
      required: [true, 'Activity title is required'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ACTIVITY_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
      default: 'Sightseeing',
    },
    time: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      name: {
        type: String,
        default: '',
        trim: true,
      },
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast day/order retrieval and reordering
activitySchema.index({ tripId: 1, dayNumber: 1, order: 1 });

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;
