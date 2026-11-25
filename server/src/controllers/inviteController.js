import { nanoid } from 'nanoid';
import Invitation from '../models/Invitation.js';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { sendInvitationEmail } from '../config/mailer.js';

export const createInvite = async (req, res, next) => {
  try {
    const trip = req.trip;

    if (req.userTripRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the trip owner can invite collaborators.',
      });
    }

    const { email, role } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid recipient email address.',
      });
    }

    const recipientEmail = email.toLowerCase().trim();

    // Check if inviting oneself
    if (recipientEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot invite yourself as a collaborator on your own trip.',
      });
    }

    // Check if already a collaborator
    const existingCollab = trip.collaborators.find((c) => {
      const u = c.user;
      return (u?.email && u.email.toLowerCase() === recipientEmail);
    });

    if (existingCollab) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a collaborator on this trip.',
      });
    }

    // Generate unique token
    const token = nanoid(32);
    const assignedRole = role === 'viewer' ? 'viewer' : 'editor';

    // Remove any older pending invitations for this email + trip
    await Invitation.deleteMany({ tripId: trip._id, email: recipientEmail, status: 'pending' });

    const invitation = await Invitation.create({
      tripId: trip._id,
      email: recipientEmail,
      role: assignedRole,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteUrl = `${clientBaseUrl}/invite/${token}`;

    // Send email
    await sendInvitationEmail({
      to: recipientEmail,
      tripTitle: trip.title,
      inviterName: req.user.name,
      role: assignedRole,
      inviteUrl,
    });

    res.status(201).json({
      success: true,
      message: `Invitation created and sent to ${recipientEmail}`,
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        token: invitation.token,
        inviteUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInviteByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token }).populate({
      path: 'tripId',
      select: 'title destination startDate endDate coverUrl ownerId',
      populate: { path: 'ownerId', select: 'name email avatarUrl' },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or has been revoked.',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This invitation has already been ${invitation.status}.`,
      });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(410).json({
        success: false,
        message: 'This invitation has expired.',
      });
    }

    res.status(200).json({
      success: true,
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        trip: invitation.tripId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvite = async (req, res, next) => {
  try {
    const { token } = req.params;
    const user = req.user;

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or has been revoked.',
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This invitation is already ${invitation.status}.`,
      });
    }

    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(410).json({
        success: false,
        message: 'This invitation has expired.',
      });
    }

    // Verify recipient email
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: `This invitation was issued to ${invitation.email}. You are logged in as ${user.email}. Please log in with the invited email address.`,
      });
    }

    const trip = await Trip.findById(invitation.tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Associated trip no longer exists.',
      });
    }

    // Check if user is already a collaborator
    const isAlreadyCollab = trip.collaborators.some(
      (c) => c.user.toString() === user._id.toString()
    );

    if (!isAlreadyCollab && trip.ownerId.toString() !== user._id.toString()) {
      trip.collaborators.push({
        user: user._id,
        role: invitation.role,
        addedAt: new Date(),
      });
      await trip.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({
      success: true,
      message: `You have successfully joined "${trip.title}" as an ${invitation.role}!`,
      tripId: trip._id,
    });
  } catch (error) {
    next(error);
  }
};

export const removeCollaborator = async (req, res, next) => {
  try {
    const trip = req.trip;
    const { userId } = req.params;

    // Must be trip owner OR collaborator removing themselves
    const isOwner = req.userTripRole === 'owner';
    const isSelf = req.user._id.toString() === userId;

    if (!isOwner && !isSelf) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to remove this collaborator.',
      });
    }

    trip.collaborators = trip.collaborators.filter(
      (c) => (c.user._id ? c.user._id.toString() : c.user.toString()) !== userId
    );

    await trip.save();

    res.status(200).json({
      success: true,
      message: 'Collaborator removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const updateCollaboratorRole = async (req, res, next) => {
  try {
    const trip = req.trip;
    const { userId } = req.params;
    const { role } = req.body;

    if (req.userTripRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the trip owner can change collaborator roles.',
      });
    }

    if (!['editor', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be 'editor' or 'viewer'.",
      });
    }

    const collaborator = trip.collaborators.find(
      (c) => (c.user._id ? c.user._id.toString() : c.user.toString()) === userId
    );

    if (!collaborator) {
      return res.status(404).json({
        success: false,
        message: 'Collaborator not found on this trip.',
      });
    }

    collaborator.role = role;
    await trip.save();

    res.status(200).json({
      success: true,
      message: `Collaborator role updated to ${role}.`,
    });
  } catch (error) {
    next(error);
  }
};
