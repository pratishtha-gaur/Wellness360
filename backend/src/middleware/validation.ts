import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';
import { AppError } from './errorHandler';

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));
    
    return next(new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
  }
  next();
};

// User Profile Validation Rules
export const validateUserProfile: ValidationChain[] = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120 years'),
  
  body('gender')
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
  
  body('weight')
    .isFloat({ min: 20, max: 300 })
    .withMessage('Weight must be between 20 and 300 kg'),
  
  body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm')
];

// Daily Goals Validation Rules
export const validateDailyGoals: ValidationChain[] = [
  body('userEmail')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('waterIntake')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Water intake must be between 0 and 10 liters'),
  
  body('sleepHours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24 hours'),
  
  body('dietType')
    .optional()
    .isIn(['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'mediterranean', 'other'])
    .withMessage('Diet type must be one of: vegetarian, vegan, omnivore, keto, paleo, mediterranean, other'),
  
  body('dailyCalorieTarget')
    .optional()
    .isInt({ min: 800, max: 5000 })
    .withMessage('Daily calorie target must be between 800 and 5000 calories')
];

// Update User Profile Validation Rules
export const validateUpdateUserProfile: ValidationChain[] = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('age')
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120 years'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 300 })
    .withMessage('Weight must be between 20 and 300 kg'),
  
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm')
];

// Update Daily Goals Validation Rules
export const validateUpdateDailyGoals: ValidationChain[] = [
  body('waterIntake')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Water intake must be between 0 and 10 liters'),
  
  body('sleepHours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24 hours'),
  
  body('dietType')
    .optional()
    .isIn(['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'mediterranean', 'other'])
    .withMessage('Diet type must be one of: vegetarian, vegan, omnivore, keto, paleo, mediterranean, other'),
  
  body('dailyCalorieTarget')
    .optional()
    .isInt({ min: 800, max: 5000 })
    .withMessage('Daily calorie target must be between 800 and 5000 calories'),
  
  body('completedTasks')
    .optional()
    .isArray()
    .withMessage('Completed tasks must be an array')
];

// Wellness Plan Request Validation
export const validateWellnessPlanRequest: ValidationChain[] = [
  body('userEmail')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
];
