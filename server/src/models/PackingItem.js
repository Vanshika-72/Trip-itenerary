import mongoose from 'mongoose';

const packingItemSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: [true, 'Packing item must belong to a trip'],
      index: true,
    },
    label: {
      type: String,
      required: [true, 'Item label is required'],
      trim: true,
      maxlength: [120, 'Label cannot exceed 120 characters'],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
      maxlength: 50,
    },
    isPacked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

packingItemSchema.index({ tripId: 1, isPacked: 1 });

const PackingItem = mongoose.model('PackingItem', packingItemSchema);
export default PackingItem;
