"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.handleUncaughtException = exports.handleUnhandledRejection = exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map((err) => err.message);
    const message = `Invalid input data: ${errors.join('. ')}`;
    return new AppError(message, 400);
};
const handleDuplicateKeyError = (error) => {
    const field = Object.keys(error.keyValue)[0];
    const message = `${field} already exists. Please use a different ${field}.`;
    return new AppError(message, 400);
};
const handleCastError = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new AppError(message, 400);
};
const handleJWTError = () => {
    return new AppError('Invalid token. Please log in again!', 401);
};
const handleJWTExpiredError = () => {
    return new AppError('Your token has expired! Please log in again.', 401);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    else {
        logger_1.logger.error('ERROR 💥', err);
        res.status(500).json({
            success: false,
            message: 'Something went wrong!',
        });
    }
};
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    }
    else {
        let error = { ...err };
        error.message = err.message;
        if (error.name === 'ValidationError')
            error = handleValidationError(error);
        if (error.code === 11000)
            error = handleDuplicateKeyError(error);
        if (error.name === 'CastError')
            error = handleCastError(error);
        if (error.name === 'JsonWebTokenError')
            error = handleJWTError();
        if (error.name === 'TokenExpiredError')
            error = handleJWTExpiredError();
        sendErrorProd(error, res);
    }
};
exports.errorHandler = errorHandler;
const handleUnhandledRejection = () => {
    process.on('unhandledRejection', (err) => {
        logger_1.logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
        logger_1.logger.error('Error details:', err);
        process.exit(1);
    });
};
exports.handleUnhandledRejection = handleUnhandledRejection;
const handleUncaughtException = () => {
    process.on('uncaughtException', (err) => {
        logger_1.logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
        logger_1.logger.error('Error details:', err);
        process.exit(1);
    });
};
exports.handleUncaughtException = handleUncaughtException;
const notFound = (req, res, next) => {
    const error = new AppError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map