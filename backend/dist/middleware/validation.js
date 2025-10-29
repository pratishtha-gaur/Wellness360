"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWellnessPlanRequest = exports.validateUpdateDailyGoals = exports.validateUpdateUserProfile = exports.validateDailyGoals = exports.validateUserProfile = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const errorHandler_1 = require("./errorHandler");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.type === 'field' ? error.path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? error.value : undefined
        }));
        return next(new errorHandler_1.AppError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400));
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateUserProfile = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('age')
        .isInt({ min: 13, max: 120 })
        .withMessage('Age must be between 13 and 120 years'),
    (0, express_validator_1.body)('gender')
        .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
        .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
    (0, express_validator_1.body)('weight')
        .isFloat({ min: 20, max: 300 })
        .withMessage('Weight must be between 20 and 300 kg'),
    (0, express_validator_1.body)('height')
        .isFloat({ min: 100, max: 250 })
        .withMessage('Height must be between 100 and 250 cm')
];
exports.validateDailyGoals = [
    (0, express_validator_1.body)('userEmail')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('waterIntake')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('Water intake must be between 0 and 10 liters'),
    (0, express_validator_1.body)('sleepHours')
        .optional()
        .isFloat({ min: 0, max: 24 })
        .withMessage('Sleep hours must be between 0 and 24 hours'),
    (0, express_validator_1.body)('dietType')
        .optional()
        .isIn(['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'mediterranean', 'other'])
        .withMessage('Diet type must be one of: vegetarian, vegan, omnivore, keto, paleo, mediterranean, other'),
    (0, express_validator_1.body)('dailyCalorieTarget')
        .optional()
        .isInt({ min: 800, max: 5000 })
        .withMessage('Daily calorie target must be between 800 and 5000 calories')
];
exports.validateUpdateUserProfile = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),
    (0, express_validator_1.body)('age')
        .optional()
        .isInt({ min: 13, max: 120 })
        .withMessage('Age must be between 13 and 120 years'),
    (0, express_validator_1.body)('gender')
        .optional()
        .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
        .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
    (0, express_validator_1.body)('weight')
        .optional()
        .isFloat({ min: 20, max: 300 })
        .withMessage('Weight must be between 20 and 300 kg'),
    (0, express_validator_1.body)('height')
        .optional()
        .isFloat({ min: 100, max: 250 })
        .withMessage('Height must be between 100 and 250 cm')
];
exports.validateUpdateDailyGoals = [
    (0, express_validator_1.body)('waterIntake')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('Water intake must be between 0 and 10 liters'),
    (0, express_validator_1.body)('sleepHours')
        .optional()
        .isFloat({ min: 0, max: 24 })
        .withMessage('Sleep hours must be between 0 and 24 hours'),
    (0, express_validator_1.body)('dietType')
        .optional()
        .isIn(['vegetarian', 'vegan', 'omnivore', 'keto', 'paleo', 'mediterranean', 'other'])
        .withMessage('Diet type must be one of: vegetarian, vegan, omnivore, keto, paleo, mediterranean, other'),
    (0, express_validator_1.body)('dailyCalorieTarget')
        .optional()
        .isInt({ min: 800, max: 5000 })
        .withMessage('Daily calorie target must be between 800 and 5000 calories'),
    (0, express_validator_1.body)('completedTasks')
        .optional()
        .isArray()
        .withMessage('Completed tasks must be an array')
];
exports.validateWellnessPlanRequest = [
    (0, express_validator_1.body)('userEmail')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
];
//# sourceMappingURL=validation.js.map