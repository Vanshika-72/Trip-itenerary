import express from 'express';
import { updateActivity, deleteActivity } from '../controllers/activityController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeActivity } from '../middleware/tripAuth.js';

const router = express.Router();

router.use(authenticate);

router.put('/:id', authorizeActivity('editor'), updateActivity);
router.delete('/:id', authorizeActivity('editor'), deleteActivity);

export default router;
