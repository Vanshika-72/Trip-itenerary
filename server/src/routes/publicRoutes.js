import express from 'express';
import { getPublicTrip } from '../controllers/tripController.js';

const router = express.Router();

// Read-only public shared trip view
router.get('/trips/:shareToken', getPublicTrip);

export default router;
