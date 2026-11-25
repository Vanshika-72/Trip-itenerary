import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Activity from '../models/Activity.js';
import PackingItem from '../models/PackingItem.js';

const ROLE_RANKS = {
  viewer: 1,
  editor: 2,
  owner: 3,
};

export const getUserRoleInTrip = (trip, userId) => {
  if (!trip || !userId) return null;
  const uidStr = userId.toString();

  // Check if owner
  if (trip.ownerId && trip.ownerId.toString() === uidStr) {
    return 'owner';
  }

  // Check collaborators
  if (Array.isArray(trip.collaborators)) {
    const collaborator = trip.collaborators.find(
      (c) => c.user && (c.user._id ? c.user._id.toString() : c.user.toString()) === uidStr
    );
    if (collaborator) {
      return collaborator.role; // 'editor' or 'viewer'
    }
  }

  return null;
};

/**
 * Middleware to authorize access to a trip based on trip ID param
 * @param {'viewer' | 'editor' | 'owner'} minRole
 */
export const authorizeTrip = (minRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const tripId = req.params.id || req.params.tripId;

      if (!tripId || !mongoose.Types.ObjectId.isValid(tripId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trip ID format',
        });
      }

      const trip = await Trip.findById(tripId).populate('collaborators.user', 'name email avatarUrl');

      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found',
        });
      }

      const userRole = getUserRoleInTrip(trip, req.user._id);

      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a participant of this trip.',
        });
      }

      const requiredRank = ROLE_RANKS[minRole] || 1;
      const userRank = ROLE_RANKS[userRole] || 0;

      if (userRank < requiredRank) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Requires '${minRole}' role or higher. Your role: '${userRole}'.`,
        });
      }

      req.trip = trip;
      req.userTripRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to authorize access to an activity based on activity ID param
 * @param {'viewer' | 'editor' | 'owner'} minRole
 */
export const authorizeActivity = (minRole = 'editor') => {
  return async (req, res, next) => {
    try {
      const activityId = req.params.id || req.params.activityId;

      if (!activityId || !mongoose.Types.ObjectId.isValid(activityId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity ID format',
        });
      }

      const activity = await Activity.findById(activityId);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found',
        });
      }

      const trip = await Trip.findById(activity.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Associated trip not found',
        });
      }

      const userRole = getUserRoleInTrip(trip, req.user._id);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this trip.',
        });
      }

      const requiredRank = ROLE_RANKS[minRole] || 1;
      const userRank = ROLE_RANKS[userRole] || 0;

      if (userRank < requiredRank) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Requires '${minRole}' role or higher.`,
        });
      }

      req.activity = activity;
      req.trip = trip;
      req.userTripRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to authorize access to a packing item based on itemId param
 * @param {'viewer' | 'editor' | 'owner'} minRole
 */
export const authorizePackingItem = (minRole = 'editor') => {
  return async (req, res, next) => {
    try {
      const itemId = req.params.itemId || req.params.id;

      if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid packing item ID format',
        });
      }

      const item = await PackingItem.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Packing item not found',
        });
      }

      const trip = await Trip.findById(item.tripId);
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Associated trip not found',
        });
      }

      const userRole = getUserRoleInTrip(trip, req.user._id);
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not a member of this trip.',
        });
      }

      const requiredRank = ROLE_RANKS[minRole] || 1;
      const userRank = ROLE_RANKS[userRole] || 0;

      if (userRank < requiredRank) {
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions. Requires '${minRole}' role or higher.`,
        });
      }

      req.packingItem = item;
      req.trip = trip;
      req.userTripRole = userRole;
      next();
    } catch (error) {
      next(error);
    }
  };
};
