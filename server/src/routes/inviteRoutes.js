import express from 'express';
import { getInviteByToken, acceptInvite } from '../controllers/inviteController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get invitation preview - public, does not require authentication
router.get('/:token', getInviteByToken);

// Accept invitation - requires authentication
router.post('/:token/accept', authenticate, acceptInvite);

export default router;
