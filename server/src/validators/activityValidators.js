import { body } from 'express-validator';
import { ACTIVITY_CATEGORIES } from '../models/Activity.js';

export const createActivityValidator = [
  body('dayNumber')
    .notEmpty()
    .withMessage('Day number is required')
    .isInt({ min: 1 })
    .withMessage('Day number must be a positive integer'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Activity title is required')
    .isLength({ max: 140 })
    .withMessage('Title cannot exceed 140 characters'),
  body('category')
    .optional()
    .isIn(ACTIVITY_CATEGORIES)
    .withMessage(`Category must be one of: ${ACTIVITY_CATEGORIES.join(', ')}`),
  body('time')
    .optional()
    .trim(),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
];

export const reorderActivityValidator = [
  body('activityId')
    .notEmpty()
    .withMessage('Activity ID is required')
    .isMongoId()
    .withMessage('Invalid activity ID format'),
  body('targetDay')
    .notEmpty()
    .withMessage('Target day is required')
    .isInt({ min: 1 })
    .withMessage('Target day must be at least 1'),
  body('targetPosition')
    .notEmpty()
    .withMessage('Target position is required')
    .isInt({ min: 0 })
    .withMessage('Target position must be 0 or greater'),
];
