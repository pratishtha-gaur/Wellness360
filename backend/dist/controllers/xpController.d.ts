import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';
export declare class XPController {
    static getUserXPInfo(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getUserProgressSummary(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getAvailableAchievements(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static checkAchievements(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getLevelRewards(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getLeaderboard(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getXPHistory(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static addBonusXP(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=xpController.d.ts.map