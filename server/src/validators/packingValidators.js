import { body } from 'express-validator';

export const createPackingValidator = [
  body('label')
    .trim()
    .notEmpty()
    .withMessage('Item label is required')
    .isLength({ max: 120 })
    .withMessage('Item label cannot exceed 120 characters'),
  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 }),
];
