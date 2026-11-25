import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['editor', 'viewer'],
      default: 'editor',
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from creation
    },
  },
  {
    timestamps: true,
  }
);

// TTL index for automatic cleanup of expired invitations
invitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index to quickly find pending invites for a specific trip and email
invitationSchema.index({ tripId: 1, email: 1, status: 1 });

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
