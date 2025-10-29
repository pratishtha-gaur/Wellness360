import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
export declare class WellnessController {
    static generateWellnessPlan(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getQuickTips(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getWellnessInsights(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getAIServiceStatus(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    private static generateRecommendations;
    private static analyzeTrends;
}
//# sourceMappingURL=wellnessController.d.ts.map