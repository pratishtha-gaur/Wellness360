"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationMiddleware = exports.customValidations = exports.validationChains = exports.commonValidations = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("../middleware/errorHandler");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        throw new errorHandler_1.AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400);
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.commonValidations = {
    email: (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    name: (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    age: (0, express_validator_1.body)('age')
        .isInt({ min: 13, max: 120 })
        .withMessage('Age must be between 13 and 120 years'),
    weight: (0, express_validator_1.body)('weight')
        .isFloat({ min: 20, max: 300 })
        .withMessage('Weight must be between 20 and 300 kg'),
    height: (0, express_validator_1.body)('height')
        .isFloat({ min: 100, max: 250 })
        .withMessage('Height must be between 100 and 250 cm'),
    gender: (0, express_validator_1.body)('gender')
        .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
        .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
    waterIntake: (0, express_validator_1.body)('waterIntake')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('Water intake must be between 0 and 10 liters'),
    sleepHours: (0, express_validator_1.body)('sleepHours')
        .optional()
        .isFloat({ min: 0, max: 24 })
        .withMessage('Sleep hours must be between 0 and 24 hours'),
    dietType: (0, express_validator_1.body)('dietType')
        .optional()
        .isIn(['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'mediterranean', 'other'])
        .withMessage('Diet type must be one of: vegetarian, vegan, omnivore, keto, paleo, mediterranean, other'),
    dailyCalorieTarget: (0, express_validator_1.body)('dailyCalorieTarget')
        .optional()
        .isInt({ min: 800, max: 5000 })
        .withMessage('Daily calorie target must be between 800 and 5000 calories'),
    xp: (0, express_validator_1.body)('xp')
        .optional()
        .isInt({ min: 0 })
        .withMessage('XP must be a non-negative integer'),
    level: (0, express_validator_1.body)('level')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Level must be between 1 and 100'),
    date: (0, express_validator_1.query)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    page: (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    limit: (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    days: (0, express_validator_1.query)('days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Days must be between 1 and 365'),
    category: (0, express_validator_1.query)('category')
        .optional()
        .isIn(['diet', 'exercise', 'sleep', 'hydration', 'general'])
        .withMessage('Category must be one of: diet, exercise, sleep, hydration, general'),
    emailParam: (0, express_validator_1.param)('email')
        .isEmail()
        .withMessage('Email parameter must be a valid email address')
        .normalizeEmail(),
    levelParam: (0, express_validator_1.param)('level')
        .isInt({ min: 1, max: 100 })
        .withMessage('Level parameter must be between 1 and 100'),
    taskName: (0, express_validator_1.body)('taskName')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Task name must be between 1 and 100 characters'),
    bonusXP: (0, express_validator_1.body)('bonusXP')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Bonus XP must be between 1 and 1000'),
    reason: (0, express_validator_1.body)('reason')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Reason must be between 1 and 200 characters')
};
exports.validationChains = {
    createUserProfile: [
        exports.commonValidations.name,
        exports.commonValidations.email,
        exports.commonValidations.age,
        exports.commonValidations.gender,
        exports.commonValidations.weight,
        exports.commonValidations.height
    ],
    updateUserProfile: [
        exports.commonValidations.name.optional(),
        exports.commonValidations.age.optional(),
        exports.commonValidations.gender.optional(),
        exports.commonValidations.weight.optional(),
        exports.commonValidations.height.optional()
    ],
    createDailyGoals: [
        exports.commonValidations.email,
        exports.commonValidations.waterIntake,
        exports.commonValidations.sleepHours,
        exports.commonValidations.dietType,
        exports.commonValidations.dailyCalorieTarget
    ],
    updateDailyGoals: [
        exports.commonValidations.waterIntake,
        exports.commonValidations.sleepHours,
        exports.commonValidations.dietType,
        exports.commonValidations.dailyCalorieTarget,
        (0, express_validator_1.body)('completedTasks')
            .optional()
            .isArray()
            .withMessage('Completed tasks must be an array')
    ],
    wellnessPlanRequest: [
        exports.commonValidations.emailParam
    ],
    xpOperations: [
        exports.commonValidations.emailParam
    ],
    levelRewards: [
        exports.commonValidations.levelParam
    ],
    addCompletedTask: [
        exports.commonValidations.emailParam,
        exports.commonValidations.taskName,
        exports.commonValidations.date
    ],
    addBonusXP: [
        exports.commonValidations.emailParam,
        exports.commonValidations.bonusXP,
        exports.commonValidations.reason
    ],
    pagination: [
        exports.commonValidations.page,
        exports.commonValidations.limit
    ],
    dateRange: [
        exports.commonValidations.days,
        exports.commonValidations.date
    ]
};
exports.customValidations = {
    validateDateRange: (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start <= end;
    },
    validateEmailDomain: (email, allowedDomains) => {
        const domain = email.split('@')[1];
        return allowedDomains.includes(domain);
    },
    validatePasswordStrength: (password) => {
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
    validateBMIRange: (bmi) => {
        return bmi >= 10 && bmi <= 60;
    },
    validateCalorieRange: (calories, age, gender) => {
        const minCalories = gender === 'male' ? 1200 : 1000;
        const maxCalories = gender === 'male' ? 4000 : 3500;
        return calories >= minCalories && calories <= maxCalories;
    }
};
const createValidationMiddleware = (validations) => {
    return [
        ...validations,
        exports.handleValidationErrors
    ];
};
exports.createValidationMiddleware = createValidationMiddleware;
//# sourceMappingURL=validation.js.map