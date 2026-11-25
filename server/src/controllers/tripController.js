import { nanoid } from 'nanoid';
import Trip from '../models/Trip.js';
import Activity from '../models/Activity.js';
import PackingItem from '../models/PackingItem.js';
import Invitation from '../models/Invitation.js';
import { generateDayList, calculateDaysBetween } from '../utils/dateUtils.js';
import { processImageUpload } from '../middleware/upload.js';
import { getUserRoleInTrip } from '../middleware/tripAuth.js';

export const createTrip = async (req, res, next) => {
  try {
    const { title, destination, startDate, endDate, currency, budget } = req.body;

    let coverUrl = '';
    if (req.file) {
      const uploadResult = await processImageUpload(req.file);
      coverUrl = uploadResult?.url || '';
    } else if (req.body.coverUrl) {
      coverUrl = req.body.coverUrl;
    }

    const trip = await Trip.create({
      ownerId: req.user._id,
      title,
      destination,
      startDate,
      endDate,
      currency: currency || 'USD',
      budget: budget ? Number(budget) : 0,
      coverUrl,
      collaborators: [],
      shareToken: nanoid(16),
      isPublic: false,
    });

    const dayList = generateDayList(trip.startDate, trip.endDate);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully',
      trip: {
        ...trip.toObject(),
        totalDays: dayList.length,
        days: dayList,
        userRole: 'owner',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { type } = req.query; // 'owned', 'shared', or undefined for all

    let query = {};
    if (type === 'owned') {
      query = { ownerId: userId };
    } else if (type === 'shared') {
      query = { 'collaborators.user': userId };
    } else {
      query = {
        $or: [{ ownerId: userId }, { 'collaborators.user': userId }],
      };
    }

    const trips = await Trip.find(query)
      .populate('ownerId', 'name email avatarUrl')
      .populate('collaborators.user', 'name email avatarUrl')
      .sort({ startDate: 1 });

    // Enrich trips with day counts, role, and summary
    const enrichedTrips = await Promise.all(
      trips.map(async (trip) => {
        const userRole = getUserRoleInTrip(trip, userId);
        const dayCount = calculateDaysBetween(trip.startDate, trip.endDate);
        const activityCount = await Activity.countDocuments({ tripId: trip._id });
        
        return {
          ...trip.toObject(),
          totalDays: dayCount,
          activityCount,
          userRole,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: enrichedTrips.length,
      trips: enrichedTrips,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const trip = req.trip; // populated by authorizeTrip middleware
    const dayList = generateDayList(trip.startDate, trip.endDate);
    
    // Count activities and packing items
    const activityCount = await Activity.countDocuments({ tripId: trip._id });
    const packingCount = await PackingItem.countDocuments({ tripId: trip._id });
    const packedCount = await PackingItem.countDocuments({ tripId: trip._id, isPacked: true });

    res.status(200).json({
      success: true,
      trip: {
        ...trip.toObject(),
        totalDays: dayList.length,
        days: dayList,
        activityCount,
        packingStats: {
          total: packingCount,
          packed: packedCount,
          percentage: packingCount > 0 ? Math.round((packedCount / packingCount) * 100) : 0,
        },
        userRole: req.userTripRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const trip = req.trip;

    // Only owner can update trip settings
    if (req.userTripRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the trip owner can modify trip settings.',
      });
    }

    const { title, destination, startDate, endDate, currency, budget } = req.body;

    if (title) trip.title = title;
    if (destination) trip.destination = destination;
    if (currency) trip.currency = currency;
    if (budget !== undefined) trip.budget = Number(budget);

    // If new cover image is uploaded
    if (req.file) {
      const uploadResult = await processImageUpload(req.file);
      if (uploadResult?.url) {
        trip.coverUrl = uploadResult.url;
      }
    } else if (req.body.coverUrl !== undefined) {
      trip.coverUrl = req.body.coverUrl;
    }

    // Handle date changes and protect existing activities
    if (startDate || endDate) {
      const oldDaysCount = calculateDaysBetween(trip.startDate, trip.endDate);
      if (startDate) trip.startDate = new Date(startDate);
      if (endDate) trip.endDate = new Date(endDate);

      const newDaysCount = calculateDaysBetween(trip.startDate, trip.endDate);

      // If date range shrank, adjust activities assigned to removed days
      if (newDaysCount < oldDaysCount) {
        await Activity.updateMany(
          { tripId: trip._id, dayNumber: { $gt: newDaysCount } },
          { $set: { dayNumber: newDaysCount } }
        );
      }
    }

    await trip.save();

    const dayList = generateDayList(trip.startDate, trip.endDate);

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      trip: {
        ...trip.toObject(),
        totalDays: dayList.length,
        days: dayList,
        userRole: 'owner',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = req.trip;

    // Only owner can delete trip
    if (req.userTripRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the trip owner can delete this trip.',
      });
    }

    // Cascade delete associated activities, packing items, invitations
    await Promise.all([
      Activity.deleteMany({ tripId: trip._id }),
      PackingItem.deleteMany({ tripId: trip._id }),
      Invitation.deleteMany({ tripId: trip._id }),
      trip.deleteOne(),
    ]);

    res.status(200).json({
      success: true,
      message: 'Trip and all associated resources have been deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const togglePublicShare = async (req, res, next) => {
  try {
    const trip = req.trip;

    if (req.userTripRole !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Only the trip owner can toggle public sharing.',
      });
    }

    const { isPublic } = req.body;

    if (isPublic) {
      if (!trip.shareToken) {
        trip.shareToken = nanoid(16);
      }
      trip.isPublic = true;
    } else {
      trip.isPublic = false;
    }

    await trip.save();

    res.status(200).json({
      success: true,
      isPublic: trip.isPublic,
      shareToken: trip.shareToken,
      shareUrl: trip.isPublic ? `${process.env.CLIENT_URL || 'http://localhost:5173'}/shared/${trip.shareToken}` : null,
      message: trip.isPublic ? 'Public sharing enabled' : 'Public sharing disabled',
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicTrip = async (req, res, next) => {
  try {
    const { shareToken } = req.params;

    if (!shareToken) {
      return res.status(400).json({
        success: false,
        message: 'Share token is required.',
      });
    }

    const trip = await Trip.findOne({ shareToken, isPublic: true })
      .populate('ownerId', 'name avatarUrl')
      .select('-collaborators');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'This shared trip either does not exist or public sharing has been disabled by the owner.',
      });
    }

    const dayList = generateDayList(trip.startDate, trip.endDate);
    const activities = await Activity.find({ tripId: trip._id }).sort({ dayNumber: 1, order: 1 });

    // Calculate budget summary
    const totalCost = activities.reduce((acc, curr) => acc + (curr.cost || 0), 0);

    res.status(200).json({
      success: true,
      trip: {
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        currency: trip.currency,
        budget: trip.budget,
        coverUrl: trip.coverUrl,
        owner: trip.ownerId,
        totalDays: dayList.length,
        days: dayList,
        activities,
        totalCost,
      },
    });
  } catch (error) {
    next(error);
  }
};
