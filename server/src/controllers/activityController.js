import Activity from '../models/Activity.js';
import { calculateDaysBetween } from '../utils/dateUtils.js';

export const createActivity = async (req, res, next) => {
  try {
    const trip = req.trip; // populated by authorizeTrip middleware
    const { dayNumber, title, category, time, location, cost, notes } = req.body;

    const totalDays = calculateDaysBetween(trip.startDate, trip.endDate);
    const day = Number(dayNumber);

    if (day < 1 || day > totalDays) {
      return res.status(400).json({
        success: false,
        message: `Day number must be between 1 and ${totalDays} for this trip.`,
      });
    }

    // Determine the next order index for this day
    const lastActivity = await Activity.findOne({ tripId: trip._id, dayNumber: day }).sort({ order: -1 });
    const order = lastActivity ? lastActivity.order + 1 : 0;

    const activity = await Activity.create({
      tripId: trip._id,
      dayNumber: day,
      order,
      title,
      category: category || 'Sightseeing',
      time: time || '',
      location: {
        name: location?.name || '',
        lat: location?.lat !== undefined ? location.lat : null,
        lng: location?.lng !== undefined ? location.lng : null,
      },
      cost: cost !== undefined ? Number(cost) : 0,
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Activity added successfully',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

export const getTripActivities = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const { day } = req.query;

    const query = { tripId };
    if (day) {
      query.dayNumber = Number(day);
    }

    const activities = await Activity.find(query).sort({ dayNumber: 1, order: 1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

export const updateActivity = async (req, res, next) => {
  try {
    const activity = req.activity; // populated by authorizeActivity middleware
    const trip = req.trip;
    const { title, category, time, location, cost, notes, dayNumber } = req.body;

    if (title) activity.title = title;
    if (category) activity.category = category;
    if (time !== undefined) activity.time = time;
    if (location) {
      activity.location = {
        name: location.name !== undefined ? location.name : activity.location.name,
        lat: location.lat !== undefined ? location.lat : activity.location.lat,
        lng: location.lng !== undefined ? location.lng : activity.location.lng,
      };
    }
    if (cost !== undefined) activity.cost = Number(cost);
    if (notes !== undefined) activity.notes = notes;

    // If dayNumber changed, validate and move to end of new day
    if (dayNumber && Number(dayNumber) !== activity.dayNumber) {
      const totalDays = calculateDaysBetween(trip.startDate, trip.endDate);
      const newDay = Number(dayNumber);
      if (newDay < 1 || newDay > totalDays) {
        return res.status(400).json({
          success: false,
          message: `Day number must be between 1 and ${totalDays}.`,
        });
      }

      const lastOnNewDay = await Activity.findOne({ tripId: trip._id, dayNumber: newDay }).sort({ order: -1 });
      activity.dayNumber = newDay;
      activity.order = lastOnNewDay ? lastOnNewDay.order + 1 : 0;
    }

    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      activity,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const activity = req.activity;
    const { tripId, dayNumber, order } = activity;

    await activity.deleteOne();

    // Reorder remaining activities on that day to prevent gaps
    await Activity.updateMany(
      { tripId, dayNumber, order: { $gt: order } },
      { $inc: { order: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderActivities = async (req, res, next) => {
  try {
    const trip = req.trip;
    const { activityId, targetDay, targetPosition } = req.body;

    const totalDays = calculateDaysBetween(trip.startDate, trip.endDate);
    const destDay = Number(targetDay);
    const destPos = Number(targetPosition);

    if (destDay < 1 || destDay > totalDays) {
      return res.status(400).json({
        success: false,
        message: `Target day must be between 1 and ${totalDays}.`,
      });
    }

    const activity = await Activity.findOne({ _id: activityId, tripId: trip._id });
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found for this trip.',
      });
    }

    const sourceDay = activity.dayNumber;
    const sourcePos = activity.order;

    if (sourceDay === destDay) {
      // Reorder within the same day
      const dayActivities = await Activity.find({ tripId: trip._id, dayNumber: sourceDay }).sort({ order: 1 });
      
      // Remove moved item and re-insert at targetPosition
      const filtered = dayActivities.filter((a) => a._id.toString() !== activityId.toString());
      const clampedPos = Math.max(0, Math.min(destPos, filtered.length));
      filtered.splice(clampedPos, 0, activity);

      // Persist updated positions
      const updatePromises = filtered.map((act, index) => {
        act.order = index;
        return act.save();
      });
      await Promise.all(updatePromises);
    } else {
      // Move to a different day
      // 1. Remove from source day and re-index
      const sourceActivities = await Activity.find({ tripId: trip._id, dayNumber: sourceDay }).sort({ order: 1 });
      const remainingSource = sourceActivities.filter((a) => a._id.toString() !== activityId.toString());
      const sourceUpdates = remainingSource.map((act, idx) => {
        act.order = idx;
        return act.save();
      });
      await Promise.all(sourceUpdates);

      // 2. Insert into destination day at target position
      const targetActivities = await Activity.find({ tripId: trip._id, dayNumber: destDay }).sort({ order: 1 });
      const clampedPos = Math.max(0, Math.min(destPos, targetActivities.length));
      
      activity.dayNumber = destDay;
      activity.order = clampedPos;
      targetActivities.splice(clampedPos, 0, activity);

      const targetUpdates = targetActivities.map((act, idx) => {
        act.dayNumber = destDay;
        act.order = idx;
        return act.save();
      });
      await Promise.all(targetUpdates);
    }

    // Return the updated activities for the entire trip
    const allActivities = await Activity.find({ tripId: trip._id }).sort({ dayNumber: 1, order: 1 });

    res.status(200).json({
      success: true,
      message: 'Itinerary reordered successfully',
      activities: allActivities,
    });
  } catch (error) {
    next(error);
  }
};
