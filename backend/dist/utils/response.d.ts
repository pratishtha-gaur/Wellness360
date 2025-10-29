import { Response } from 'express';
export declare class ResponseHelper {
    static success<T>(res: Response, message: string, data?: T, statusCode?: number): void;
    static error(res: Response, message: string, statusCode?: number, error?: string): void;
    static created<T>(res: Response, message: string, data?: T): void;
    static notFound(res: Response, message?: string): void;
    static badRequest(res: Response, message: string, error?: string): void;
    static unauthorized(res: Response, message?: string): void;
    static forbidden(res: Response, message?: string): void;
    static conflict(res: Response, message: string, error?: string): void;
    static tooManyRequests(res: Response, message?: string, retryAfter?: number): void;
    static internalError(res: Response, message?: string, error?: string): void;
    static serviceUnavailable(res: Response, message?: string): void;
    static paginated<T>(res: Response, message: string, data: T[], pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        limit: number;
    }): void;
    static validationError(res: Response, errors: Array<{
        field: string;
        message: string;
    }>): void;
    static custom<T>(res: Response, statusCode: number, success: boolean, message: string, data?: T, error?: string): void;
}
//# sourceMappingURL=response.d.ts.map