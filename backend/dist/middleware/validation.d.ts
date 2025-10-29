import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUserProfile: ValidationChain[];
export declare const validateDailyGoals: ValidationChain[];
export declare const validateUpdateUserProfile: ValidationChain[];
export declare const validateUpdateDailyGoals: ValidationChain[];
export declare const validateWellnessPlanRequest: ValidationChain[];
//# sourceMappingURL=validation.d.ts.map