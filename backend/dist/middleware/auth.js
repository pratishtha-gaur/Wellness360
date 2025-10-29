"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = exports.optionalAuth = exports.authenticate = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const environment_1 = __importDefault(require("../config/environment"));
const generateToken = (email, userId) => {
    const payload = { email, userId };
    const secret = environment_1.default.jwtSecret;
    const options = { expiresIn: environment_1.default.jwtExpiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, environment_1.default.jwtSecret);
    }
    catch (error) {
        throw new errorHandler_1.AppError('Invalid or expired token', 401);
    }
};
exports.verifyToken = verifyToken;
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Access token required', 401);
        }
        const token = authHeader.substring(7);
        const decoded = (0, exports.verifyToken)(token);
        req.user = {
            email: decoded.email,
            userId: decoded.userId
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = (0, exports.verifyToken)(token);
            req.user = {
                email: decoded.email,
                userId: decoded.userId
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const authenticateAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Admin access token required', 401);
        }
        const token = authHeader.substring(7);
        const decoded = (0, exports.verifyToken)(token);
        const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
        if (!adminEmails.includes(decoded.email) && !decoded.email.includes('admin')) {
            throw new errorHandler_1.AppError('Admin access required', 403);
        }
        req.user = {
            email: decoded.email,
            userId: decoded.userId
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticateAdmin = authenticateAdmin;
//# sourceMappingURL=auth.js.map