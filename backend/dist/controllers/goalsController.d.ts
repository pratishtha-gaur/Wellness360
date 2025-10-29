import { Request, Response, NextFunction } from 'express';
import { ApiResponse, CreateDailyGoalsRequest, UpdateDailyGoalsRequest } from '../types';
export declare class GoalsController {
    static createDailyGoals(req: Request<{}, ApiResponse, CreateDailyGoalsRequest>, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getDailyGoals(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static updateDailyGoals(req: Request<{
        email: string;
    }, ApiResponse, UpdateDailyGoalsRequest>, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static addCompletedTask(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static removeCompletedTask(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getUserXPStats(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getGoalHistory(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static resetDailyGoals(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=goalsController.d.ts.map