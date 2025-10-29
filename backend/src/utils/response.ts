import { Response } from 'express';
import { ApiResponse } from '@/types';

export class ResponseHelper {
  // Success responses
  public static success<T>(res: Response, message: string, data?: T, statusCode: number = 200): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };
    res.status(statusCode).json(response);
  }

  // Error responses
  public static error(res: Response, message: string, statusCode: number = 500, error?: string): void {
    const response: ApiResponse = {
      success: false,
      message,
      error
    };
    res.status(statusCode).json(response);
  }

  // Created responses
  public static created<T>(res: Response, message: string, data?: T): void {
    this.success(res, message, data, 201);
  }

  // Not found responses
  public static notFound(res: Response, message: string = 'Resource not found'): void {
    this.error(res, message, 404);
  }

  // Bad request responses
  public static badRequest(res: Response, message: string, error?: string): void {
    this.error(res, message, 400, error);
  }

  // Unauthorized responses
  public static unauthorized(res: Response, message: string = 'Unauthorized access'): void {
    this.error(res, message, 401);
  }

  // Forbidden responses
  public static forbidden(res: Response, message: string = 'Access forbidden'): void {
    this.error(res, message, 403);
  }

  // Conflict responses
  public static conflict(res: Response, message: string, error?: string): void {
    this.error(res, message, 409, error);
  }

  // Too many requests responses
  public static tooManyRequests(res: Response, message: string = 'Too many requests', retryAfter?: number): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: retryAfter ? `Please try again after ${retryAfter} seconds` : undefined
    };
    res.status(429).json(response);
  }

  // Internal server error responses
  public static internalError(res: Response, message: string = 'Internal server error', error?: string): void {
    this.error(res, message, 500, error);
  }

  // Service unavailable responses
  public static serviceUnavailable(res: Response, message: string = 'Service temporarily unavailable'): void {
    this.error(res, message, 503);
  }

  // Paginated responses
  public static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    }
  ): void {
    const response: ApiResponse<{
      items: T[];
      pagination: typeof pagination;
    }> = {
      success: true,
      message,
      data: {
        items: data,
        pagination
      }
    };
    res.json(response);
  }

  // Validation error responses
  public static validationError(res: Response, errors: Array<{ field: string; message: string }>): void {
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      error: errors.map(e => `${e.field}: ${e.message}`).join(', ')
    };
    res.status(400).json(response);
  }

  // Custom response with custom status code
  public static custom<T>(
    res: Response,
    statusCode: number,
    success: boolean,
    message: string,
    data?: T,
    error?: string
  ): void {
    const response: ApiResponse<T> = {
      success,
      message,
      data,
      error
    };
    res.status(statusCode).json(response);
  }
}
