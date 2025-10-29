import { Request, Response, NextFunction } from 'express';
import { body, param, query, ValidationChain, validationResult } from 'express-validator';
import { AppError } from '@/middleware/errorHandler';

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));
    
    throw new AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400);
  }
  next();
};

// Common validation rules
export const commonValidations = {
  // Email validation
  email: body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  // Name validation
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  // Age validation
  age: body('age')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be between 13 and 120 years'),

  // Weight validation
  weight: body('weight')
    .isFloat({ min: 20, max: 300 })
    .withMessage('Weight must be between 20 and 300 kg'),

  // Height validation
  height: body('height')
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),

  // Gender validation
  gender: body('gender')
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),

  // Water intake validation
  waterIntake: body('waterIntake')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('Water intake must be between 0 and 10 liters'),

  // Sleep hours validation
  sleepHours: body('sleepHours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24 hours'),

  // Diet type validation
  dietType: body('dietType')
    .optional()
    .isIn(['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'mediterranean', 'other'])
    .withMessage('Diet type must be one of: vegetarian, vegan, omnivore, keto, paleo, mediterranean, other'),

  // Calorie target validation
  dailyCalorieTarget: body('dailyCalorieTarget')
    .optional()
    .isInt({ min: 800, max: 5000 })
    .withMessage('Daily calorie target must be between 800 and 5000 calories'),

  // XP validation
  xp: body('xp')
    .optional()
    .isInt({ min: 0 })
    .withMessage('XP must be a non-negative integer'),

  // Level validation
  level: body('level')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Level must be between 1 and 100'),

  // Date validation
  date: query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),

  // Page validation
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  // Limit validation
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  // Days validation
  days: query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),

  // Category validation
  category: query('category')
    .optional()
    .isIn(['diet', 'exercise', 'sleep', 'hydration', 'general'])
    .withMessage('Category must be one of: diet, exercise, sleep, hydration, general'),

  // Email parameter validation
  emailParam: param('email')
    .isEmail()
    .withMessage('Email parameter must be a valid email address')
    .normalizeEmail(),

  // Level parameter validation
  levelParam: param('level')
    .isInt({ min: 1, max: 100 })
    .withMessage('Level parameter must be between 1 and 100'),

  // Task name validation
  taskName: body('taskName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Task name must be between 1 and 100 characters'),

  // Bonus XP validation
  bonusXP: body('bonusXP')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Bonus XP must be between 1 and 1000'),

  // Reason validation
  reason: body('reason')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Reason must be between 1 and 200 characters')
};

// Validation chain builders
export const validationChains = {
  // User profile creation
  createUserProfile: [
    commonValidations.name,
    commonValidations.email,
    commonValidations.age,
    commonValidations.gender,
    commonValidations.weight,
    commonValidations.height
  ],

  // User profile update
  updateUserProfile: [
    commonValidations.name.optional(),
    commonValidations.age.optional(),
    commonValidations.gender.optional(),
    commonValidations.weight.optional(),
    commonValidations.height.optional()
  ],

  // Daily goals creation
  createDailyGoals: [
    commonValidations.email,
    commonValidations.waterIntake,
    commonValidations.sleepHours,
    commonValidations.dietType,
    commonValidations.dailyCalorieTarget
  ],

  // Daily goals update
  updateDailyGoals: [
    commonValidations.waterIntake,
    commonValidations.sleepHours,
    commonValidations.dietType,
    commonValidations.dailyCalorieTarget,
    body('completedTasks')
      .optional()
      .isArray()
      .withMessage('Completed tasks must be an array')
  ],

  // Wellness plan request
  wellnessPlanRequest: [
    commonValidations.emailParam
  ],

  // XP operations
  xpOperations: [
    commonValidations.emailParam
  ],

  // Level rewards
  levelRewards: [
    commonValidations.levelParam
  ],

  // Add completed task
  addCompletedTask: [
    commonValidations.emailParam,
    commonValidations.taskName,
    commonValidations.date
  ],

  // Add bonus XP
  addBonusXP: [
    commonValidations.emailParam,
    commonValidations.bonusXP,
    commonValidations.reason
  ],

  // Pagination
  pagination: [
    commonValidations.page,
    commonValidations.limit
  ],

  // Date range
  dateRange: [
    commonValidations.days,
    commonValidations.date
  ]
};

// Custom validation functions
export const customValidations = {
  // Validate date range
  validateDateRange: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  },

  // Validate email domain
  validateEmailDomain: (email: string, allowedDomains: string[]): boolean => {
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  },

  // Validate password strength
  validatePasswordStrength: (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  },

  // Validate BMI range
  validateBMIRange: (bmi: number): boolean => {
    return bmi >= 10 && bmi <= 60;
  },

  // Validate calorie range based on age and gender
  validateCalorieRange: (calories: number, age: number, gender: string): boolean => {
    const minCalories = gender === 'male' ? 1200 : 1000;
    const maxCalories = gender === 'male' ? 4000 : 3500;
    return calories >= minCalories && calories <= maxCalories;
  }
};

// Validation middleware factory
export const createValidationMiddleware = (validations: ValidationChain[]) => {
  return [
    ...validations,
    handleValidationErrors
  ];
};
