import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                userId: string;
            };
        }
    }
}
interface JWTPayload {
    email: string;
    userId: string;
    iat: number;
    exp: number;
}
export declare const generateToken: (email: string, userId: string) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
export declare const authenticateAdmin: (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=auth.d.ts.map