import { Request, Response, NextFunction } from 'express';
import { ApiResponse, CreateUserProfileRequest, UpdateUserProfileRequest } from '../types';
export declare class UserController {
    static createUserProfile(req: Request<{}, ApiResponse, CreateUserProfileRequest>, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getUserProfile(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static updateUserProfile(req: Request<{
        email: string;
    }, ApiResponse, UpdateUserProfileRequest>, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static deleteUserProfile(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getAllUserProfiles(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
    static getUserStats(req: Request, res: Response<ApiResponse>, next: NextFunction): Promise<void>;
}
//# sourceMappingURL=userController.d.ts.map