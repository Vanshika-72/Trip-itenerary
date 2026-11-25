import express from 'express';
import {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  togglePublicShare,
} from '../controllers/tripController.js';
import {
  createActivity,
  getTripActivities,
  reorderActivities,
} from '../controllers/activityController.js';
import {
  getTripPackingItems,
  addPackingItem,
  updatePackingItem,
  deletePackingItem,
} from '../controllers/packingController.js';
import { getTripBudget } from '../controllers/budgetController.js';
import { exportTripItineraryPdf } from '../controllers/pdfController.js';
import {
  createInvite,
  removeCollaborator,
  updateCollaboratorRole,
} from '../controllers/inviteController.js';

import { authenticate } from '../middleware/auth.js';
import { authorizeTrip, authorizePackingItem } from '../middleware/tripAuth.js';
import { upload } from '../middleware/upload.js';
import { createTripValidator, updateTripValidator } from '../validators/tripValidators.js';
import { createActivityValidator, reorderActivityValidator } from '../validators/activityValidators.js';
import { createPackingValidator } from '../validators/packingValidators.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

// All trip routes require authentication
router.use(authenticate);

// Main Trip CRUD
router.get('/', getTrips);
router.post('/', upload.single('coverImage'), createTripValidator, validateRequest, createTrip);
router.get('/:id', authorizeTrip('viewer'), getTripById);
router.put('/:id', authorizeTrip('owner'), upload.single('coverImage'), updateTripValidator, validateRequest, updateTrip);
router.delete('/:id', authorizeTrip('owner'), deleteTrip);

// Public Sharing toggle
router.patch('/:id/share', authorizeTrip('owner'), togglePublicShare);

// PDF Export
router.get('/:id/itinerary.pdf', authorizeTrip('viewer'), exportTripItineraryPdf);

// Budget Analytics
router.get('/:id/budget', authorizeTrip('viewer'), getTripBudget);

// Activities nested under Trip
router.get('/:id/activities', authorizeTrip('viewer'), getTripActivities);
router.post(
  '/:id/activities',
  authorizeTrip('editor'),
  createActivityValidator,
  validateRequest,
  createActivity
);
router.patch(
  '/:id/activities/reorder',
  authorizeTrip('editor'),
  reorderActivityValidator,
  validateRequest,
  reorderActivities
);

// Packing checklist nested under Trip
router.get('/:id/packing', authorizeTrip('viewer'), getTripPackingItems);
router.post(
  '/:id/packing',
  authorizeTrip('editor'),
  createPackingValidator,
  validateRequest,
  addPackingItem
);
router.patch('/:id/packing/:itemId', authorizePackingItem('editor'), updatePackingItem);
router.delete('/:id/packing/:itemId', authorizePackingItem('editor'), deletePackingItem);

// Collaborator and invitation management nested under Trip
router.post('/:id/invites', authorizeTrip('owner'), createInvite);
router.delete('/:id/collaborators/:userId', authorizeTrip('viewer'), removeCollaborator);
router.patch('/:id/collaborators/:userId', authorizeTrip('owner'), updateCollaboratorRole);

export default router;
