"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
class ResponseHelper {
    static success(res, message, data, statusCode = 200) {
        const response = {
            success: true,
            message,
            data
        };
        res.status(statusCode).json(response);
    }
    static error(res, message, statusCode = 500, error) {
        const response = {
            success: false,
            message,
            error
        };
        res.status(statusCode).json(response);
    }
    static created(res, message, data) {
        this.success(res, message, data, 201);
    }
    static notFound(res, message = 'Resource not found') {
        this.error(res, message, 404);
    }
    static badRequest(res, message, error) {
        this.error(res, message, 400, error);
    }
    static unauthorized(res, message = 'Unauthorized access') {
        this.error(res, message, 401);
    }
    static forbidden(res, message = 'Access forbidden') {
        this.error(res, message, 403);
    }
    static conflict(res, message, error) {
        this.error(res, message, 409, error);
    }
    static tooManyRequests(res, message = 'Too many requests', retryAfter) {
        const response = {
            success: false,
            message,
            error: retryAfter ? `Please try again after ${retryAfter} seconds` : undefined
        };
        res.status(429).json(response);
    }
    static internalError(res, message = 'Internal server error', error) {
        this.error(res, message, 500, error);
    }
    static serviceUnavailable(res, message = 'Service temporarily unavailable') {
        this.error(res, message, 503);
    }
    static paginated(res, message, data, pagination) {
        const response = {
            success: true,
            message,
            data: {
                items: data,
                pagination
            }
        };
        res.json(response);
    }
    static validationError(res, errors) {
        const response = {
            success: false,
            message: 'Validation failed',
            error: errors.map(e => `${e.field}: ${e.message}`).join(', ')
        };
        res.status(400).json(response);
    }
    static custom(res, statusCode, success, message, data, error) {
        const response = {
            success,
            message,
            data,
            error
        };
        res.status(statusCode).json(response);
    }
}
exports.ResponseHelper = ResponseHelper;
//# sourceMappingURL=response.js.map