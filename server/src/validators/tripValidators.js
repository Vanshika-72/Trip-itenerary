import { body } from 'express-validator';

export const createTripValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Trip title is required')
    .isLength({ max: 120 })
    .withMessage('Trip title cannot exceed 120 characters'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ max: 120 })
    .withMessage('Destination cannot exceed 120 characters'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const start = new Date(req.body.startDate);
      const end = new Date(value);
      if (end < start) {
        throw new Error('End date cannot be earlier than start date');
      }
      return true;
    }),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 })
    .withMessage('Currency must be 1 to 5 characters'),
];

export const updateTripValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Trip title cannot be empty')
    .isLength({ max: 120 }),
  body('destination')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Destination cannot be empty'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.startDate) {
        const start = new Date(req.body.startDate);
        const end = new Date(value);
        if (end < start) {
          throw new Error('End date cannot be earlier than start date');
        }
      }
      return true;
    }),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a non-negative number'),
  body('currency')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 }),
];
