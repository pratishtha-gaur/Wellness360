import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const commonValidations: {
    email: ValidationChain;
    name: ValidationChain;
    age: ValidationChain;
    weight: ValidationChain;
    height: ValidationChain;
    gender: ValidationChain;
    waterIntake: ValidationChain;
    sleepHours: ValidationChain;
    dietType: ValidationChain;
    dailyCalorieTarget: ValidationChain;
    xp: ValidationChain;
    level: ValidationChain;
    date: ValidationChain;
    page: ValidationChain;
    limit: ValidationChain;
    days: ValidationChain;
    category: ValidationChain;
    emailParam: ValidationChain;
    levelParam: ValidationChain;
    taskName: ValidationChain;
    bonusXP: ValidationChain;
    reason: ValidationChain;
};
export declare const validationChains: {
    createUserProfile: ValidationChain[];
    updateUserProfile: ValidationChain[];
    createDailyGoals: ValidationChain[];
    updateDailyGoals: ValidationChain[];
    wellnessPlanRequest: ValidationChain[];
    xpOperations: ValidationChain[];
    levelRewards: ValidationChain[];
    addCompletedTask: ValidationChain[];
    addBonusXP: ValidationChain[];
    pagination: ValidationChain[];
    dateRange: ValidationChain[];
};
export declare const customValidations: {
    validateDateRange: (startDate: string, endDate: string) => boolean;
    validateEmailDomain: (email: string, allowedDomains: string[]) => boolean;
    validatePasswordStrength: (password: string) => boolean;
    validateBMIRange: (bmi: number) => boolean;
    validateCalorieRange: (calories: number, age: number, gender: string) => boolean;
};
export declare const createValidationMiddleware: (validations: ValidationChain[]) => (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[];
//# sourceMappingURL=validation.d.ts.map