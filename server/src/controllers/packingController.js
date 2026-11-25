import PackingItem from '../models/PackingItem.js';

export const getTripPackingItems = async (req, res, next) => {
  try {
    const tripId = req.params.id;

    const items = await PackingItem.find({ tripId }).sort({ createdAt: -1 });

    const total = items.length;
    const packed = items.filter((item) => item.isPacked).length;
    const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;

    res.status(200).json({
      success: true,
      stats: {
        total,
        packed,
        percentage,
      },
      items,
    });
  } catch (error) {
    next(error);
  }
};

export const addPackingItem = async (req, res, next) => {
  try {
    const tripId = req.params.id;
    const { label, category } = req.body;

    const item = await PackingItem.create({
      tripId,
      label,
      category: category || 'General',
      isPacked: false,
    });

    res.status(201).json({
      success: true,
      message: 'Item added to packing checklist',
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePackingItem = async (req, res, next) => {
  try {
    const item = req.packingItem; // populated by authorizePackingItem middleware
    const { label, isPacked, category } = req.body;

    if (label !== undefined) item.label = label;
    if (isPacked !== undefined) item.isPacked = Boolean(isPacked);
    if (category !== undefined) item.category = category;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePackingItem = async (req, res, next) => {
  try {
    const item = req.packingItem;
    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Packing item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
